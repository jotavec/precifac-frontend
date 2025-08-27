# Precifac Frontend

A React + Vite application for pricing calculations and recipe management.

## Environment Configuration

### Environment Variables

The application requires the following environment variables to be configured:

- `VITE_BACKEND_URL`: Backend API base URL (e.g., `https://api.calculaaibr.com`)
- `VITE_API_PREFIX`: API route prefix (e.g., `/api`)

### Setup for Different Environments

#### Development
Create a `.env` file in the root directory with your development configuration:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_API_PREFIX=/api
```

#### Production
For production deployment, use the environment variables from `.env.production.example`:
```env
VITE_BACKEND_URL=https://api.calculaaibr.com
VITE_API_PREFIX=/api
```

### Expected Console Output

When the application starts, you should see the following in the browser console:
```
[API] FINAL_BASE_URL = https://api.calculaaibr.com/api
```

This confirms that the API client is correctly configured to make requests to the production backend.

## Development

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Deployment

The application is configured for deployment on Vercel with proper SPA (Single Page Application) routing support. The `vercel.json` configuration ensures that:

- Static assets are served directly
- All client-side routes (e.g., `/login`, `/perfil`) are properly handled by serving the main `index.html` file
- API requests are made directly to the configured backend domain

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
