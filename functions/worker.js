// Rapimax Worker — API Router
// Serves static assets via [assets] config, routes /api/* to handlers

import { corsResponse, handleOptions, errorResponse, checkAdminAuth } from './api/_helpers.js';

// Import handlers
import * as solicitudHandler from './api/solicitud.js';
import * as contactHandler from './api/contact.js';
import * as calculatorLeadHandler from './api/calculator-lead.js';
import * as adminHandler from './api/admin.js';
import * as contentHandler from './api/content.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS' && path.startsWith('/api/')) {
      return handleOptions();
    }

    const context = { request, env, ctx };

    try {
      // Route API requests
      if (path === '/api/solicitud' && method === 'POST') {
        return await solicitudHandler.onRequestPost(context);
      }

      if (path === '/api/contact' && method === 'POST') {
        return await contactHandler.onRequestPost(context);
      }

      if (path === '/api/calculator-lead' && method === 'POST') {
        return await calculatorLeadHandler.onRequestPost(context);
      }

      if (path === '/api/admin') {
        return await adminHandler.onRequest(context);
      }

      if (path === '/api/content' && method === 'GET') {
        return await contentHandler.onRequestGet(context);
      }

      // Unknown API route
      if (path.startsWith('/api/')) {
        return errorResponse('Ruta no encontrada.', 404);
      }

      // Everything else is handled by [assets] (static files)
      // Return undefined/null to let assets handle it
      return env.ASSETS.fetch(request);
    } catch (err) {
      console.error('Worker error:', err);
      return errorResponse('Error interno del servidor.', 500);
    }
  },
};
