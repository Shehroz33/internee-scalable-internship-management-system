# Deployment Guide - Scalable Internship Management System

## 1. Create AWS RDS MySQL Database

Recommended settings:

- Engine: MySQL
- Template: Free tier if available
- DB instance identifier: internee-internship-db
- Master username: admin
- VPC: Same VPC as EC2
- Security Group: Allow MySQL port 3306 from EC2 security group

## 2. Create Database and Tables

Connect from EC2:

```bash
mysql -h your-rds-primary-endpoint.amazonaws.com -u admin -p
```

Import SQL files:

```bash
mysql -h your-rds-primary-endpoint.amazonaws.com -u admin -p < database/schema.sql
mysql -h your-rds-primary-endpoint.amazonaws.com -u admin -p internship_management < database/seed.sql
```

## 3. Create Read Replica

```text
RDS → Databases → Select primary database → Actions → Create read replica
```

Use replica identifier:

```text
internee-internship-db-read-replica
```

## 4. Deploy App on EC2

```bash
cd /var/www
sudo git clone https://github.com/your-username/internee-scalable-internship-management-system.git ims
cd ims
npm install
cp .env.example .env
nano .env
npm start
```

## 5. Run With PM2

```bash
sudo npm install -g pm2
pm2 start server.js --name ims
pm2 save
pm2 startup
```

## 6. Configure Nginx

Open default config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Add this inside the server block:

```nginx
location /ims/ {
    proxy_pass http://127.0.0.1:3000/ims/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Open Live App

```text
https://your-domain-or-sslip.io/ims
```

## 8. Screenshots for Submission

Take screenshots of:

- RDS primary database
- RDS read replica
- Security group allowing MySQL from EC2
- MySQL tables/data
- App running on EC2
- Live app in browser
- GitHub repository README
