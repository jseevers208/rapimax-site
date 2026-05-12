export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ID_TYPE_OPTIONS = [
  { value: 'cedula', label: 'Cédula' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'otro', label: 'Otro' }
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'M' },
  { value: 'F', label: 'F' }
];

export const RESIDENCE_OPTIONS = [
  { value: 'alquilada', label: 'Alquilada' },
  { value: 'parientes', label: 'Parientes' },
  { value: 'propia', label: 'Propia' },
  { value: 'hipotecada', label: 'Hipotecada' },
  { value: 'gratuita', label: 'Gratuita' }
];

export const MARITAL_STATUS_OPTIONS = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'union-libre', label: 'Unión libre' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'separado', label: 'Separado/a' }
];

export const COSTA_RICA_GEOGRAPHY = {
  'San José': [
    'San José',
    'Escazú',
    'Desamparados',
    'Puriscal',
    'Tarrazú',
    'Aserrí',
    'Mora',
    'Goicoechea',
    'Santa Ana',
    'Alajuelita',
    'Vásquez de Coronado',
    'Acosta',
    'Tibás',
    'Moravia',
    'Montes de Oca',
    'Turrubares',
    'Dota',
    'Curridabat',
    'Pérez Zeledón',
    'León Cortés Castro'
  ],
  Alajuela: [
    'Alajuela',
    'San Ramón',
    'Grecia',
    'San Mateo',
    'Atenas',
    'Naranjo',
    'Palmares',
    'Poás',
    'Orotina',
    'San Carlos',
    'Zarcero',
    'Valverde Vega',
    'Upala',
    'Los Chiles',
    'Guatuso',
    'Río Cuarto'
  ],
  Cartago: [
    'Cartago',
    'Paraíso',
    'La Unión',
    'Jiménez',
    'Turrialba',
    'Alvarado',
    'Oreamuno',
    'El Guarco'
  ],
  Heredia: [
    'Heredia',
    'Barva',
    'Santo Domingo',
    'Santa Bárbara',
    'San Rafael',
    'San Isidro',
    'Belén',
    'Flores',
    'San Pablo',
    'Sarapiquí'
  ],
  Guanacaste: [
    'Liberia',
    'Nicoya',
    'Santa Cruz',
    'Bagaces',
    'Carrillo',
    'Cañas',
    'Abangares',
    'Tilarán',
    'Nandayure',
    'La Cruz',
    'Hojancha'
  ],
  Puntarenas: [
    'Puntarenas',
    'Esparza',
    'Buenos Aires',
    'Montes de Oro',
    'Osa',
    'Quepos',
    'Golfito',
    'Coto Brus',
    'Parrita',
    'Corredores',
    'Garabito',
    'Monteverde',
    'Puerto Jiménez'
  ],
  Limón: [
    'Limón',
    'Pococí',
    'Siquirres',
    'Talamanca',
    'Matina',
    'Guácimo'
  ]
};

export const PROVINCE_OPTIONS = Object.keys(COSTA_RICA_GEOGRAPHY);

export const FINANCING_STEPS = [
  {
    id: 'general',
    eyebrow: 'Formulario Solicitud de Crédito Personas físicas',
    title: 'Datos generales',
    description: 'Ingresá la información principal de la solicitud y los datos personales del solicitante.'
  },
  {
    id: 'employment',
    eyebrow: 'Formulario Solicitud de Crédito Personas físicas',
    title: 'Información Laboral',
    description: 'Completá los datos laborales y de contacto profesional del solicitante.'
  },
  {
    id: 'spouse',
    eyebrow: 'Formulario Solicitud de Crédito Personas físicas',
    title: 'Datos del Cónyuge',
    description: 'Esta fase solo aplica cuando el estado civil requiere capturar información del cónyuge.'
  },
  {
    id: 'references',
    eyebrow: 'Formulario Solicitud de Crédito Personas físicas',
    title: 'Referencias Familiares',
    description: 'Agregá dos referencias familiares que no vivan en el mismo domicilio del deudor.'
  }
];

export const LEGAL_DISCLAIMER = 'Al enviar esta solicitud, autorizo a Rapi Moto Credit S.A. (cédula jurídica 3-101-748267) a verificar la información suministrada, consultar mi historial crediticio ante las centrales de riesgo autorizadas, y compartir los datos proporcionados con entidades financieras aliadas para fines de evaluación y otorgamiento de crédito. Entiendo que la información suministrada está sujeta a verificación y que la aprobación del financiamiento depende del cumplimiento de los requisitos establecidos por la entidad financiera correspondiente. Me comprometo a informar a RapiMax dentro de un plazo máximo de 30 días naturales si ocurre algún cambio en mi situación financiera, laboral o personal que pueda afectar la información contenida en esta solicitud. El tratamiento de mis datos personales se rige por la Ley N° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales.';
