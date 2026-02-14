# 🚀 TCW1 Deployment Guide - Complete Instructions

**Hosting TCW1 on Azure with Cloudflare Domain + Microsoft Email**

---

## 📖 Documentation Files Included

You have been provided with **4 deployment guides** in your project:

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICK_START.md** | Fast 30-minute setup checklist | 5 min |
| **DEPLOYMENT.md** | Detailed deployment instructions | 15 min |
| **CLOUDFLARE_SETUP.md** | DNS configuration & email setup | 10 min |
| **azure-deploy.json** | Configuration reference | Reference |

### 💡 **Start Here:**
1. **First time?** → Read **QUICK_START.md** ⚡
2. **Need details?** → Read **DEPLOYMENT.md** 📚
3. **DNS problems?** → Read **CLOUDFLARE_SETUP.md** 🌐

---

## 🎯 What You're Getting

### TCW1 Application Features
✅ Cryptocurrency Wallet (BTC, ETH, USDT)
✅ PayPal Integration
✅ Real-time Chat & Video Calls (WebRTC)
✅ Transaction History & Analytics
✅ Friend Management
✅ Crypto Price Charts
✅ Animated UI with Toast Notifications

### Deployment Stack
```
Internet
   ↓
Cloudflare (DNS Proxy)
   ↓
Azure App Service (HTTPS)
   ↓
├─ Frontend (React 18 + Vite)
├─ Backend (Node.js 18 + Express)
├─ WebSocket (Socket.io)
└─ Email (Microsoft/Azure Communication)
```

---

## ⚡ Quick Start (Under 30 Minutes)

### **Step 1: Prerequisites Check**
```bash
# Check Node.js version
node --version  # Should be v18+

# Check Azure CLI
az --version    # If missing: winget install Microsoft.AzureCLI

# Check your domain
# Log into https://dash.cloudflare.com
# Note down: yourdomain.com
```

### **Step 2: Clone & Prepare**
```bash
# You should already have the project
cd TCW1

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### **Step 3: Deploy (One Command)**
```bash
# Login to Azure
az login

# Deploy everything
bash deploy.sh both

# ✅ Done! Your apps are now deployed
# Note URLs:
# - Backend: https://tcw1-backend.azurewebsites.net
# - Frontend: https://tcw1-frontend.azurewebsites.net
```

### **Step 4: Configure Your Domain**
Go to https://dash.cloudflare.com and add these DNS records:

```
🟠 CNAME    www  →  tcw1-frontend.azurewebsites.net
🟠 CNAME    api  →  tcw1-backend.azurewebsites.net
🟠 CNAME    @    →  tcw1-frontend.azurewebsites.net
```

**Wait 10-30 minutes for DNS to propagate**, then test:
```bash
# Test in any browser
https://yourdomain.com      # Should show TCW1 app
https://api.yourdomain.com  # Should show {"status":"ok"}
```

✅ **That's it! Your app is live!**

---

## 🔄 Complete Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  YOUR LOCAL MACHINE                         │
├─────────────────────────────────────────────────────────────┤
│ Fork repo                                                    │
│ npm install (backend + frontend)                            │
│ Update .env files with your settings                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    AZURE CLOUD                              │
├─────────────────────────────────────────────────────────────┤
│ App Service (Backend)     │  App Service (Frontend)         │
│ ├─ Port 3001              │  ├─ Port 3000 (React)          │
│ ├─ Node.js 18             │  ├─ Node.js 18                 │
│ ├─ Express API            │  ├─ Vite Dev Server            │
│ ├─ Socket.io              │  └─ Client Side JS             │
│ └─ Database               │                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE (DNS)                           │
├─────────────────────────────────────────────────────────────┤
│ yourdomain.com       → tcw1-frontend.azurewebsites.net      │
│ api.yourdomain.com   → tcw1-backend.azurewebsites.net       │
│ noreply@yourdomain   → Microsoft 365 / Outlook             │
└─────────────────────────────────────────────────────────────┘
                           ↓
                      INTERNET USERS
```

---

## 📝 Environment Variables Reference

### Backend (.env.production)
```env
# Server
PORT=3001
NODE_ENV=production

# CORS - CHANGE THIS!
CORS_ORIGIN=https://yourdomain.com

# Email - Choose one option:

# Option 1: Azure Communication Services (RECOMMENDED)
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...;accesskey=...
SENDER_EMAIL=noreply@yourdomain.com

# Option 2: Outlook/Microsoft 365
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your_app_password
```

### Frontend (.env.production)
```env
# API Configuration - CHANGE THIS!
VITE_API_URL=https://api.yourdomain.com

# Other settings
VITE_APP_NAME=TCW1
VITE_ENVIRONMENT=production
```

---

## 🆘 Troubleshooting Guide

### Problem: "Application shows blank page"
```
Check:
1. Browser console (F12) for CORS errors
2. Azure App Service > Log Stream
3. Verify CORS_ORIGIN matches your domain

Fix:
# Set correct CORS_ORIGIN
Azure Portal → tcw1-backend → Configuration → CORS_ORIGIN
= https://yourdomain.com

# Restart app
App Service > Restart
```

