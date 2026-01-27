# 🔐 Security Best Practices for Rukny.io

## ⚠️ Critical: Exposed Secrets

If you've accidentally committed secrets to Git, you **MUST**:

1. **Immediately rotate all exposed credentials:**
   - [ ] Neon Database password
   - [ ] JWT_SECRET
   - [ ] TWO_FACTOR_ENCRYPTION_KEY
   - [ ] INTERNAL_API_SECRET
   - [ ] Google OAuth credentials
   - [ ] LinkedIn OAuth credentials
   - [ ] AWS credentials
   - [ ] SMTP password
   - [ ] WhatsApp API tokens

2. **Remove secrets from Git history** using BFG Repo-Cleaner or git filter-branch

## 🛡️ Environment Security

### Development (.env.development)
- Use local/test database
- Use test OAuth credentials
- Disable sensitive features

### Staging (.env.staging)
- Use separate staging database
- Use staging OAuth apps
- Enable logging for debugging

### Production (.env.production)
- **NEVER** commit to repository
- Store in:
  - GitHub Secrets (for CI/CD)
  - Vercel/Railway environment variables
  - Vault/Secret Manager

## 🔑 Generating Secure Keys

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate TWO_FACTOR_ENCRYPTION_KEY
openssl rand -hex 32

# Generate INTERNAL_API_SECRET
openssl rand -hex 32
```

## 📋 GitHub Secrets Setup

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description |
|------------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `TWO_FACTOR_ENCRYPTION_KEY` | 2FA encryption key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `NEXT_PUBLIC_API_URL` | Production API URL |

## 🚀 Deployment Environments

### Vercel (Frontend - apps/web)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure production domain

### Railway/Render (Backend - apps/api)
1. Connect GitHub repository
2. Set environment variables
3. Configure start command: `npm run start:prod`

### Neon (Database)
1. Use your org: `org-summer-shadow-02533552`
2. Use project: `snowy-feather-51377366`
3. Enable connection pooling for production

## 🔒 Additional Security Measures

### 1. Branch Protection
- Require PR reviews before merging to main
- Require status checks to pass
- No direct pushes to main

### 2. Dependabot
Enable automatic security updates:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### 3. Code Scanning
Enable GitHub CodeQL for security analysis

### 4. Rate Limiting
Already configured in API - ensure it's enabled in production

### 5. CORS Configuration
Restrict to your domains only in production

## ✅ Pre-deployment Checklist

- [ ] All secrets rotated
- [ ] .gitignore includes all .env files
- [ ] GitHub Secrets configured
- [ ] Branch protection enabled
- [ ] SSL/HTTPS configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Logging configured (no sensitive data)
- [ ] Database backups enabled
