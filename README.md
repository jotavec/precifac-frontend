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

## API and Asset URL Helper

The application includes a unified helper (`src/lib/api.js`) for constructing API and asset URLs that works consistently in both development and production environments.

### Usage Examples

```javascript
import { api, toPublicUrl } from "../../lib/api";

// API endpoints - automatically prefixed with /api
const response = await fetch(api("/receitas"), { credentials: "include" });
const response = await fetch(api("/users/me"));

// Asset URLs (images, uploads, etc.)
const imageUrl = toPublicUrl("/uploads/receita.jpg");
const avatarUrl = toPublicUrl(user.avatarUrl);
```

### Environment Behavior

**Development**: 
- Vite proxy configuration automatically routes `/api/*` → `http://localhost:3000/*`
- `api('/receitas')` → `/api/receitas` (handled by Vite proxy)
- `toPublicUrl('/uploads/image.jpg')` → `http://localhost:3000/uploads/image.jpg`

**Production**: 
- Vercel rewrites handle `/api/*` → `https://api.calculaaibr.com/api/*`
- `api('/receitas')` → `/api/receitas` (handled by Vercel rewrite)
- `toPublicUrl('/uploads/image.jpg')` → `https://api.calculaaibr.com/uploads/image.jpg`

### Environment Variables

The helper respects these environment variables:
- `VITE_BACKEND_URL`: Backend base URL (e.g., `https://api.calculaaibr.com`)
- `VITE_API_PREFIX`: API prefix (defaults to `/api`)

In preview environments where `VITE_BACKEND_URL` is not set, the helper falls back to relative `/api` paths, allowing the proxy/rewrite rules to handle routing.

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

This application is configured for deployment on Vercel with SPA (Single Page Application) routing support and API proxying. The `vercel.json` configuration includes:

### API Proxy Rules
All `/api/*` requests are automatically proxied to the backend API at `https://api.calculaaibr.com/api/$1`. This ensures that API calls work correctly even when the Vite build doesn't inject environment variables and the app calls relative `/api` paths.

**Supported HTTP Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS

**Examples**:
- `POST /api/users/login` → `https://api.calculaaibr.com/api/users/login`
- `GET /api/users/me` → `https://api.calculaaibr.com/api/users/me`
- `DELETE /api/receitas/123` → `https://api.calculaaibr.com/api/receitas/123`

### SPA Routing
The configuration also ensures that direct route access (e.g., `/login`, `/perfil`) works correctly by serving the main `index.html` file for all non-asset routes that don't match API patterns.

**Route Priority**: API proxy rules are evaluated before the SPA fallback, ensuring proper API routing.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
