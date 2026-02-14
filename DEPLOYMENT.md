# TCW1 Deployment Configuration

## 🚀 QUICK START - General Deployment Guide

### Prerequisites
1. Hosting provider account (e.g., Vercel, Netlify, Railway, etc.)
2. Cloudflare domain
3. Node.js 18+ installed locally

### Step 1: Build Your Applications

```bash
# Build backend
cd backend
npm ci
npm run build

# Build frontend
cd ../frontend
npm ci
npm run build
```

### Step 2: Configure Environment Variables

**Backend (.env)**
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
DB_URL=your_database_url
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com
```

### Step 3: Deploy Your Applications

Deploy the built files from `backend/dist` and `frontend/dist` to your hosting provider.

#### Option A: Vercel (Recommended for Frontend)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

#### Option B: Railway (Good for Backend)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

#### Option C: Netlify
```bash
cd frontend
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Step 4: Configure Cloudflare DNS

**For Backend API:**
- Type: CNAME
- Name: api
- Content: `your-backend-host.provider.com`
- TTL: Auto
- Proxy Status: Proxied (orange cloud)

**For Frontend:**
- Type: CNAME
- Name: www
- Content: `your-frontend-host.provider.com`
- TTL: Auto

**Root Domain:**
- Type: A or CNAME
- Content: Follow your hosting provider's instructions

### Step 5: Configure Email Service

#### Option A: SendGrid
```
SENDGRID_API_KEY=your_api_key
```

#### Option B: Mailgun
```
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=your_domain
```

#### Option C: SMTP (Gmail, Outlook, etc.)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password
```

### Step 6: SSL/TLS Certificate

Most hosting providers (Vercel, Netlify, Railway) automatically provide SSL certificates.

In Cloudflare: SSL/TLS > Full (Strict)

---

## 📧 Email Setup

### Add Email to Your App

**Create: backend/src/services/email.service.ts**

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTransactionEmail(
  userEmail: string,
  amount: number,
  currency: string,
  recipient: string
) {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: userEmail,
    subject: `Payment Sent: ${amount} ${currency}`,
    html: `
      <h2>Payment Confirmation</h2>
      <p>Amount: ${amount} ${currency}</p>
      <p>Recipient: ${recipient}</p>
      <p>Thank you for using TCW1!</p>
    `,
  });
}
```

Install package:
```bash
npm install nodemailer
```

---

## 🔐 Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your domain
- [ ] Store secrets in environment variables (not .env files in production)
- [ ] Enable SSL/TLS (HTTPS only)
- [ ] Set HTTPS redirect in Cloudflare
- [ ] Enable firewall rules for API
- [ ] Add rate limiting to endpoints
- [ ] Use environment-specific configs

---

## 🚨 Troubleshooting

**App shows blank?**
- Check: Hosting provider logs
- Check: Browser Console for CORS errors

**Can't connect to backend?**
- Verify CORS_ORIGIN matches your domain
- Check: Cloudflare DNS is pointing correctly
- Test: `curl https://api.yourdomain.com/health`

**Email not sending?**
- Verify SMTP credentials
- Check: Email service provider status
- Check: Environment variables are set correctly

---

## ✅ What's Next After Deployment?

1. ✅ Set up monitoring (e.g., Sentry, LogRocket)
2. ✅ Configure CI/CD with GitHub Actions
3. ✅ Enable backup for database
4. ✅ Add custom domain SSL certificate
5. ✅ Set up email notifications for transactions
