import 'lenis/dist/lenis.css';
import './app.css';
import { features } from './lib/utils/features.js';

// Outside demo mode these routes redirect to /contactanos (current production behavior).
const redirectToContact = () => { window.location.href = '/contactanos'; return import('./ContactApp.svelte'); };

const routes = {
  '/': () => import('./App.svelte'),
  '/calculadora': features.calculatorPage ? () => import('./CalculatorApp.svelte') : redirectToContact,
  '/solicitud': features.solicitudPage ? () => import('./FinancingApp.svelte') : redirectToContact,
  '/contactanos': () => import('./ContactApp.svelte'),
  '/requisitos': () => import('./RequirementsApp.svelte'),
  '/servicios': () => import('./ServicesApp.svelte'),
  '/mi-solicitud': () => import('./PortalApp.svelte'),
  '/ingresar': () => import('./IngresarApp.svelte'),
  '/terminos-y-condiciones': () => import('./TermsApp.svelte'),
  '/politica-de-privacidad': () => import('./PrivacyApp.svelte'),
  '/mi-credito': () => import('./LoanPortalApp.svelte')
};

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!window.location.hash) window.scrollTo(0, 0);

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const loadRootComponent = routes[normalizedPath] ?? routes['/'];
const { default: RootComponent } = await loadRootComponent();

const app = new RootComponent({
  target: document.getElementById('app')
});

export default app;
