#!/bin/bash
set -euo pipefail

COMMAND=${1:-}
DOMAIN=${DOMAIN:-}
REGION="us-east-1"

log() { echo "[INFO] $1"; }
error() { echo "[ERROR] $1"; exit 1; }

# 1. Provisionar S3
provision_s3() {
    log "Provisioning S3 bucket: $DOMAIN"
    if ! aws s3api head-bucket --bucket "$DOMAIN" 2>/dev/null; then
        aws s3 mb "s3://$DOMAIN" --region "$REGION"
        aws s3 website "s3://$DOMAIN" --index-document index.html --error-document index.html
        aws s3api put-public-access-block --bucket "$DOMAIN" --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
        local policy="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"PublicReadGetObject\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::$DOMAIN/*\"}]}"
        aws s3api put-bucket-policy --bucket "$DOMAIN" --policy "$policy"
    else
        log "Bucket $DOMAIN already exists."
    fi
}

# 2. Criar Hosted Zone (Necessário antes do ACM)
provision_zone() {
    log "Ensuring Hosted Zone exists for $DOMAIN"
    local zone_id
    zone_id=$(aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN" --query "HostedZones[?Name=='$DOMAIN.'].Id" --output text | cut -d'/' -f3)
    
    if [[ -z "$zone_id" || "$zone_id" == "None" ]]; then
        zone_id=$(aws route53 create-hosted-zone --name "$DOMAIN" --caller-reference "$(date +%s)" --query HostedZone.Id --output text | cut -d'/' -f3)
        log "Hosted Zone created: $zone_id"
    else
        log "Hosted Zone already exists: $zone_id"
    fi
    echo "$zone_id" > .zone_id
    aws route53 get-hosted-zone --id "$zone_id" --query DelegationSet.NameServers --output json > .ns_records
}

# 3. Solicitar ACM e Validar
provision_acm() {
    log "Requesting ACM Certificate for $DOMAIN"
    local cert_arn
    cert_arn=$(aws acm list-certificates --region "$REGION" --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" --output text)
    
    if [[ -z "$cert_arn" || "$cert_arn" == "None" ]]; then
        cert_arn=$(aws acm request-certificate --domain-name "$DOMAIN" --validation-method DNS --region "$REGION" --query CertificateArn --output text)
        log "Certificate requested: $cert_arn"
    fi
    echo "$cert_arn" > .acm_arn

    log "Waiting for validation records to be available..."
    sleep 10
    
    local validation_data
    validation_data=$(aws acm describe-certificate --certificate-arn "$cert_arn" --region "$REGION" --query "Certificate.DomainValidationOptions[0].ResourceRecord" --output json)
    
    local name=$(echo "$validation_data" | jq -r .Name)
    local value=$(echo "$validation_data" | jq -r .Value)
    local zone_id=$(cat .zone_id)

    log "Adding validation record to Route53..."
    local change_batch="{\"Changes\": [{\"Action\": \"UPSERT\", \"ResourceRecordSet\": {\"Name\": \"$name\", \"Type\": \"CNAME\", \"TTL\": 60, \"ResourceRecords\": [{\"Value\": \"$value\"}]}}]}"
    aws route53 change-resource-record-sets --hosted-zone-id "$zone_id" --change-batch "$change_batch"

    log "Waiting for certificate validation (this can take up to 5-10 mins)..."
    aws acm wait certificate-validated --certificate-arn "$cert_arn" --region "$REGION"
    log "Certificate is VALIDATED."
}

# 4. Criar CloudFront (Só roda após ACM Issued)
provision_cf() {
    log "Provisioning CloudFront for $DOMAIN"
    local dist_id
    dist_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[0]=='$DOMAIN'].Id" --output text)
    
    if [[ -z "$dist_id" || "$dist_id" == "None" ]]; then
        local cert_arn=$(cat .acm_arn)
        local config="{
            \"CallerReference\": \"$(date +%s)\",
            \"Aliases\": { \"Quantity\": 1, \"Items\": [\"$DOMAIN\"] },
            \"DefaultRootObject\": \"index.html\",
            \"Origins\": {
                \"Quantity\": 1,
                \"Items\": [{
                    \"Id\": \"S3-$DOMAIN\",
                    \"DomainName\": \"$DOMAIN.s3-website-$REGION.amazonaws.com\",
                    \"CustomOriginConfig\": { \"HTTPPort\": 80, \"HTTPSPort\": 443, \"OriginProtocolPolicy\": \"http-only\" }
                }]
            },
            \"DefaultCacheBehavior\": {
                \"TargetOriginId\": \"S3-$DOMAIN\",
                \"ForwardedValues\": { \"QueryString\": false, \"Cookies\": { \"Forward\": \"none\" } },
                \"TrustedSigners\": { \"Enabled\": false, \"Quantity\": 0 },
                \"ViewerProtocolPolicy\": \"redirect-to-https\",
                \"MinTTL\": 0
            },
            \"Comment\": \"Static Hosting for $DOMAIN\",
            \"Enabled\": true,
            \"ViewerCertificate\": {
                \"ACMCertificateArn\": \"$cert_arn\",
                \"SSLSupportMethod\": \"sni-only\",
                \"MinimumProtocolVersion\": \"TLSv1.2_2021\"
            }
        }"
        dist_id=$(aws cloudfront create-distribution --distribution-config "$config" --query Distribution.Id --output text)
        log "CloudFront distribution created: $dist_id"
    else
        log "CloudFront distribution already exists: $dist_id"
    fi
}

# 5. Criar Alias DNS para CloudFront
provision_dns_alias() {
    log "Creating Route53 Alias for CloudFront"
    local zone_id=$(cat .zone_id)
    local cf_domain=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[0]=='$DOMAIN'].DomainName" --output text)
    
    local change_batch="{
        \"Changes\": [
            { \"Action\": \"UPSERT\", \"ResourceRecordSet\": { \"Name\": \"$DOMAIN\", \"Type\": \"A\", \"AliasTarget\": { \"HostedZoneId\": \"Z2FDTNDATAQYW2\", \"DNSName\": \"$cf_domain\", \"EvaluateTargetHealth\": false } } }
        ]
    }"
    aws route53 change-resource-record-sets --hosted-zone-id "$zone_id" --change-batch "$change_batch"
}

case "$COMMAND" in
    provision_s3) provision_s3 ;;
    provision_zone) provision_zone ;;
    provision_acm) provision_acm ;;
    provision_cf) provision_cf ;;
    provision_dns_alias) provision_dns_alias ;;
    *) error "Usage: $0 {provision_s3|provision_zone|provision_acm|provision_cf|provision_dns_alias}" ;;
esac
