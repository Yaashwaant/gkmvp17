# 🔧 GreenKarma MVP - Troubleshooting Guide

## 🚨 **Common Deployment Issues & Solutions**

### **1. Firebase Compatibility Warnings**
**Issue**: `npm warn EBADENGINE Unsupported engine @firebase/*`
**Solution**: ✅ **Fixed** - Updated Dockerfile to use Node.js 20

### **2. Database Connection Issues**
**Symptoms**: 
- App starts but crashes on database queries
- "DATABASE_URL must be set" error

**Solutions**:
```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Push schema to database
npm run db:push
```

### **3. Camera Access Issues**
**Symptoms**:
- Camera not working in production
- "getUserMedia not supported" error

**Solutions**:
- ✅ **HTTPS Required**: Camera API only works over HTTPS
- ✅ **Domain Permissions**: Add domain to browser permissions
- ✅ **Mobile Testing**: Test on actual mobile devices

### **4. OCR Processing Slow**
**Symptoms**:
- Tesseract.js taking too long
- Users abandoning upload flow

**Solutions**:
```javascript
// Optimize OCR settings (already implemented)
{
  logger: m => console.log(m),
  tessedit_char_whitelist: '0123456789',
  preserve_interword_spaces: '1'
}
```

### **5. Build Failures**
**Symptoms**:
- Docker build fails
- "Module not found" errors

**Solutions**:
```dockerfile
# Ensure all files are copied
COPY . .

# Clear npm cache
RUN npm cache clean --force

# Use exact Node version
FROM node:20-alpine
```

## 🔍 **Health Check Endpoints**

### **Application Health**
```bash
curl https://your-domain.com/health
# Expected: {"status":"healthy","timestamp":"..."}
```

### **API Endpoints**
```bash
# Demo user wallet
curl https://your-domain.com/api/wallet/DEMO4774

# Blockchain status
curl https://your-domain.com/api/admin/blockchain-status
```

## 📱 **Mobile-Specific Issues**

### **PWA Installation**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker registration

### **Camera on iOS**
- Test in Safari (required for iOS)
- Check camera permissions in Settings
- Ensure HTTPS certificate is valid

## 🗃️ **Database Troubleshooting**

### **Schema Issues**
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt"

# Recreate schema
npm run db:push

# Check sample data
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1"
```

### **Connection Pool Issues**
```bash
# Check connection limits
psql $DATABASE_URL -c "SHOW max_connections"

# Monitor active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"
```

## 🔐 **Authentication Issues**

### **JWT Token Problems**
```bash
# Check session secret is set
echo $SESSION_SECRET

# Test login flow
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo"}'
```

### **Firebase Auth Issues**
```bash
# Check Firebase config
echo $VITE_FIREBASE_API_KEY
echo $VITE_FIREBASE_PROJECT_ID

# Test Firebase connection in browser console
firebase.auth().currentUser
```

## 🌍 **Multilingual Issues**

### **Missing Translations**
- Check all locale files exist: `en.json`, `hi.json`, `mr.json`
- Verify language selector shows all options
- Test switching between languages

### **Font Rendering**
- Devanagari fonts for Hindi/Marathi
- Fallback fonts for different devices
- Test on various browsers

## ⚡ **Performance Optimization**

### **Image Upload Speed**
```javascript
// Compress images before upload (already implemented)
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// ... compression logic
```

### **OCR Performance**
```javascript
// Use Web Workers for OCR processing
const worker = new Worker('/ocr-worker.js');
worker.postMessage({imageData});
```

## 🔧 **Quick Fixes**

### **Restart Application**
```bash
# If using PM2
pm2 restart greenkarma

# If using Docker
docker restart greenkarma-container

# If using systemd
systemctl restart greenkarma
```

### **Clear Cache**
```bash
# Clear npm cache
npm cache clean --force

# Clear browser cache
# Ctrl+Shift+R or Cmd+Shift+R
```

### **Reset Demo Data**
```bash
# Reset demo user data
psql $DATABASE_URL -c "DELETE FROM rewards WHERE vehicle_number='DEMO4774'"
psql $DATABASE_URL -c "INSERT INTO users (name, phone, vehicle_number, email, username) VALUES ('Demo User', '+91 9876543210', 'DEMO4774', 'demo@greenkarma.com', 'demo')"
```

## 📞 **Support & Monitoring**

### **Log Analysis**
```bash
# Check application logs
docker logs greenkarma-container

# Check database logs
tail -f /var/log/postgresql/postgresql.log

# Check nginx logs (if using reverse proxy)
tail -f /var/log/nginx/access.log
```

### **Performance Monitoring**
- Response time monitoring
- Database query performance
- Memory and CPU usage
- User session analytics

## ✅ **Verification Checklist**

After fixing any issues, verify:
- [ ] Health endpoint returns 200
- [ ] Demo user loads correctly
- [ ] Camera works on mobile
- [ ] OCR processes images
- [ ] Language switching works
- [ ] Database queries execute
- [ ] API endpoints respond
- [ ] HTTPS certificate valid
- [ ] PWA installable

Your GreenKarma MVP should now be running smoothly! 🌱✨
