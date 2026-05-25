#!/bin/bash
# setup-github.sh - Configura o repositório no GitHub e define as secrets
set -euo pipefail

REPO_NAME=${1:-}
DOMAIN=${2:-}

if [[ -z "$REPO_NAME" || -z "$DOMAIN" ]]; then
    echo "Uso: $0 <nome-do-repositorio> <dominio>"
    exit 1
fi

# Obter o usuário logado no GitHub para garantir o path completo do repo
GITHUB_USER=$(gh api user -q .login)
REPO_PATH="$GITHUB_USER/$REPO_NAME"

echo "🚀 Verificando/Criando repositório $REPO_PATH no GitHub..."
if ! gh repo view "$REPO_PATH" >/dev/null 2>&1; then
    gh repo create "$REPO_NAME" --public --confirm || echo "Aviso: Falha ao criar repositório, pode já existir."
else
    echo "✅ Repositório já existe no GitHub."
fi

# Inicializar git local se necessário
if [ ! -d .git ]; then
    echo "Initializing local git repository..."
    git init -b main
fi

# Adicionar remote origin se não existir (usando SSH)
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Adding remote origin (SSH)..."
    git remote add origin "git@github.com:$REPO_PATH.git"
fi

echo "⚙️ Configurando variáveis (Variables)..."
gh variable set DOMAIN --body "$DOMAIN" --repo "$REPO_PATH"

echo "🔐 Configurando segredos (Secrets)..."
echo "Por favor, insira as credenciais quando solicitado:"

# Função auxiliar para setar secret com check de erro
set_gh_secret() {
    local name=$1
    local value=$2
    gh secret set "$name" --body "$value" --repo "$REPO_PATH"
}

# Shared Account (Route53)
read -p "AWS_SHARED_ACCESS_KEY_ID: " shared_id
read -sp "AWS_SHARED_SECRET_ACCESS_KEY: " shared_key
echo ""
set_gh_secret AWS_SHARED_ACCESS_KEY_ID "$shared_id"
set_gh_secret AWS_SHARED_SECRET_ACCESS_KEY "$shared_key"

# Production Account (S3, CF, R53)
read -p "AWS_PROD_ACCESS_KEY_ID: " prod_id
read -sp "AWS_PROD_SECRET_ACCESS_KEY: " prod_key
echo ""
set_gh_secret AWS_PROD_ACCESS_KEY_ID "$prod_id"
set_gh_secret AWS_PROD_SECRET_ACCESS_KEY "$prod_key"

# Deploy Account (S3 Sync, Invalidation)
read -p "AWS_DEPLOY_ACCESS_KEY_ID (Enter para usar a mesma de PROD): " deploy_id
if [[ -z "$deploy_id" ]]; then
    set_gh_secret AWS_DEPLOY_ACCESS_KEY_ID "$prod_id"
    set_gh_secret AWS_DEPLOY_SECRET_ACCESS_KEY "$prod_key"
else
    read -sp "AWS_DEPLOY_SECRET_ACCESS_KEY: " deploy_key
    echo ""
    set_gh_secret AWS_DEPLOY_ACCESS_KEY_ID "$deploy_id"
    set_gh_secret AWS_DEPLOY_SECRET_ACCESS_KEY "$deploy_key"
fi

echo "✅ Setup do GitHub concluído!"
echo "Agora você pode fazer o push inicial:"
echo "git add ."
echo "git commit -m \"Initial commit with infra-as-code\""
echo "git push -u origin main"
