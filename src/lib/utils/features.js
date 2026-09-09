// Feature flags for RapiMax.
//
// DEMO_MODE is resolved at build time from the Vite env var VITE_DEMO_MODE.
// Production builds (no flag, or any value other than "true") keep every
// currently hidden feature hidden, so this file is safe to merge into main.
//
// The demo Worker (rapimax-demo) is built with VITE_DEMO_MODE=true and gets
// the full-featured experience: calculator, solicitud, Rapi-ID, partners,
// partner map, contact FAQ, auth buttons, footer quick links, demo banner
// and the guided tour.

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const features = Object.freeze({
  partners: DEMO_MODE,
  partnerMap: DEMO_MODE,
  contactFaq: DEMO_MODE,
  footerQuickLinks: DEMO_MODE,
  authButtons: DEMO_MODE,
  calculatorPage: DEMO_MODE,
  solicitudPage: DEMO_MODE,
  navProductLinks: DEMO_MODE,
  demoBanner: DEMO_MODE,
  demoTour: DEMO_MODE
});

export const DEMO_CREDENTIALS = Object.freeze({
  adminEmail: 'demo@rapimax-dev.com',
  adminPassword: 'RapiMaxDemo2026',
  borrowerEmail: 'maria.rojas@ejemplo.co.cr',
  borrowerCedula: '1-1910-0328'
});
