# Cloudflare DNS Setup Guide for TCW1

## 🌐 Complete DNS Configuration

### Prerequisites
- Domain registered on Cloudflare
- Azure App Service deployed (backend + frontend)
- Your domain: `yourdomain.com`

### DNS Records to Add

#### **1. Root Domain (@)**
**Purpose:** Points main domain to frontend

```
Type:     CNAME
Name:     @ (or leave blank for root)
Content:  tcw1-frontend.azurewebsites.net
TTL:      Auto
Proxy:    DNS only ⚠️ (Cloudflare can't proxy Azure)
Priority: N/A
```

**Alternative (if CNAME fails):**
```
Type:     A
Name:     @
Content:  (Azure will provide IP)
TTL:      Auto
Proxy:    DNS only
```

---

#### **2. WWW Subdomain**
**Purpose:** www.yourdomain.com redirects to frontend

```
Type:     CNAME
Name:     www
Content:  tcw1-frontend.azurewebsites.net
TTL:      Auto
Proxy:    DNS only
Priority: N/A
```

---

#### **3. API Subdomain** ⭐ IMPORTANT
**Purpose:** api.yourdomain.com routes to backend

```
Type:     CNAME
Name:     api
Content:  tcw1-backend.azurewebsites.net
TTL:      Auto
Proxy:    DNS only ⚠️
Priority: N/A
```

**Special Case - If Behind Proxy:**
If you MUST use Cloudflare proxy (orange cloud):
```
Type:     CNAME
Name:     api
Content:  tcw1-backend.azurewebsites.net
Proxy:    Proxied (orange cloud)
```
Then add CORS header in Azure:
```
app-setting: ALLOWED_ORIGINS = api.yourdomain.com
```

---

#### **4. Mail Records** (for Microsoft Email)
**Purpose:** Enables email routing through your domain

```
Type:     MX
Name:     @ (root)
Content:  outlook-com.olc.protection.outlook.com
Priority: 10
TTL:      Auto
```

**For DKIM/DMARC authentication:**

```
Type:     TXT
Name:     selector1._domainkey
Content:  v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_FROM_MICROSOFT
TTL:      Auto

Type:     TXT
Name:     _dmarc
Content:  v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com
TTL:      Auto
```

---

#### **5. SPF Record** (Email)
**Purpose:** Prevents email spoofing

```
Type:     TXT
Name:     @ (root)
Content:  v=spf1 outlook.com ~all
TTL:      Auto
```

---

#### **6. Socket.IO WebSocket** (for Chat/Video)
**Purpose:** WebSocket connection for real-time features

```
Type:     CNAME
Name:     ws (or socket)
Content:  tcw1-backend.azurewebsites.net
TTL:      Auto
Proxy:    DNS only
```

---

### Complete DNS Table

| Type | Name | Content | TTL | Proxy | Priority |
|------|------|---------|-----|-------|----------|
| CNAME | @ | tcw1-frontend.azurewebsites.net | Auto | DNS only | - |
| CNAME | www | tcw1-frontend.azurewebsites.net | Auto | DNS only | - |
| CNAME | api | tcw1-backend.azurewebsites.net | Auto | DNS only | - |
| MX | @ | outlook-com.olc.protection.outlook.com | Auto | - | 10 |
| TXT | @ | v=spf1 outlook.com ~all | Auto | - | - |
| TXT | selector1._domainkey | v=DKIM1; k=rsa; p=... | Auto | - | - |
| CNAME | ws | tcw1-backend.azurewebsites.net | Auto | DNS only | - |

---

## ⚙️ Step-by-Step Cloudflare Setup

### 1. **Access Cloudflare DNS Panel**
- Go to `Cloudflare.com` > Your Domain
- Click "DNS" tab
- You should see existing nameserver records

### 2. **Add CNAME Records**
```
Click "+ Add record"
Select Type: CNAME
Name: www
Target: tcw1-frontend.azurewebsites.net
TTL: Auto
Proxy: DNS only (click gray cloud)
Save
```

Repeat for:
- `api` → `tcw1-backend.azurewebsites.net`
- `@` → `tcw1-frontend.azurewebsites.net`

### 3. **Add Email Records**
```
+ Add record
Type: MX
Name: @
Mail server: outlook-com.olc.protection.outlook.com
Priority: 10
Save
```

### 4. **Add SPF Record**
```
+ Add record
Type: TXT
Name: @
Content: v=spf1 outlook.com ~all
Save
```

### 5. **Verify in Azure**
In Azure Portal:
```
App Service > Custom domains > Add custom domain
Domain: yourdomain.com

Hostname: yourdomain.com
Validation method: CNAME
Alias: (Cloudflare provides this)
```

---

## 🔒 SSL/TLS Configuration

### Cloudflare SSL Settings
1. Go to **SSL/TLS** tab
2. Set to: **Full (Strict)**
3. Create managed certificate

### Azure SSL Settings
1. **App Service** > **TLS/SSL settings**
2. **Private keys certificates** > **Create App Service Managed Certificate**
3. **Bindings** > Add binding for `yourdomain.com`

---

## ✅ Verification Checklist

```bash
# Test DNS propagation
nslookup yourdomain.com
nslookup api.yourdomain.com
nslookup www.yourdomain.com

# Check CNAME records
nslookup -q=CNAME yourdomain.com

# Verify email records
nslookup -q=MX yourdomain.com

# Check SPF record
nslookup -q=TXT yourdomain.com

# Test API endpoint
curl https://api.yourdomain.com/health

# Test frontend
curl https://yourdomain.com
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CNAME won't resolve** | Wait 10-30 minutes for DNS propagation |
| **SSL cert error** | Ensure Azure SSL binding is created first |
| **API returns 404** | Check CORS_ORIGIN env var matches your domain |
| **Email not delivering** | Verify SPF/MX records with O365 requirements |
| **WebSocket fails** | Ensure `ws` subdomain points to backend |

---

## 📧 Microsoft Email Setup

### Option 1: Outlook Personal (Free)
```
SMTP: smtp-mail.outlook.com
Port: 587
Encryption: TLS
Account: your@outlook.com
App Password: (generate at account.microsoft.com)
```

### Option 2: Microsoft 365 Business
```
SMTP: smtp.office365.com
Port: 587
Encryption: TLS
Account: your@yourdomain.com
Password: Your M365 password
```

### Option 3: Azure Communication Services (Recommended)
```bash
# In Azure Portal:
# Create "Azure Communication Services" resource
# Select region Same as your app
# Copy Connection String
# Save to Azure Key Vault

Email Endpoint: your-service.communication.azure.com
Connection String: endpoint=https://...;accesskey=...
```

**In Backend (.env):**
```
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...;accesskey=...
SENDER_EMAIL=noreply@yourdomain.com
```

---

## Next Steps
1. ✅ Add all DNS records above
2. ✅ Wait 24 hours for full propagation
3. ✅ Test each URL in browser
4. ✅ Configure email in backend
5. ✅ Update frontend API URL to `https://api.yourdomain.com`
6. ✅ Monitor Azure logs for errors