### Problem: "Login/Signup fails"
```
Check:
1. Frontend VITE_API_URL points to your backend (e.g., https://api.yourdomain.com)
2. Frontend is rebuilt/redeployed after changing VITE_API_URL
3. API health endpoint works: https://api.yourdomain.com/health

Fix:
# Set correct VITE_API_URL
Azure Portal → tcw1-frontend → Configuration → VITE_API_URL
= https://api.yourdomain.com

# Restart app
App Service > Restart
```

### Problem: "Can't reach api.yourdomain.com"
```
Check:
1. nslookup api.yourdomain.com
   (should show tcw1-backend.azurewebsites.net)

2. Wait for DNS (can take 24 hours)
   https://dnschecker.org (check propagation)

3. Cloudflare is set to "DNS only" (not orange cloud)
```

### Problem: "SSL certificate not found"
```
Fix:
1. Azure Portal → tcw1-frontend
2. TLS/SSL settings → Create managed certificate
3. Custom domains → Add yourdomain.com
4. Bindings → HTTPS binding

Wait 10-15 minutes for certificate generation
```

### Problem: "Email not sending"
```
Check:
1. Verify connection string in App Service config
2. Test SMTP credentials if using Outlook
3. Check spam folder
4. Review app logs: App Service > Log Stream

If using Azure Communication Services:
- Verify sender email in resource
- Confirm in correct region
- Check quota limits
```

---

## 📊 Monitoring & Maintenance

### Check Application Health
```bash
# Status
curl https://api.yourdomain.com/health

# View Logs (Azure Portal)
App Service > Log Stream

# Monitor Performance
App Service > Metrics > Response time, CPU, Memory

# Set Alerts
Monitoring > Alerts > Create alert rule
```

### Common Monitoring Points
| Metric | Threshold | Alert |
|--------|-----------|-------|
| Response Time | > 2 seconds | ⚠️ |
| Error Rate | > 5% | 🔴 |
| CPU Usage | > 80% | ⚠️ |
| Memory | > 90% | 🔴 |

---

## 💰 Cost Estimation

### Azure (Monthly)
- **App Service Plan (F1 Free):** $0
- **Storage:** ~$1
- **Application Insights:** ~$1 (first 1GB free)
- **Communication Services:** Pay as you go (~$0.002 per email)
- **Total:** $15-30/month

### Cloudflare
- **Free Plan:** $0 (DNS only)
- **Pro Plan:** $20/month (with advanced features)

**Total Estimated Cost:** $20-50/month

---

## 🔐 Security Best Practices

### ✅ Do This
- [x] Use HTTPS only
- [x] Store secrets in Azure Key Vault (not .env)
- [x] Enable firewall rules
- [x] Set CORS to specific domain only
- [x] Use environment-specific configs
- [x] Add rate limiting to API
- [x] Enable MFA for Azure account

### ❌ Don't Do This
- [ ] Commit .env files to git
- [ ] Use default passwords
- [ ] Allow CORS from `*` (everyone)
- [ ] Run without SSL certificate
- [ ] Share API keys in code
- [ ] Disable security headers

---

## 🚀 Next Steps After Deployment

### Week 1: Setup
- [ ] Configure email system
- [ ] Set up monitoring & alerts
- [ ] Test all features thoroughly
- [ ] Get SSL working correctly

### Week 2: Optimize
- [ ] Set up auto-scaling
- [ ] Enable Application Insights
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline

### Week 3: Scale
- [ ] Monitor costs
- [ ] Optimize database queries
- [ ] Add caching layer
- [ ] Plan for growth

---

## 📞 Getting Help

| Issue | Resource |
|-------|----------|
| **Azure Questions** | https://docs.microsoft.com/azure/ |
| **Cloudflare DNS** | https://developers.cloudflare.com/dns/ |
| **Node.js + Express** | https://expressjs.com/docs |
| **React/Vite** | https://vitejs.dev/guide/ |
| **Socket.io** | https://socket.io/docs/ |

---

## 📋 Final Checklist

Before going live, verify:

- [ ] Azure account created & logged in
- [ ] TCW1 project cloned locally
- [ ] Backend & frontend apps deployed to Azure
- [ ] Cloudflare domain points to Azure
- [ ] DNS records added (CNAME for api, www, @)
- [ ] CORS_ORIGIN set to your domain
- [ ] SSL certificate created
- [ ] Email configuration complete
- [ ] Health check working: curl https://api.yourdomain.com/health
- [ ] App loads when visiting: https://yourdomain.com
- [ ] Chat/video features working
- [ ] Email sending working

---

## 🎉 Success!

Once all checklist items are complete, your TCW1 app is **production-ready**!

```
┌────────────────────────────────────────────────┐
│   Your TCW1 app is now LIVE! 🎉                │
├────────────────────────────────────────────────┤
│ Frontend: https://yourdomain.com               │
│ API:      https://api.yourdomain.com           │
│ Email:    noreply@yourdomain.com               │
│ Status:   ✅ Production                         │
└────────────────────────────────────────────────┘
```

### Share Your Success
Your app is now:
- ✅ Accessible from anywhere
- ✅ Using professional domain
- ✅ Sending emails through Microsoft
- ✅ Running on Azure's secure servers
- ✅ Backed by Cloudflare's global CDN

---

**Questions?** Refer to the detailed guides:
- QUICK_START.md (fastest setup)
- DEPLOYMENT.md (comprehensive guide)
- CLOUDFLARE_SETUP.md (DNS & email)

**Ready to deploy?** Run: `bash deploy.sh both` 🚀
