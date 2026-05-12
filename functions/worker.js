// Rapimax Worker — API Router
// Serves static assets via [assets] config, routes /api/* to handlers

import { corsResponse, handleOptions, errorResponse, checkAdminAuth } from './api/_helpers.js';

// Import handlers
import * as solicitudHandler from './api/solicitud.js';
import * as contactHandler from './api/contact.js';
import * as calculatorLeadHandler from './api/calculator-lead.js';
import * as adminHandler from './api/admin.js';
import * as contentHandler from './api/content.js';
import * as casesHandler from './api/cases.js';
import * as portalHandler from './api/portal.js';
import * as waitlistHandler from './api/waitlist.js';
import * as lookupHandler from './api/lookup.js';
import * as filesHandler from './api/files.js';
import * as rapiIdHandler from './api/rapi-id.js';
import * as agentHandler from './api/agent.js';
import { sendDailyDigest, sendWeeklyDigest } from './api/_scheduled.js';

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

      if (path === '/api/cases') {
        return await casesHandler.onRequest(context);
      }

      if (path === '/api/portal' && method === 'GET') {
        return await portalHandler.onRequestGet(context);
      }

      if (path === '/api/waitlist' && method === 'POST') {
        return await waitlistHandler.onRequestPost(context);
      }

      if (path === '/api/lookup' && method === 'POST') {
        return await lookupHandler.onRequestPost(context);
      }

      if (path === '/api/files') {
        return await filesHandler.onRequest(context);
      }

      if (path === '/api/rapi-id' && method === 'POST') {
        return await rapiIdHandler.onRequestPost(context);
      }

      if (path === '/api/agent' && method === 'POST') {
        return await agentHandler.onRequestPost(context);
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

  // Cron Triggers — daily at 6am CST, weekly Monday at 7am CST
  async scheduled(event, env, ctx) {
    const trigger = event.cron;
    try {
      if (trigger === '0 12 * * *') {
        // Daily digest at 12:00 UTC = 6:00 AM CST
        await sendDailyDigest(env);
      } else if (trigger === '0 13 * * 1') {
        // Weekly digest Monday at 13:00 UTC = 7:00 AM CST
        await sendWeeklyDigest(env);
      }
    } catch (err) {
      console.error('Scheduled task error:', err);
    }
  },
};
