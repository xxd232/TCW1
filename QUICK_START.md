# 🚀 TCW1 Quick Start Deployment Checklist

**Estimated Time:** 30 minutes setup + 24 hours DNS propagation

---

## ✅ Phase 1: Pre-Deployment (5 min)

- [ ] Have Azure account (free tier works)
- [ ] Have Cloudflare domain configured
- [ ] Have your domain name ready (e.g., mycryptoapp.com)
- [ ] Have Microsoft email address (Outlook or Microsoft 365)

---

## ✅ Phase 2: Local Preparation (5 min)

```bash
# 1. Update environment files
cp backend/.env.production.template backend/.env.production
cp frontend/.env.production.template frontend/.env.production

# 2. Edit both .env.production files with your values
# - YOUR_DOMAIN
# - MICROSOFT_EMAIL
# - APP_KEYS

# Frontend API base URL (important for login/signup)
# VITE_API_URL=https://api.yourdomain.com
```

---

## ✅ Phase 3: Azure Setup (10 min)

```bash
# Install Azure CLI (if not installed)
winget install Microsoft.AzureCLI
# or download from: https://docs.microsoft.com/cli/azure

# Login to Azure
az login

# Run deployment script
bash deploy.sh both

# This will:
# ✓ Create resource group
# ✓ Create App Service plan
# ✓ Deploy backend and frontend
# ✓ Set default environment variables
```

**After Script:**
- Note your Azure URLs:
  - Backend: `https://tcw1-backend.azurewebsites.net`
  - Frontend: `https://tcw1-frontend.azurewebsites.net`

---

## ✅ Phase 4: Configure Environment Variables (5 min)

**In Azure Portal:**

1. Go to `tcw1-backend` App Service
2. Click **Configuration** → **Application settings**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://yourdomain.com,https://www.yourdomain.com` |
| `PORT` | `3001` |
| `AZURE_COMMUNICATION_CONNECTION_STRING` | (from Azure Communication Services) |
| `SENDER_EMAIL` | `noreply@yourdomain.com` |

4. Click **Save** and wait for app to restart

5. Repeat for `tcw1-frontend` with:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `VITE_APP_NAME` | `TCW1` |
| `VITE_ENVIRONMENT` | `production` |

---

## ✅ Phase 5: Cloudflare DNS Setup (10 min)

**In Cloudflare Dashboard:**

1. Go to your domain → **DNS** tab
2. Add these records:

```
TYPE    NAME    CONTENT                              TTL     PROXY
CNAME   www     tcw1-frontend.azurewebsites.net     Auto    DNS only
CNAME   api     tcw1-backend.azurewebsites.net      Auto    DNS only
CNAME   @       tcw1-frontend.azurewebsites.net     Auto    DNS only
MX      @       outlook-com.olc.protection.outlook.com (Priority: 10)
TXT     @       v=spf1 outlook.com ~all
```

3. Note: DNS propagation takes 10 minutes - 24 hours

---

## ✅ Phase 6: Azure SSL Certificate (5 min)

**In Azure Portal:**

1. Go to `tcw1-frontend` → **Custom domains**
2. Click **Add custom domain**
3. Enter: `yourdomain.com`
4. Method: CNAME (follow wizard)
5. **TLS/SSL settings** → **Create App Service Managed Certificate**
6. **Bindings** → Add binding for `yourdomain.com` (HTTPS)

Repeat for `tcw1-backend` with: `api.yourdomain.com`

---

## ✅ Phase 7: Email Configuration (Optional - 5 min)

### Option A: Azure Communication Services (Recommended)
```bash
# In Azure Portal
# Create: "Azure Communication Services" resource

# In backend .env.production:
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...;accesskey=...
SENDER_EMAIL=noreply@yourdomain.com
```

### Option B: Outlook/Microsoft 365
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-app-password  # Not regular password
SENDER_EMAIL=noreply@yourdomain.com
```

---

## ✅ Phase 8: Testing (5 min)

```bash
# Wait for DNS propagation (check with)
nslookup yourdomain.com

# Test frontend
curl https://yourdomain.com

# Test backend API
curl https://api.yourdomain.com/health

# Test CORS
curl -H "Origin: https://yourdomain.com" https://api.yourdomain.com

# Check logs (Azure Portal)
# App Service > Log Stream
```

---

## 🎉 Done! Your app is now live!

| Component | URL |
|-----------|-----|
| **Frontend** | `https://yourdomain.com` |
| **API** | `https://api.yourdomain.com` |
| **Admin** | `https://portal.azure.com` |
| **Email** | `noreply@yourdomain.com` |

---

## 🚨 Common Issues & Fixes

### "Connection Refused"
```
Solution:
1. Check CORS_ORIGIN in App Service Configuration
2. Verify API URL in frontend (.env)
3. Check Azure logs: App Service > Log Stream
4. Restart app service: App Service > Restart
```

### "DNS Not Resolving"
```
Solution:
1. Wait 10-30 minutes for propagation
2. Verify DNS records in Cloudflare
3. Test: nslookup yourdomain.com
4. Use: https://dnschecker.org to verify propagation
```

### "SSL Certificate Error"
```
Solution:
1. Azure > App Service > TLS/SSL settings
2. Create managed certificate
3. Add binding for your domain
4. Cloudflare > SSL/TLS > Full (Strict)
```

### "Email Not Sending"
```
Solution:
1. Verify connection string in App Service config
2. Check sender email is validated in Azure
3. Review app logs for SMTP errors
4. Test SMTP: telnet smtp.office365.com 587
```

---

## 📞 Support & Resources

- **Azure Documentation:** https://docs.microsoft.com/azure/
- **Cloudflare DNS Guide:** https://developers.cloudflare.com/dns/
- **Node.js on Azure:** https://azure.microsoft.com/services/app-service/
- **Microsoft 365 Email:** https://support.microsoft.com/office/

---

### 🎯 Next Steps on Success
1. ✅ Set up auto-scaling in Azure
2. ✅ Enable Application Insights for monitoring
3. ✅ Configure GitHub Actions for CI/CD
4. ✅ Set up database backups
5. ✅ Monitor costs in Azure Cost Management
6. ✅ Create custom domain SSL certificate
7. ✅ Add rate limiting to API endpoints
8. ✅ Set up alerts for downtime

---

**Questions?** Check DEPLOYMENT.md and CLOUDFLARE_SETUP.md for detailed guides.

**Ready? Run:** `bash deploy.sh both` and follow the checklist! 🚀
