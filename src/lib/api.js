// src/lib/api.js
// Unified helper for API and Asset URL construction

/**
 * Environment Variables:
 * - VITE_BACKEND_URL: Backend base URL (e.g., https://api.calculaaibr.com)
 * - VITE_API_PREFIX: API prefix (e.g., /api)
 */

// Get environment variables with normalization
const RAW_BACKEND_URL = import.meta?.env?.VITE_BACKEND_URL || "";
const RAW_API_PREFIX = import.meta?.env?.VITE_API_PREFIX || "/api";

// Normalize URLs - remove trailing slashes
const BACKEND_URL = String(RAW_BACKEND_URL).replace(/\/+$/, "");
const API_PREFIX = ("/" + String(RAW_API_PREFIX || "").replace(/^\/+/, "")).replace(/\/+$/, "");

/**
 * API Base URL Construction:
 * - Development: Uses relative /api paths (handled by Vite proxy)
 * - Production: Uses /api paths (handled by Vercel rewrites)
 * - Fallback: If BACKEND_URL is not defined or in preview environments, use just "/api"
 */
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}${API_PREFIX}` : API_PREFIX;

/**
 * Public Base URL for assets (like /uploads):
 * - Uses BACKEND_URL if available, otherwise empty (relative paths)
 */
export const PUBLIC_BASE = BACKEND_URL || "";

/**
 * Construct API endpoint URL
 * @param {string} path - API path (e.g., '/receitas', '/users/me')
 * @returns {string} Complete API URL
 * 
 * Examples:
 * - api('/receitas') → '/api/receitas' (dev/prod via proxy/rewrite)
 * - api('/receitas') → 'https://api.calculaaibr.com/api/receitas' (if BACKEND_URL set)
 */
export function api(path) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In production with Vercel rewrites, or development with Vite proxy,
  // we can use relative /api paths
  if (!BACKEND_URL) {
    return `${API_PREFIX}${normalizedPath}`;
  }
  
  // If BACKEND_URL is set, construct full URL
  return `${API_BASE}${normalizedPath}`;
}

/**
 * Resolve public asset URL (for images, uploads, etc.)
 * @param {string} url - Asset path or URL
 * @returns {string} Resolved public URL
 * 
 * Examples:
 * - toPublicUrl('/uploads/image.jpg') → 'https://api.calculaaibr.com/uploads/image.jpg'
 * - toPublicUrl('data:image/...') → 'data:image/...' (unchanged)
 * - toPublicUrl('https://...') → 'https://...' (unchanged)
 */
export function toPublicUrl(url) {
  if (!url || url === "null" || url === "undefined") return "";
  
  // Return data URLs and absolute URLs unchanged
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // For relative paths starting with /, use PUBLIC_BASE
  if (url.startsWith("/")) {
    return PUBLIC_BASE ? `${PUBLIC_BASE}${url}` : url;
  }
  
  // Return other URLs unchanged
  return url;
}

// Log configuration for debugging
console.log("[API Helper] Configuration:", {
  BACKEND_URL,
  API_PREFIX,
  API_BASE,
  PUBLIC_BASE
});