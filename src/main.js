import 'lenis/dist/lenis.css';
import './app.css';

const routes = {
  '/': () => import('./App.svelte'),
  '/calculadora': () => import('./CalculatorApp.svelte'),
  '/solicitud': () => import('./FinancingApp.svelte'),
  '/contactanos': () => import('./ContactApp.svelte'),
  '/requisitos': () => import('./RequirementsApp.svelte'),
  '/servicios': () => import('./ServicesApp.svelte'),
  '/mi-solicitud': () => import('./PortalApp.svelte')
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
