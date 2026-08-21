# GitHub Pages Deployment Guide

## Overview

The GEO MIDI Controller App is configured for automatic deployment to GitHub Pages whenever you push to the default branch.

## Deployment Configuration

### GitHub Actions Workflow

The deployment is handled by a GitHub Actions workflow located at `.github/workflows/pages-deploy.yml` which:

1. **Triggers on**: Push to `Aron-Ranger-Host-PPM-Volt` branch
2. **Builds**: The project using `pnpm build`
3. **Deploys**: To GitHub Pages automatically

### Build & Deploy Process

```
Push to Branch → Build with Vite → Upload Artifacts → Deploy to GitHub Pages
```

## Live Site

Once deployed, your app will be available at:

```
https://edgeglobe-lab.github.io/geo-midi-controller-app/
```

## Configuration Details

### Vite Configuration

The `vite.config.ts` has been updated to:

- Detect GitHub Actions environment
- Set proper base path: `/geo-midi-controller-app/`
- Optimize build output for production
- Enable code splitting for vendor libraries

```typescript
// GitHub Pages base path configuration
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const base = isGitHubPages ? '/geo-midi-controller-app/' : '/';
```

### Build Optimization

- **Output Directory**: `dist/public`
- **Minification**: Terser
- **Source Maps**: Disabled in production
- **Code Splitting**: Vendor + App chunks
- **Base URL**: Automatically set for GitHub Pages

## Local Testing

To test the production build locally:

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment Status

- ✅ **Workflow File**: `.github/workflows/pages-deploy.yml`
- ✅ **Vite Config**: Updated with base path
- ✅ **Branch**: `Aron-Ranger-Host-PPM-Volt`
- ✅ **Permissions**: GitHub Pages write access configured

## First Deployment

1. Push changes to the repository
2. GitHub Actions will automatically run the workflow
3. Check the "Actions" tab for workflow status
4. Once complete, your site will be live at the GitHub Pages URL

## GitHub Pages Settings

GitHub Pages is automatically configured to:

- **Source**: GitHub Actions
- **Branch**: Automatically deployed from workflow
- **Domain**: `edgeglobe-lab.github.io/geo-midi-controller-app/`

## Troubleshooting

### If deployment fails:

1. Check the Actions tab for error logs
2. Verify `pnpm build` runs successfully locally
3. Ensure all dependencies are correctly installed
4. Check that `vite.config.ts` has proper base path configuration

### Common Issues:

- **Build timeout**: Increase Node memory if needed
- **Missing assets**: Verify public directory structure
- **Routing issues**: Ensure base path matches repository name

## Environment Variables

For GitHub Pages deployments, ensure environment variables are:

- Set in repository secrets if sensitive
- Or hardcoded if public configuration
- Available during build time (not runtime)

## Performance

The deployment includes:

- ✅ Code minification
- ✅ Asset optimization
- ✅ Vendor code splitting
- ✅ Lazy loading support
- ✅ Production-ready builds

## Support

For GitHub Pages issues, refer to:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
