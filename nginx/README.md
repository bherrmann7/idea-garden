# Nginx WebDAV Configuration

Idea Garden uses nginx with WebDAV to handle the API - no backend server required.

## How It Works

- `GET /api/projects` → nginx serves `projects.json` as a static file
- `PUT /api/projects` → nginx WebDAV writes the request body to `projects.json`

## Setup

### 1. Check WebDAV module is available

```bash
nginx -V 2>&1 | grep http_dav_module
```

If not present, you'll need to install `nginx-extras` or recompile nginx.

### 2. Add configuration to nginx

Copy the location blocks from `nginx-ig.conf` into your nginx server block.

For HTTPS (recommended), add to your SSL server block in `/etc/nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    # ... SSL config ...

    # Add these location blocks BEFORE any catch-all location /

    location /ig {
        alias /path/to/idea-garden/dist;
        index index.html;
        try_files $uri $uri/ /ig/index.html;
    }

    location /api/projects {
        alias /path/to/projects.json;
        dav_methods PUT;
        create_full_put_path on;
        dav_access user:rw group:rw all:r;
        default_type application/json;
        # ... see nginx-ig.conf for full config
    }

    # Your existing catch-all
    location / {
        # ...
    }
}
```

### 3. Set permissions

The nginx user (usually `www-data`) needs write access to:
- The directory containing `projects.json`
- The `projects.json` file itself

```bash
# Create projects.json if it doesn't exist
echo '[]' > /path/to/projects.json

# Set ownership
chown www-data:www-data /path/to/projects.json
chown www-data:www-data /path/to/directory

# Set permissions
chmod 664 /path/to/projects.json
chmod 775 /path/to/directory
```

### 4. Test and reload

```bash
# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

### 5. Verify

```bash
# Test read
curl https://your-domain.com/api/projects

# Test write
curl -X PUT https://your-domain.com/api/projects \
  -H "Content-Type: application/json" \
  -d '[{"id":1,"title":"Test","details":""}]'
```

## Security Notes

By default, this config has **no authentication** - anyone who knows the URL can read/write.

To add basic auth:

```nginx
location /api/projects {
    auth_basic "Idea Garden API";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ... rest of config
}
```

Create password file:
```bash
htpasswd -c /etc/nginx/.htpasswd username
```

## Files

- `nginx-ig.conf` - Location blocks to add to your nginx config
- `nginx-config-backup-*.tar.gz` - Backup of original nginx config (if present)
