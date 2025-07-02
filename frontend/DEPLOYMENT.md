# Frontend Deployment Guide

This guide explains how to deploy the frontend of the Cournot Game application to Vercel.

## Prerequisites

- A Vercel account
- Git repository with your code
- Backend already deployed to your server (e.g., cuhkgameplatform.online)

## Deployment Steps

### 1. Prepare Your Environment Files

The project uses environment variables to handle different backend URLs for development and production:

- `.env.development` - Used for local development with `http://localhost:3001`
- `.env.production` - Used for production with your backend URL `https://cuhkgameplatform.online`

### 2. Deploy to Vercel

1. Log in to your Vercel account
2. Import your Git repository
3. Configure the project:

   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Add environment variables:

   - Add `VITE_API_URL` with the value of your backend URL (e.g., `https://cuhkgameplatform.online`)

5. Deploy the project

### 3. Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to the "Domains" section
3. Add your custom domain and follow the instructions to set up DNS

### 4. Verify CORS Configuration

Ensure that your backend server has the correct CORS configuration to accept requests from your Vercel domain.

### 5. Testing

After deployment, test the following functionality:

- User login/registration
- WebSocket connections
- Game creation and joining
- Real-time game interactions

## Troubleshooting

### Cookie Issues

If you experience issues with cookies and authentication:

- Ensure both frontend and backend are using HTTPS
- Check that CORS is properly configured with `credentials: true`
- Verify that cookies are set with the correct domain and SameSite attributes

### WebSocket Connection Problems

If WebSocket connections fail:

- Check browser console for errors
- Verify that the backend WebSocket server accepts connections from your frontend domain
- Ensure proper authentication tokens are being sent

### 404 Errors on Page Refresh

The `vercel.json` file includes rewrites to handle client-side routing. If you're experiencing 404 errors on page refresh, verify that this file is properly configured.
