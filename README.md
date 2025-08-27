# Precifac Frontend

Frontend application built with React + Vite for the Precifac calculation platform.

## Environment Configuration

### Development
For local development, use the included `.env` file or create your own:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_API_PREFIX=/api
```

### Production
For production deployment, copy `.env.production.example` to `.env.production` and configure:

```env
VITE_BACKEND_URL=https://api.calculaaibr.com
VITE_API_PREFIX=/api
```

The application will log the final API URL in the browser console:
```
[API] FINAL_BASE_URL = https://api.calculaaibr.com/api
```

All API requests will be made to this base URL. For example:
- `POST /api/users` → `https://api.calculaaibr.com/api/users`
- `GET /api/users/me` → `https://api.calculaaibr.com/api/users/me`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This application is configured for deployment on Vercel with SPA (Single Page Application) routing support. The `vercel.json` configuration ensures that direct route access (e.g., `/login`, `/perfil`) works correctly by serving the main `index.html` file for all non-asset routes.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
