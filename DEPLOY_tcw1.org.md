# 🚀 TCW1.ORG - Quick Deployment Card

**Your personalized deployment commands for tcw1.org**

---

## ⚡ 1. Deploy to Azure (10 minutes)

```bash
# Login to Azure
az login

# Run deployment script
cd C:\Users\pc\TCW1
bash deploy.sh both

# Wait for completion... ✓
```

**Your Azure URLs (after deployment):**
- Backend: `https://tcw1-backend.azurewebsites.net`
- Frontend: `https://tcw1-frontend.azurewebsites.net`

---

## 🌐 2. Configure Cloudflare DNS (5 minutes)

**Login:** https://dash.cloudflare.com → Select **tcw1.org** → **DNS**

### Add These 5 Records:

```
1️⃣ Type: CNAME  |  Name: @    |  Content: tcw1-frontend.azurewebsites.net  |  Proxy: DNS only
2️⃣ Type: CNAME  |  Name: www  |  Content: tcw1-frontend.azurewebsites.net  |  Proxy: DNS only
3️⃣ Type: CNAME  |  Name: api  |  Content: tcw1-backend.azurewebsites.net   |  Proxy: DNS only
4️⃣ Type: MX     |  Name: @    |  Content: tcw1-org.mail.protection.outlook.com  |  Priority: 0
5️⃣ Type: TXT    |  Name: @    |  Content: v=spf1 include:spf.protection.outlook.com ~all
```

**⚠️ Important:** Set Proxy to "DNS only" (gray cloud), NOT orange!

---

## ⚙️ 3. Configure Environment Variables in Azure (5 minutes)

**Azure Portal:** https://portal.azure.com

### Backend App (tcw1-backend)

Go to: **App Services** → **tcw1-backend** → **Configuration** → **Application settings**

**Add these:**
```
NODE_ENV              = production
PORT                  = 3001
CORS_ORIGIN          = https://tcw1.org,https://www.tcw1.org
SENDER_EMAIL         = noreply@tcw1.org
ENABLE_CRYPTO        = true
ENABLE_EMAIL_NOTIFICATIONS = true
```

**For email (choose one):**

**Option A: Azure Communication Services**
```
AZURE_COMMUNICATION_CONNECTION_STRING = endpoint=https://...;accesskey=...
```

**Option B: Outlook Personal**
```
SMTP_HOST     = smtp-mail.outlook.com
SMTP_PORT     = 587
SMTP_USER     = your-email@outlook.com
SMTP_PASSWORD = your_app_password
```

Click **Save** → Wait for restart

### Frontend App (tcw1-frontend)

Go to: **App Services** → **tcw1-frontend** → **Configuration** → **Application settings**

**Add these:**
```
VITE_API_URL         = https://api.tcw1.org
VITE_APP_NAME        = TCW1
VITE_ENVIRONMENT     = production
VITE_SOCKET_IO_URL   = https://tcw1.org
```

**After saving:** restart the frontend app so the new VITE_API_URL is applied.

Click **Save** → Wait for restart

---

## 🔒 4. Add Custom Domains & SSL (10 minutes)

### Frontend Domain

**Azure Portal** → **tcw1-frontend** → **Custom domains**

1. Click **+ Add custom domain**
2. Enter: `tcw1.org` → **Validate** → **Add**
3. Click **+ Add custom domain**
4. Enter: `www.tcw1.org` → **Validate** → **Add**

### Backend Domain

**Azure Portal** → **tcw1-backend** → **Custom domains**

1. Click **+ Add custom domain**
2. Enter: `api.tcw1.org` → **Validate** → **Add**

### Create SSL Certificates

**For each app:**
1. **TLS/SSL settings** → **Private Key Certificates**
2. **Create App Service Managed Certificate**
3. Select your domain → **Create** (wait 5-10 min)
4. **Bindings** → **Add TLS/SSL Binding**
5. Choose certificate → **SNI SSL** → **Add**

---

## ⏱️ 5. Wait for DNS Propagation (10-30 minutes)

**Check progress:**
```bash
# Test DNS
nslookup tcw1.org
nslookup api.tcw1.org

# Or visit: https://dnschecker.org
# Enter: tcw1.org
```

---

## ✅ 6. Verify Everything Works

```bash
# Test API
curl https://api.tcw1.org/health
# Expected: {"status":"ok","timestamp":"..."}

# Test Frontend
curl https://tcw1.org
# Expected: HTML content

# Open in browser
https://tcw1.org
```

---

## 🎉 DONE! Your App is Live!

```
✅ Website:  https://tcw1.org
✅ API:      https://api.tcw1.org
✅ Email:    noreply@tcw1.org
✅ Status:   Production Ready
```

---

## 📞 Quick Commands Reference

### Monitor Health
```bash
cd C:\Users\pc\TCW1
bash monitor.sh tcw1.org
```

### View Logs
```bash
# Azure CLI
az webapp log tail --name tcw1-backend --resource-group tcw1-rg
az webapp log tail --name tcw1-frontend --resource-group tcw1-rg
```

### Restart Apps
```bash
az webapp restart --name tcw1-backend --resource-group tcw1-rg
az webapp restart --name tcw1-frontend --resource-group tcw1-rg
```

### Update Code
```bash
cd C:\Users\pc\TCW1
bash deploy.sh both
```

---

## 🚨 Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| **Blank page** | Check CORS_ORIGIN in backend config |
| **Can't reach API** | Wait for DNS (30 min), check gray cloud |
| **SSL error** | Create managed cert, add HTTPS binding |
| **Email fails** | Verify connection string, check logs |

**View logs:** Azure Portal → App Service → Log Stream

---

## 📚 Full Documentation

- **Quick Start:** `QUICK_START.md`
- **DNS Setup:** `DNS_SETUP_tcw1.org.md`
- **Full Guide:** `DEPLOYMENT.md`
- **Architecture:** `ARCHITECTURE.md`

---

## 💰 Estimated Monthly Cost

- **Azure Free Tier:** $0 (F1 App Service Plan)
- **Storage:** ~$1
- **Communication Services:** ~$0-5 (pay per use)
- **Cloudflare:** $0 (free plan)
- **Total:** ~$1-10/month

---

**Questions?** All config files are ready in `C:\Users\pc\TCW1\`

**Let's deploy!** Run: `bash deploy.sh both` 🚀
