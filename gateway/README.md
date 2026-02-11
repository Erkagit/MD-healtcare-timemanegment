# QPay Gateway Proxy - VPS тохиргооны заавар

## Яагаад хэрэгтэй вэ?
QPay серверт IP хаяг whitelist хийх шаардлагатай, гэхдээ Vercel serverless-д static IP байхгүй.
Энэ gateway VPS дээр static IP-тэй ажиллаж, QPay руу proxy хийнэ.

```
Хэрэглэгч → Vercel API → VPS Gateway (static IP) → QPay API
                                  ↑
                      Энэ IP-г QPay-д өгнө
```

## 1. VPS авах (DigitalOcean жишээ)

1. https://www.digitalocean.com руу орно
2. **Create Droplet** → Ubuntu 22.04 → Basic → $4/сар (Regular, 512MB RAM хүрнэ)
3. **Region**: Singapore (ap-southeast-1, Монголд хамгийн ойр)
4. Droplet үүсгэсний дараа **IP хаяг** (жишээ: `167.71.192.xxx`) авна
5. **Энэ IP хаягийг QPay-д бичнэ!**

## 2. VPS дээр суулгах

```bash
# SSH-ээр нэвтэрнэ
ssh root@<YOUR_VPS_IP>

# Node.js суулгах
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Код хуулах
mkdir -p /opt/qpay-gateway
cd /opt/qpay-gateway

# package.json, server.js файлуудыг хуулна (scp эсвэл git clone)
scp -r gateway/* root@<YOUR_VPS_IP>:/opt/qpay-gateway/

# Dependency суулгах
npm install

# Environment тохируулах
cat > .env << 'EOF'
PORT=8080
QPAY_TARGET=https://qr.qpay.mn
GATEWAY_API_KEY=<НУУЦ_ТҮЛХҮҮР_ҮҮСГЭ>
ALLOWED_ORIGINS=md-healtcare-timemanegment-api.vercel.app
EOF
```

## 3. Systemd service тохируулах (auto-start)

```bash
sudo cat > /etc/systemd/system/qpay-gateway.service << 'EOF'
[Unit]
Description=QPay Gateway Proxy
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/qpay-gateway
EnvironmentFile=/opt/qpay-gateway/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable qpay-gateway
sudo systemctl start qpay-gateway
sudo systemctl status qpay-gateway
```

## 4. Nginx + SSL тохируулах (optional, recommended)

```bash
sudo apt install nginx certbot python3-certbot-nginx -y

# Nginx config
sudo cat > /etc/nginx/sites-available/qpay-gateway << 'EOF'
server {
    listen 80;
    server_name qpay-gw.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 30s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/qpay-gateway /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL (хэрэв домэйн тохируулсан бол)
sudo certbot --nginx -d qpay-gw.yourdomain.com
```

## 5. Vercel-ийн .env шинэчлэх

VPS суулгасны дараа Vercel дээр:

```
QPAY_API_URL=http://<YOUR_VPS_IP>:8080/v1
QPAY_GATEWAY_KEY=<НУУЦ_ТҮЛХҮҮР>
```

SSL тохируулсан бол:
```
QPAY_API_URL=https://qpay-gw.yourdomain.com/v1
QPAY_GATEWAY_KEY=<НУУЦ_ТҮЛХҮҮР>
```

## 6. QPay-д IP хаяг оруулах

QPay merchant dashboard → IP хаяг → `<YOUR_VPS_IP>` оруулна.

## 7. Тест хийх

```bash
# VPS дээр health check
curl http://<YOUR_VPS_IP>:8080/health

# Gateway-ээр дамжуулж QPay auth тест
curl -X POST http://<YOUR_VPS_IP>:8080/v1/auth/token \
  -H "x-gateway-key: <НУУЦ_ТҮЛХҮҮР>" \
  -u "QPAY_USERNAME:QPAY_PASSWORD"
```
