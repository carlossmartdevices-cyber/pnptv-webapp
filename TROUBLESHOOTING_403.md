# Troubleshooting 403 Forbidden Error

## 🔍 Understanding the Issue

You're seeing a **403 Forbidden** error when trying to access the PNP TV application. This typically happens when:

1. **Nginx is blocking access** to the requested resource
2. **File permissions** are incorrect
3. **Nginx configuration** is pointing to the wrong location
4. **No default server** is configured in Nginx

## 🚑 Quick Fixes

### Option 1: Access Directly via PM2 Ports

Since both services are running under PM2, you can access them directly:

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`

This bypasses Nginx entirely and lets you test if the applications are working.

### Option 2: Disable the Conflicting Nginx Site

```bash
# Disable the existing pnptv.app site
sudo rm /etc/nginx/sites-enabled/pnptv.app

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 3: Set Up Proper Nginx Configuration

Use the configuration file I created (`nginx-pm2-config`):

```bash
# Copy the configuration to Nginx sites-available
sudo cp /root/pnptv-webapp/nginx-pm2-config /etc/nginx/sites-available/pnptv-pm2

# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/pnptv-pm2 /etc/nginx/sites-enabled/

# Remove conflicting configuration
sudo rm /etc/nginx/sites-enabled/pnptv.app

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔧 Detailed Troubleshooting Steps

### Step 1: Check Nginx Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -50 /var/log/nginx/access.log
```

### Step 2: Check File Permissions

```bash
# Check frontend file permissions
ls -la /root/pnptv-webapp/frontend/dist/

# Ensure proper permissions
sudo chmod -R 755 /root/pnptv-webapp/frontend/dist/
```

### Step 3: Check Nginx Configuration

```bash
# List enabled sites
ls -la /etc/nginx/sites-enabled/

# Check which configuration is being used
sudo nginx -T | grep server_name

# Test current configuration
sudo nginx -t
```

### Step 4: Check Port Conflicts

```bash
# Check what's listening on port 80
sudo lsof -i :80

# Check what's listening on port 443
sudo lsof -i :443

# Check our PM2 services
pm2 list
```

### Step 5: Temporary Solution - Disable Nginx

If you just want to test the application:

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Now access directly:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000

# Start Nginx again when done
sudo systemctl start nginx
```

## 🎯 Recommended Solution

### Set Up Nginx as Reverse Proxy

1. **Copy the configuration**:
   ```bash
   sudo cp /root/pnptv-webapp/nginx-pm2-config /etc/nginx/sites-available/pnptv-pm2
   ```

2. **Enable the configuration**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pnptv-pm2 /etc/nginx/sites-enabled/
   ```

3. **Disable conflicting configuration**:
   ```bash
   sudo rm /etc/nginx/sites-enabled/pnptv.app
   ```

4. **Test and reload**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Access your application**:
   - `http://localhost/` (will proxy to frontend on port 3000)
   - `http://localhost/api/` (will proxy to backend on port 4000)

## 📚 Additional Resources

- **Nginx Documentation**: https://nginx.org/en/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/
- **Reverse Proxy Guide**: https://www.nginx.com/resources/glossary/reverse-proxy-server/

## 🎉 Success Check

After applying the fixes:

1. **Test direct access**: `http://localhost:3000` (should work)
2. **Test API access**: `http://localhost:4000` (should work)
3. **Test Nginx proxy**: `http://localhost/` (should work after configuration)

The 403 error should be resolved once you either:
- Access the applications directly on their PM2 ports (3000 and 4000)
- Or configure Nginx properly as a reverse proxy