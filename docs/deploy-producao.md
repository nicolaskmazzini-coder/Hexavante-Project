# Deploy em produção — hexavante.com.br

Guia para publicar o Hexavante com domínio próprio em uma VPS (Ubuntu/Debian).

## Visão geral

```
Usuário → hexavante.com.br (DNS) → VPS (Nginx + SSL) → Docker (Next.js + MariaDB)
```

## 1. VPS

Contrate uma VPS (2 GB RAM mínimo recomendado), por exemplo:

- Hostinger, DigitalOcean, Contabo, Locaweb VPS

Anote o **IP público** da VPS (ex.: `203.0.113.10`).

## 2. DNS do domínio (Registro.br ou painel do provedor)

No painel DNS de `hexavante.com.br`, crie:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `@` | IP da VPS | 300 |
| A | `www` | IP da VPS | 300 |

Opcional (HexaSchools no futuro):

| Tipo | Nome | Valor |
|------|------|-------|
| A | `schools` | IP da VPS (ou outro servidor) |

Aguarde a propagação (5 min a 48 h). Teste: `ping hexavante.com.br`.

## 3. Preparar a VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
sudo usermod -aG docker $USER
# faça logout/login para usar docker sem sudo
```

## 4. Clonar e configurar o projeto

```bash
git clone https://github.com/nicolaskmazzini-coder/Hexavante-Project.git hexavante
cd hexavante
cp .env.production.example .env.production
nano .env.production   # preencha senhas e OAuth
```

Variáveis obrigatórias:

```env
AUTH_URL="https://hexavante.com.br"
AUTH_SECRET="..."          # openssl rand -base64 32
DB_ROOT_PASSWORD="..."
DB_PASSWORD="..."
```

## 5. Subir a aplicação

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Seed inicial (uma vez):

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

## 6. Nginx + HTTPS (Let's Encrypt)

```bash
sudo cp deploy/nginx-hexavante.conf /etc/nginx/sites-available/hexavante.com.br
sudo ln -s /etc/nginx/sites-available/hexavante.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d hexavante.com.br -d www.hexavante.com.br
```

O Certbot configura HTTPS automaticamente.

## 7. OAuth em produção

Atualize nos consoles **Google** e **GitHub**:

| Provedor | Callback |
|----------|----------|
| Google | `https://hexavante.com.br/api/auth/callback/google` |
| GitHub | `https://hexavante.com.br/api/auth/callback/github` |

No Google Cloud, adicione também `https://hexavante.com.br` em **Origens JavaScript autorizadas**.

## 8. Atualizar após mudanças no código

```bash
cd ~/hexavante
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Alternativa: Vercel (sem VPS)

1. Hospede o MariaDB em um serviço externo (Railway, Aiven, VPS só para DB).
2. Importe o repo na [Vercel](https://vercel.com).
3. Configure as variáveis de ambiente (`DATABASE_URL`, `AUTH_*`).
4. Em **Domains**, adicione `hexavante.com.br`.
5. No DNS, use os registros que a Vercel indicar (geralmente CNAME ou A).

## Checklist final

- [ ] `https://hexavante.com.br` abre a home
- [ ] Login com e-mail/senha funciona
- [ ] Login Google/GitHub funciona (se configurado)
- [ ] Cursos e matrícula funcionam
- [ ] `AUTH_URL` usa `https://` (não `http://`)
