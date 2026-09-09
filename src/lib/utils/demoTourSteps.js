// Guided tour steps for the RapiMax demo environment.
// Each step declares the page it lives on; the tour engine navigates between
// pages and resumes from sessionStorage.

export const TOUR_STORAGE_KEY = 'rapimax_demo_tour';

export const tourSteps = [
  {
    page: '/',
    selector: '#inicio',
    title: 'Bienvenido a RapiMax',
    body: 'Esta es la plataforma digital completa de financiamiento vehicular. En este recorrido vas a ver cada funcionalidad activa, desde la captación del cliente hasta la gestión del crédito.',
    placement: 'center'
  },
  {
    page: '/',
    selector: '.scroll-layer--why',
    title: 'Beneficios con iconografía 3D',
    body: 'Cada beneficio se renderiza con un modelo 3D interactivo (WebGL) que reacciona al cursor. En dispositivos sin WebGL cae automáticamente a un ícono vectorial.',
    placement: 'top'
  },
  {
    page: '/',
    selector: '.scroll-layer--how-it-works',
    title: 'Cómo funciona',
    body: 'El proceso completo en pasos claros para el cliente: solicitud, análisis, aprobación y desembolso.',
    placement: 'top'
  },
  {
    page: '/',
    selector: '.scroll-layer--partners',
    title: 'Concesionarios aliados',
    body: 'Sección de partners con logos y categorías. Se administra desde el panel: cada aliado se activa o desactiva sin tocar código.',
    placement: 'top'
  },
  {
    page: '/',
    selector: '.scroll-layer--partner-map',
    title: 'Mapa de alianzas',
    body: 'Mapa interactivo con las 8 ubicaciones registradas en las 7 provincias. Incluye buscador por provincia y datos de contacto de cada punto.',
    placement: 'top'
  },
  {
    page: '/',
    selector: '.max-fab',
    title: 'Max, el Rapi-Agente inteligente',
    body: 'Asistente conversacional con inteligencia artificial, disponible en todas las páginas. Responde en voseo costarricense sobre productos, requisitos y proceso, y guía al cliente hacia la solicitud.',
    placement: 'left'
  },
  {
    page: '/calculadora',
    selector: '.calculator-stage',
    title: 'Calculadora de crédito',
    body: 'Simulador de cuota con monto, prima, plazo y moneda (USD o CRC). Cada simulación que deja correo se guarda como lead y crea un caso en el CRM automáticamente.',
    placement: 'top'
  },
  {
    page: '/solicitud',
    selector: '.rapi-id',
    title: 'Rapi-ID Check: captura inteligente de datos',
    body: 'El cliente fotografía su cédula (frente y reverso) y la inteligencia artificial extrae hasta 12 campos para pre-llenar el formulario. Reduce errores de digitación y el tiempo de solicitud.',
    placement: 'bottom'
  },
  {
    page: '/solicitud',
    selector: '.application-page',
    title: 'Formulario de solicitud completo',
    body: 'Datos personales, laborales, cónyuge y referencias. Al enviar, se guarda en la base de datos, se crea el caso en el CRM, se notifica al equipo por correo y el cliente recibe un enlace privado para seguir su solicitud.',
    placement: 'center'
  },
  {
    page: '/contactanos',
    selector: '.contact-form',
    title: 'Contacto con seguimiento',
    body: 'Cada mensaje entra al CRM como caso, dispara una notificación por correo al equipo y queda visible en el panel. Más abajo se activan las preguntas frecuentes con buscador.',
    placement: 'right'
  },
  {
    page: '/ingresar',
    selector: '.ingresar__form',
    title: 'Portal del cliente',
    body: 'El cliente consulta el estado de su solicitud con su correo o cédula. Ve la línea de tiempo del proceso y puede subir documentos adicionales.',
    placement: 'top'
  },
  {
    page: '/mi-credito',
    selector: '.loan-portal',
    title: 'Mi Crédito: gestión del préstamo',
    body: 'Tabla de amortización, historial de pagos, próxima cuota y pago con tarjeta. Probalo con el correo maria.rojas@ejemplo.co.cr (5 de 36 cuotas pagadas).',
    placement: 'center'
  },
  {
    page: '/admin',
    selector: '.login__card',
    title: 'Panel de administración',
    body: 'Dashboard con métricas, embudo de conversión, CRM Kanban, gestión de solicitudes, contactos, leads, usuarios y configuración del sitio. Ingresá con demo@rapimax-dev.com y la contraseña RapiMaxDemo2026 para explorarlo.',
    placement: 'right',
    final: true
  }
];
