export const REFERENCE_ANNUAL_RATE = 0.105;
export const MAX_TERM_MONTHS = 84;
export const MIN_DOWN_PAYMENT_PERCENT = 0.2;
export const MIN_VEHICLE_YEAR = 2000;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VEHICLE_TYPE_OPTIONS = [
  {
    value: 'carro',
    label: 'Carro',
    description: 'Ideal para uso personal, familiar o ejecutivo.'
  },
  {
    value: 'motocicleta',
    label: 'Motocicleta',
    description: 'Una opción ágil para moverte o trabajar.'
  }
];

export const VEHICLE_USE_OPTIONS = [
  {
    value: 'particular',
    label: 'Particular',
    description: 'Para tu rutina diaria, familia o movilidad personal.'
  },
  {
    value: 'comercial',
    label: 'Comercial',
    description: 'Pensado para negocio, entregas o actividad productiva.'
  }
];

export const CURRENCY_OPTIONS = [
  {
    value: 'USD',
    label: 'USD',
    description: 'Mostramos la simulación en dólares estadounidenses.'
  },
  {
    value: 'CRC',
    label: 'CRC',
    description: 'Mostramos la simulación en colones costarricenses.'
  }
];

export const CALCULATOR_STEPS = [
  {
    id: 'vehicleType',
    title: '¿Qué tipo de vehículo querés financiar?',
    description: 'Seleccioná la categoría base para tu simulación.',
    kind: 'options'
  },
  {
    id: 'vehicleUse',
    title: '¿Cómo vas a usar el vehículo?',
    description: 'Esto se captura para tu perfil comercial en la siguiente etapa.',
    kind: 'options'
  },
  {
    id: 'currency',
    title: 'Elegí la moneda de referencia',
    description: 'La estimación se mostrará en la moneda que seleccionés.',
    kind: 'options'
  },
  {
    id: 'vehicleValue',
    title: '¿Cuál es el valor del vehículo?',
    description: 'Ingresá el monto aproximado del vehículo que querés financiar.',
    kind: 'currency'
  },
  {
    id: 'year',
    title: '¿De qué año es el vehículo?',
    description: 'Usamos este dato como parte del perfil del caso.',
    kind: 'year'
  },
  {
    id: 'downPayment',
    title: '¿Cuánto querés dar de prima?',
    description: 'La prima mínima referencial para esta simulación es del 20%.',
    kind: 'currency'
  },
  {
    id: 'termMonths',
    title: '¿Cuántos meses querés financiar?',
    description: 'Podés elegir un plazo entre 1 y 84 meses.',
    kind: 'term'
  },
  {
    id: 'email',
    title: 'Ingresá tu correo para ver tu tasa referencial',
    description: 'No enviamos estos datos a ningún servicio en esta versión.',
    kind: 'email'
  }
];

export const DISCLAIMER_PARAGRAPHS = [
  'La tasa de interés usada para el cálculo de las cuotas está referenciada a la tasa SOFR más un margen o spread. Tasa de interés anual inicial a hoy 10.50%, posteriormente revisable cada tres meses durante el plazo del Contrato de Leasing Financiero. Condiciones sujetas a aprobación y confirmación por parte de la Arrendadora una vez entregados los requisitos del solicitante.',
  'Al solicitar mi preaprobación, autorizo de manera expresa a la empresa Rapi Moto Credit S.A., cédula jurídica 3-101-748267, a consultar y verificar mi información personal en las bases de datos crediticias correspondientes. Asimismo, declaro bajo fe de juramento que toda la información proporcionada en este formulario es veraz y corresponde a la realidad.'
];
