# StudyMaster AI - Deployment Guide

This guide covers deploying StudyMaster AI to production environments.

## Prerequisites

Before deploying, ensure you have:

- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Environment variables prepared
- [ ] Domain name (optional but recommended)

## Production Environment Variables

Create the following environment variables in your deployment platform:

```bash
# Required - Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - Application Configuration
VITE_APP_NAME=StudyMaster AI
VITE_APP_URL=https://your-domain.com
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides excellent support for React applications with automatic deployments.

#### Setup Steps:

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   ```

2. **Configure Project**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select "Vite" as the framework preset
   - Configure environment variables in the dashboard

3. **Build Configuration**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   Add all required environment variables in the Vercel dashboard under Project Settings → Environment Variables.

5. **Custom Domain (Optional)**
   - Add your custom domain in the Domains section
   - Configure DNS records as instructed

#### Automatic Deployments:
- Main branch deploys to production automatically
- Pull requests create preview deployments

### 2. Netlify

Netlify offers great static site hosting with form handling and serverless functions.

#### Setup Steps:

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: (leave empty)

3. **Environment Variables**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=StudyMaster AI
   VITE_APP_URL=https://your-site.netlify.app
   ```

4. **Redirects Configuration**
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### 3. Railway

Railway provides full-stack deployment with database hosting.

#### Setup Steps:

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub

2. **Configuration**
   - Railway auto-detects Vite projects
   - Set environment variables in the dashboard
   - Deploy automatically on push

3. **Custom Domain**
   - Add custom domain in project settings
   - Configure DNS as instructed

### 4. AWS S3 + CloudFront

For enterprise-grade deployment with AWS infrastructure.

#### Setup Steps:

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-app-bucket
   aws s3 website s3://your-app-bucket --index-document index.html --error-document index.html
   ```

3. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://your-app-bucket --delete
   ```

4. **Configure CloudFront**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom error pages (redirect 404s to index.html)

5. **Set Up CI/CD**
   Use GitHub Actions or AWS CodePipeline for automated deployments.

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Set strong database password

### 2. Apply Database Migrations

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy content from `supabase/migrations/20250811192041_tiny_bonus.sql`
   - Execute the migration

2. **Via Supabase CLI (Alternative):**
   ```bash
   npx supabase login
   npx supabase db push
   ```

### 3. Configure Authentication

1. **Email Auth Settings:**
   - Go to Authentication → Settings
   - Configure email templates
   - Set site URL to your production domain
   - Disable email confirmations if desired

2. **Security Settings:**
   - Add your production domain to allowed origins
   - Configure JWT expiry times
   - Set up rate limiting

### 4. Row Level Security

The migration automatically creates RLS policies, but verify:
- All tables have RLS enabled
- Policies properly restrict user access
- Test with different user accounts

## Performance Optimization

### Build Optimization

1. **Bundle Analysis**
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Environment-Specific Builds**
   ```bash
   # Production build with optimizations
   NODE_ENV=production npm run build
   ```

### CDN Configuration

1. **Static Asset Caching**
   - Cache JS/CSS files: 1 year
   - Cache images: 6 months
   - Cache HTML: No cache or short TTL

2. **Gzip/Brotli Compression**
   - Enable compression on your CDN
   - Reduces bundle size by ~70%

### Database Performance

1. **Connection Pooling**
   - Supabase handles this automatically
   - Monitor connection usage

2. **Query Optimization**
   - Use indexes for frequent queries (already included in migration)
   - Monitor slow query log
   - Use pagination for large datasets

## Security Checklist

### Environment Security
- [ ] Never commit real environment variables
- [ ] Use different Supabase projects for dev/staging/prod
- [ ] Rotate API keys regularly
- [ ] Enable 2FA on all service accounts

### Application Security
- [ ] All forms have CSRF protection (handled by Supabase)
- [ ] Input validation on client and server
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (React handles most cases)

### Database Security
- [ ] Row Level Security enabled on all tables
- [ ] Minimum required permissions for anon role
- [ ] Regular security updates applied
- [ ] Backup and recovery plan in place

## Monitoring & Logging

### Application Monitoring

1. **Performance Monitoring**
   ```bash
   # Add to your deployment
   npm install @sentry/react @sentry/vite-plugin
   ```

2. **Analytics**
   - Consider privacy-focused analytics (Plausible, Fathom)
   - Monitor user engagement and feature usage

### Database Monitoring

1. **Supabase Dashboard**
   - Monitor query performance
   - Track API usage
   - Set up alerts for high usage

2. **Custom Metrics**
   - Track study session completion rates
   - Monitor quiz performance
   - User engagement metrics

## Backup & Recovery

### Database Backups

1. **Automatic Backups**
   - Supabase provides daily backups
   - Retained for 7 days (free tier)
   - Configure longer retention for paid plans

2. **Manual Backups**
   ```bash
   # Export data
   npx supabase db dump > backup.sql
   
   # Import data
   npx supabase db reset --db-url postgresql://[connection-string]
   ```

### Application Backups

1. **Source Code**
   - Use Git for version control
   - Tag releases for easy rollback
   - Multiple remote repositories

2. **User Data Export**
   - Implement data export functionality
   - GDPR compliance features
   - Regular data exports for users

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check for TypeScript errors
   npx tsc --noEmit
   
   # Check for linting errors
   npm run lint
   
   # Clear cache and rebuild
   rm -rf dist node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   - Verify all required variables are set
   - Check variable naming (must start with `VITE_`)
   - Restart deployment after variable changes

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check CORS settings
   - Ensure migrations are applied

4. **Performance Issues**
   - Enable compression (gzip/brotli)
   - Use CDN for static assets
   - Optimize images and fonts
   - Implement code splitting

### Health Checks

Create a health check endpoint to monitor deployment status:

```typescript
// Add to your app for monitoring
const healthCheck = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return { status: 'healthy', database: !error };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

## Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] User registration and login work
- [ ] Database operations function properly
- [ ] Forms validate and submit correctly
- [ ] Responsive design works on mobile devices
- [ ] Performance meets expectations (< 3s load time)
- [ ] Analytics tracking is active
- [ ] Error monitoring is configured
- [ ] SSL certificate is valid
- [ ] Domain redirects work correctly
- [ ] Backup system is functioning

## Scaling Considerations

As your application grows, consider:

1. **Database Scaling**
   - Upgrade Supabase plan for more connections
   - Implement connection pooling
   - Consider read replicas for heavy read workloads

2. **CDN & Caching**
   - Implement Redis for session storage
   - Use CDN for global content delivery
   - Cache API responses where appropriate

3. **Monitoring & Alerts**
   - Set up uptime monitoring
   - Configure performance alerts
   - Implement log aggregation

4. **Load Testing**
   - Test with expected user load
   - Identify bottlenecks early
   - Plan capacity upgrades

This deployment guide ensures your StudyMaster AI application is production-ready, secure, and scalable.