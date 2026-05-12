import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const mainEntry = fileURLToPath(new URL('./index.html', import.meta.url));
const calculatorEntry = fileURLToPath(new URL('./calculadora/index.html', import.meta.url));
const applicationEntry = fileURLToPath(new URL('./solicitud/index.html', import.meta.url));
const requirementsEntry = fileURLToPath(new URL('./requisitos/index.html', import.meta.url));
const servicesEntry = fileURLToPath(new URL('./servicios/index.html', import.meta.url));
const contactEntry = fileURLToPath(new URL('./contactanos/index.html', import.meta.url));
const adminEntry = fileURLToPath(new URL('./admin/index.html', import.meta.url));
const portalEntry = fileURLToPath(new URL('./mi-solicitud/index.html', import.meta.url));
const ingresarEntry = fileURLToPath(new URL('./ingresar/index.html', import.meta.url));
const termsEntry = fileURLToPath(new URL('./terminos-y-condiciones/index.html', import.meta.url));
const privacyEntry = fileURLToPath(new URL('./politica-de-privacidad/index.html', import.meta.url));
const loanEntry = fileURLToPath(new URL('./mi-credito/index.html', import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: mainEntry,
        calculadora: calculatorEntry,
        solicitud: applicationEntry,
        requisitos: requirementsEntry,
        servicios: servicesEntry,
        contactanos: contactEntry,
        admin: adminEntry,
        'mi-solicitud': portalEntry,
        ingresar: ingresarEntry,
        'terminos-y-condiciones': termsEntry,
        'politica-de-privacidad': privacyEntry,
        'mi-credito': loanEntry
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
