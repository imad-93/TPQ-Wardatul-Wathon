# Deployment Guide

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/imad-93/TPQ-Wardatul-Wathon.git
cd TPQ-Wardatul-Wathon

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start services with Docker
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development server (with hot reload)
npm run dev
```

Access application:
- API: http://localhost:3000
- pgAdmin: http://localhost:5050 (email: admin@tpq-wardah.com, password: admin)

## Production Deployment

### Docker Setup

```bash
# Build Docker image
docker build -t tpq-wardah:latest .

# Run container
docker run -p 3000:3000 \
  --env-file .env.production \
  tpq-wardah:latest
```

### Docker Compose (Production)

```bash
# Create production compose file
cp docker-compose.yml docker-compose.prod.yml

# Modify environment and volumes in docker-compose.prod.yml

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create tpq-wardah

# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/postgresql

# Set environment variables
heroku config:set JWT_SECRET=your-production-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### AWS Deployment (ECS/Fargate)

```bash
# Build and push to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com

docker build -t tpq-wardah:latest .
docker tag tpq-wardah:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tpq-wardah:latest
docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/tpq-wardah:latest
```

### Railway.app Deployment (Recommended for Beginners)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up

# View live logs
railway logs
```

### DigitalOcean App Platform

```bash
# Connect GitHub repository and let DigitalOcean handle deployment
# 1. Go to DigitalOcean Dashboard
# 2. Apps > Create App
# 3. Connect GitHub repo
# 4. Add environment variables
# 5. Deploy
```

## Environment Variables

Copy `.env.example` to `.env` dan set production values:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
```

## Database Migrations

### Run Migrations
```bash
npm run db:migrate
```

### Seed Test Data
```bash
npm run db:seed
```

### Reset Database
```bash
npm run db:reset
```

## SSL/HTTPS

### Self-Signed Certificate (Development)
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Let's Encrypt (Production)
```bash
# Using Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d tpq-wardah.com
```

## Monitoring & Logging

### Application Logs
```bash
# View logs with Docker
docker-compose logs -f api

# View logs with Heroku
heroku logs --tail

# View logs with Railway
railway logs
```

### Performance Monitoring
- New Relic
- Datadog
- Scout APM

## Backup & Recovery

### Database Backup
```bash
# Backup PostgreSQL
pg_dump -h localhost -U postgres tpq_wardah > backup.sql

# Restore
psql -h localhost -U postgres tpq_wardah < backup.sql
```

### Docker Volume Backup
```bash
docker run --rm -v tpq-wardatul-wathon_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz /data
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Enable database backups
- [ ] Setup monitoring & alerts
- [ ] Configure rate limiting
- [ ] Setup log aggregation
- [ ] Enable CORS on production domain only
- [ ] Setup fail2ban or similar

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check .env DATABASE_URL
# Ensure PostgreSQL is running
docker-compose ps db

# Check logs
docker-compose logs db
```

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

---

For more help, check: https://github.com/imad-93/TPQ-Wardatul-Wathon/issues
