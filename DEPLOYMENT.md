# TCW1 Deployment Configuration

## 🚀 QUICK START - Deploy to Azure App Service

### Prerequisites
1. Azure account (free tier available)
2. Cloudflare domain
3. Node.js 18+ installed locally

### Step 1: Create Azure App Service

```bash
# Login to Azure CLI
az login

# Create resource group
az group create --name tcw1-rg --location eastus

# Create App Service Plan (free tier)
az appservice plan create \
  --name tcw1-plan \
  --resource-group tcw1-rg \
  --sku F1 \
  --is-linux

# Create backend app
az webapp create \
  --resource-group tcw1-rg \
  --plan tcw1-plan \
  --name tcw1-backend \
  --runtime "NODE|18-lts"

# Create frontend app
az webapp create \
  --resource-group tcw1-rg \
  --plan tcw1-plan \
  --name tcw1-frontend \
  --runtime "NODE|18-lts"
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
VITE_API_URL=https://tcw1-backend.azurewebsites.net
```

### Step 3: Deploy from Git

```bash
# Initialize git in project root
cd TCW1
git init

# Add Azure remote
az webapp deployment source config-zip \
  --resource-group tcw1-rg \
  --name tcw1-backend \
  --src backend.zip

# Or use GitHub Actions (recommended)
# See: github-deployment.yml
```

### Step 4: Configure Cloudflare DNS

**For Backend API:**
- Type: CNAME
- Name: api
- Content: `tcw1-backend.azurewebsites.net`
- TTL: Auto
- Proxy Status: Proxied (orange cloud) ⚠️ May need DNS only

**For Frontend:**
- Type: CNAME
- Name: www
- Content: `tcw1-frontend.azurewebsites.net`
- TTL: Auto

**Root Domain:**
- Type: A
- Content: Use Cloudflare's A record setup
- Or CNAME: `tcw1-frontend.azurewebsites.net`

### Step 5: Configure Microsoft Email

#### Option A: Outlook.com Personal
```
SMTP Server: smtp-mail.outlook.com
SMTP Port: 587
Email: your-email@outlook.com
Password: Your App Password (not regular password)
```

#### Option B: Microsoft 365 Business
```
SMTP Server: smtp.office365.com
SMTP Port: 587
Email: your-email@yourdomain.com
Password: Your Microsoft account password
```

#### Option C: Azure Communication Services (Recommended)
```bash
# Create Azure Communication Services resource
az communication-service create \
  --name tcw1-email \
  --resource-group tcw1-rg \
  --location eastus
```

### Step 6: Environment Variables in Azure Portal

Navigate to: App Service > Configuration > Application settings

Add:
- `AZURE_COMMUNICATION_CONNECTION_STRING`
- `SENDER_EMAIL`
- `CORS_ORIGIN`
- `NODE_ENV=production`

### Step 7: SSL/TLS Certificate

1. In Azure: App Service > TLS/SSL settings
2. Add managed certificate for your domain
3. In Cloudflare: SSL/TLS > Full (Strict)

---

## 🌐 Alternative: Vercel + Azure VM

### Frontend on Vercel (Free)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Backend on Azure VM
```bash
# Create VM
az vm create \
  --resource-group tcw1-rg \
  --name tcw1-vm \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys

# SSH into VM and deploy Node.js app
ssh azureuser@<vm-ip>
git clone your-repo
cd TCW1/backend
npm ci --production
npm start  # Use PM2 for process management
```

---

## 📧 Email Setup with Microsoft

### Add Email to Your App

**Create: backend/src/services/email.service.ts**

```typescript
import { EmailClient } from "@azure/communication-email";

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING!;
const client = new EmailClient(connectionString);

export async function sendTransactionEmail(
  userEmail: string,
  amount: number,
  currency: string,
  recipient: string
) {
  await client.send({
    senderAddress: process.env.SENDER_EMAIL!,
    recipients: {
      to: [{ address: userEmail }],
    },
    content: {
      subject: `Payment Sent: ${amount} ${currency}`,
      html: `
        <h2>Payment Confirmation</h2>
        <p>Amount: ${amount} ${currency}</p>
        <p>Recipient: ${recipient}</p>
        <p>Thank you for using TCW1!</p>
      `,
    },
  });
}
```

Install package:
```bash
npm install @azure/communication-email
```

---

## 🔐 Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your domain
- [ ] Store secrets in Azure Key Vault (not .env)
- [ ] Enable SSL/TLS (HTTPS only)
- [ ] Set HTTPS redirect in Cloudflare
- [ ] Enable firewall rules for API
- [ ] Add rate limiting to endpoints
- [ ] Use environment-specific configs

---

## 🚨 Troubleshooting

**App shows blank?**
- Check: Azure > Monitoring > Log Stream
- Check: Browser Console for CORS errors

**Can't connect to backend?**
- Verify CORS_ORIGIN matches your domain
- Check: Cloudflare DNS is pointing correctly
- Test: `curl https://api.yourdomain.com/health`

**Email not sending?**
- Verify connection string in Azure Portal
- Check: Sender email is verified
- Check: App Service managed identity has permissions

---

## ✅ What's Next After Deployment?

1. ✅ Set up auto-scaling (important for production)
2. ✅ Configure application insights for monitoring
3. ✅ Set up CI/CD with GitHub Actions
4. ✅ Enable backup for database
5. ✅ Add custom domain SSL certificate
6. ✅ Set up email notifications for transactions
