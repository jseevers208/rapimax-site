# RapiMax: Ambiente DEMO

URL: la que imprime `wrangler deploy --env demo` (rapimax-demo.<cuenta>.workers.dev) hasta que se asigne el dominio definitivo del demo

Ambiente aislado y completo para demostraciones. Corre en un Worker separado
(`rapimax-demo`) con su propia base de datos D1 (`rapimax-demo`) y su propio
bucket R2 (`rapimax-demo-documents`). Producción (`rapimax-site`, rapimaxcr.com)
no se toca.

## Cómo funciona el switch

Todo se controla con la variable de build `VITE_DEMO_MODE`.

- Sin la variable (producción): las secciones ocultas siguen ocultas y
  `/calculadora` y `/solicitud` redirigen a `/contactanos`, exactamente como hoy.
- Con `VITE_DEMO_MODE=true`: se activan calculadora, solicitud con Rapi-ID,
  partners, mapa de alianzas, FAQ de contacto, botones de acceso, enlaces
  rápidos del footer, banner "Ambiente demo" y el recorrido guiado.

Los flags viven en `src/lib/utils/features.js`.

## Build y deploy

```
VITE_DEMO_MODE=true npm run build
npx wrangler deploy --env demo
```

Con Workers Builds (GitHub): crear el Worker `rapimax-demo` conectado a este
repo, build command `npm run build`, variable de build `VITE_DEMO_MODE=true`,
deploy command `npx wrangler deploy --env demo`.

El demo responde `X-Robots-Tag: noindex` y un `robots.txt` que bloquea todo,
para que nunca aparezca en buscadores. El dominio rapimax-dev.com no se usa.

## Secrets del Worker demo

Configurar en el dashboard (Settings > Variables and Secrets) o con
`npx wrangler secret put NOMBRE --env demo`:

- `ADMIN_PASSWORD` (también firma los JWT del panel)
- `RESEND_API_KEY` (notificaciones; el demo solo escribe a jorge@logeek.io)
- `ANTHROPIC_API_KEY` (Rapi-ID Check y el agente Max)

## Credenciales demo

Panel de administración (<URL del demo>/admin):

- super_admin: demo@rapimax-dev.com / RapiMaxDemo2026
- admin: andrea.mora@rapimax-dev.com / RapiMaxDemo2026
- admin: luis.chaves@rapimax-dev.com / RapiMaxDemo2026
- viewer: visor@rapimax-dev.com / RapiMaxDemo2026

Mi Crédito (<URL del demo>/mi-credito):

- maria.rojas@ejemplo.co.cr, cédula 1-1910-0328, préstamo RMX-2026-1001 (5 de 36 cuotas)
- carlos.quesada@ejemplo.co.cr, cédula 2-0105-0728, préstamo RMX-2026-1002 (22 de 24 cuotas)
- daniela.alvarado@ejemplo.co.cr, cédula 6-1491-0421, préstamo RMX-2026-1003 (0 de 48 cuotas)

Portal del cliente (<URL del demo>/ingresar): ingresar con
cualquiera de los correos anteriores o con las cédulas de las solicitudes demo.

## Datos

Todos los datos del demo son ficticios (dominio de correo `@ejemplo.co.cr`).
El semillero SQL está en `seed_demo.sql` fuera del repo (Logeek). Para
reiniciar el demo, vaciar las tablas y volver a cargar el semillero.
