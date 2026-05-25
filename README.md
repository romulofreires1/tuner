# tuner

Projeto gerado via **static-deploy (Padrão Novello)**.

## 🚀 Deploy e Infraestrutura

Este projeto utiliza uma arquitetura multi-conta AWS com deploy automatizado via GitHub Actions.

### Setup Inicial (Obrigatório)

Para que o CI consiga criar a infraestrutura, você deve rodar o script de configuração do GitHub uma única vez:

```bash
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh "tuner" "tuner.appsrom.click"
```

O script irá solicitar as credenciais das contas **Shared**, **Produção** e **Deploy**.

### Fluxo de CI/CD

Ao fazer um `push` para a branch `main`:
1. **Infra**: O GitHub Actions verifica/cria a Hosted Zone, realiza a delegação DNS, valida o certificado SSL (ACM) e provisiona o S3/CloudFront.
2. **Build**: A aplicação Next.js é exportada como estática (`next export`).
3. **Deploy**: Os arquivos são sincronizados com o S3 e o cache do CloudFront é invalidado.

## 💻 Desenvolvimento Local

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Estilo**: Tailwind CSS
- **Infra**: AWS (S3, CloudFront, Route53, ACM)
- **CI/CD**: GitHub Actions
