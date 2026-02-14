# 🚀 TCW1 Deployment Guide - Complete Instructions

**Hosting TCW1 with Cloudflare Domain**

---

## 📖 Documentation Files Included

You have been provided with **deployment guides** in your project:

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICK_START.md** | Fast 30-minute setup checklist | 5 min |
| **DEPLOYMENT.md** | Detailed deployment instructions | 15 min |
| **CLOUDFLARE_SETUP.md** | DNS configuration & email setup | 10 min |

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
Your Hosting Provider (HTTPS)
   ↓
├─ Frontend (React 18 + Vite)
├─ Backend (Node.js 18 + Express)
├─ WebSocket (Socket.io)
└─ Email (SMTP/Email Service)
```

---

## ⚡ Quick Start (Under 30 Minutes)

### **Step 1: Prerequisites Check**
```bash
# Check Node.js version
node --version  # Should be v18+

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

### **Step 3: Build Your Applications**
```bash
# Build everything
bash deploy.sh both

# ✅ Done! Your apps are now built
# Deploy the dist/ folders to your hosting provider
```

### **Step 4: Configure Your Domain**
Go to https://dash.cloudflare.com and add these DNS records:

```
🟠 CNAME    www  →  your-frontend-host.provider.com
🟠 CNAME    api  →  your-backend-host.provider.com
🟠 CNAME    @    →  your-frontend-host.provider.com
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
│                YOUR HOSTING PROVIDER                         │
├─────────────────────────────────────────────────────────────┤
│ Backend Service           │  Frontend Service               │
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
│ yourdomain.com       → your-frontend-host.provider.com      │
│ api.yourdomain.com   → your-backend-host.provider.com       │
│ noreply@yourdomain   → Your Email Service                   │
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

# Option 1: SMTP (Gmail, Outlook, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
SENDER_EMAIL=noreply@yourdomain.com

# Option 2: SendGrid
SENDGRID_API_KEY=your_api_key

# Option 3: Mailgun
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=your_domain
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
2. Hosting provider logs
3. Verify CORS_ORIGIN matches your domain

Fix:
# Set correct CORS_ORIGIN
Check your hosting provider's environment variable settings
Set CORS_ORIGIN = https://yourdomain.com

# Restart app
Restart your hosting service
```

### Problem: "Login/Signup fails"
```
Check:
1. Frontend VITE_API_URL points to your backend (e.g., https://api.yourdomain.com)
2. Frontend is rebuilt/redeployed after changing VITE_API_URL
3. API health endpoint works: https://api.yourdomain.com/health

Fix:
# Set correct VITE_API_URL
Update environment variable to: https://api.yourdomain.com

# Rebuild and redeploy frontend
cd frontend && npm run build
```

### Problem: "Can't reach api.yourdomain.com"
```
Check:
1. nslookup api.yourdomain.com
   (should show your hosting provider's domain)

2. Wait for DNS (can take 24 hours)
   https://dnschecker.org (check propagation)

3. Cloudflare is configured correctly
```

### Problem: "SSL certificate not found"
```
Fix:
Most hosting providers (Vercel, Netlify, Railway) automatically
provide SSL certificates. Check your hosting provider's documentation.

For Cloudflare: SSL/TLS > Full (Strict)
```

### Problem: "Email not sending"
```
Check:
1. Verify SMTP credentials in environment variables
2. Test SMTP credentials independently
3. Check spam folder
4. Review app logs from hosting provider

For Gmail:
- Enable "Less secure app access" or use App Passwords
- Verify 2FA is set up if using App Passwords
```

---

## 📊 Monitoring & Maintenance

### Check Application Health
```bash
# Status
curl https://api.yourdomain.com/health

# View Logs
Check your hosting provider's log viewing interface

# Monitor Performance
Use your hosting provider's metrics dashboard
Track: Response time, CPU, Memory

# Set Alerts
Configure alerts through your hosting provider
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

### Hosting Options
- **Vercel/Netlify (Frontend):** Free tier available, then $20/month
- **Railway/Render (Backend):** Free tier available, then $5-20/month
- **SendGrid (Email):** Free tier (100 emails/day), then $15/month
- **Database (MongoDB Atlas):** Free tier available, then $9/month
- **Total:** $0-50/month depending on usage

### Cloudflare
- **Free Plan:** $0 (DNS only)
- **Pro Plan:** $20/month (with advanced features)

**Total Estimated Cost:** $0-70/month

---

## 🔐 Security Best Practices

### ✅ Do This
- [x] Use HTTPS only
- [x] Store secrets in environment variables (not .env files)
- [x] Enable firewall rules
- [x] Set CORS to specific domain only
- [x] Use environment-specific configs
- [x] Add rate limiting to API
- [x] Enable MFA for hosting accounts

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
- [ ] Set up auto-scaling (if available)
- [ ] Enable application monitoring
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
| **Cloudflare DNS** | https://developers.cloudflare.com/dns/ |
| **Node.js + Express** | https://expressjs.com/docs |
| **React/Vite** | https://vitejs.dev/guide/ |
| **Socket.io** | https://socket.io/docs/ |

---

## 📋 Final Checklist

Before going live, verify:

- [ ] Hosting provider account created
- [ ] TCW1 project cloned locally
- [ ] Backend & frontend apps deployed
- [ ] Cloudflare domain configured
- [ ] DNS records added (CNAME for api, www, @)
- [ ] CORS_ORIGIN set to your domain
- [ ] SSL certificate active
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
- ✅ Sending emails through your service
- ✅ Running on secure hosting
- ✅ Backed by Cloudflare's global CDN

---

**Questions?** Refer to the detailed guides:
- QUICK_START.md (fastest setup)
- DEPLOYMENT.md (comprehensive guide)
- CLOUDFLARE_SETUP.md (DNS & email)

**Ready to build?** Run: `bash deploy.sh both` 🚀
