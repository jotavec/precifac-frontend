# Precifac Frontend

This is a React application built with Vite for pricing and cost management.

## Environment Configuration

Copy `.env.example` to `.env` and configure the API URL:

```bash
cp .env.example .env
```

### API Configuration

The application supports two configuration methods:

1. **Recommended**: Use `VITE_API_URL` for the complete API endpoint:
   ```
   VITE_API_URL=https://app.calculaaibr.com/api
   ```

2. **Legacy**: Use separate backend URL and API prefix:
   ```
   VITE_BACKEND_URL=https://calculaai-backend.onrender.com
   VITE_API_PREFIX=/api
   ```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

### Production Deployment

For production deployment, ensure the following environment variable is set:

```
VITE_API_URL=https://app.calculaaibr.com/api
```

This can be configured in your hosting platform's environment variables or in a `.env` file during the build process.

## Technical Details

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
