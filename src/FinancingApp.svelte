<script>
  import SiteLayout from './lib/components/SiteLayout.svelte';
  import {
    COSTA_RICA_GEOGRAPHY,
    CREDIT_FACILITY_OPTIONS,
    CURRENCY_OPTIONS,
    EMAIL_REGEX,
    FINANCING_STEPS,
    GENDER_OPTIONS,
    ID_TYPE_OPTIONS,
    LEGAL_DISCLAIMER,
    MARITAL_STATUS_OPTIONS,
    PROVINCE_OPTIONS,
    RESIDENCE_OPTIONS
  } from './lib/financing/constants.js';

  const ALL_STEP_IDS = FINANCING_STEPS.map((step) => step.id);
  const SPOUSE_REQUIRED_STATUSES = new Set(['casado', 'union-libre']);
  const COUNTRY_DEFAULT = 'Costa Rica';
  const makeField = (name, label, type = 'text', config = {}) => ({ name, label, type, ...config });

  const createInitialAnswers = () => ({
    creditFacilityType: '', requestedCurrency: 'USD', requestedCreditAmount: '', requestedTermMonths: '', applicantIdType: '', applicantIdNumber: '',
    applicantFullName: '', applicantGender: '', maritalStatus: '', birthPlace: '', birthCountry: COUNTRY_DEFAULT, birthProvince: '', birthCanton: '', birthDate: '',
    nationality: '', profession: '', neighborhood: '', landlinePhone: '', cellPhone: '', personalEmail: '', homeAddress: '',
    homeCountry: COUNTRY_DEFAULT, homeProvince: '', homeCanton: '', residenceType: '', housingPayment: '', exactHomeAddress: '',
    employerName: '', occupation: '', grossMonthlyIncome: '', employmentStartDate: '', businessActivity: '', workNeighborhood: '',
    workPhone: '', workFax: '', workEmail: '', workAddress: '', workCountry: COUNTRY_DEFAULT, workProvince: '', workCanton: '',
    specificWorkAddress: '', spouseIdType: '', spouseIdNumber: '', spouseFullName: '', spouseGender: '', spouseNationality: '',
    spouseBirthPlace: '', spouseEmploymentStartDate: '', spouseProfession: '', spouseGrossMonthlyIncome: '',
    reference1Name: '', reference1Phone: '', reference1Relationship: '', reference2Name: '', reference2Phone: '', reference2Relationship: ''
  });

  const stepLayouts = {
    general: [
      {
        columns: 2,
        fields: [
          makeField('creditFacilityType', 'Tipo de facilidad crediticia', 'select', { full: true, options: CREDIT_FACILITY_OPTIONS, requiredMessage: 'Seleccioná el tipo de facilidad crediticia.' }),
          makeField('requestedCurrency', 'Moneda', 'select', { options: CURRENCY_OPTIONS }),
          makeField('requestedCreditAmount', 'Monto solicitado', 'currency', { placeholder: '25,000.00', inputmode: 'decimal', invalidMessage: 'Ingresá un monto de crédito válido.' }),
          makeField('requestedTermMonths', 'Plazo solicitado (meses)', 'int', { placeholder: '84 meses max', min: '1', max: '84', step: '1', inputmode: 'numeric', invalidMessage: 'Ingresá un plazo válido (1–84 meses).' })
        ]
      },
      {
        columns: 2,
        fields: [
          makeField('applicantIdType', 'Tipo ID', 'radio', { options: ID_TYPE_OPTIONS, requiredMessage: 'Seleccioná el tipo de identificación.' }),
          makeField('applicantIdNumber', 'Número ID', 'text', { placeholder: 'Número ID', requiredMessage: 'Ingresá el número de identificación.' }),
          makeField('applicantFullName', 'Nombre completo', 'text', { full: true, placeholder: 'Nombre completo', requiredMessage: 'Ingresá el nombre completo.' }),
          makeField('applicantGender', 'Sexo', 'radio', { options: GENDER_OPTIONS, requiredMessage: 'Seleccioná el sexo del solicitante.', compact: true }),
          makeField('maritalStatus', 'Estado civil', 'select', { options: MARITAL_STATUS_OPTIONS, requiredMessage: 'Seleccioná el estado civil.' }),
          makeField('birthPlace', 'Lugar de nacimiento', 'text', { placeholder: 'Lugar de nacimiento', requiredMessage: 'Ingresá el lugar de nacimiento.' }),
          makeField('birthCountry', 'País de nacimiento', 'select', { options: [{ value: COUNTRY_DEFAULT, label: COUNTRY_DEFAULT }] }),
          makeField('birthProvince', 'Provincia de nacimiento', 'select', { options: PROVINCE_OPTIONS.map((p) => ({ value: p, label: p })), resetField: 'birthCanton', requiredMessage: 'Seleccioná la provincia de nacimiento.' }),
          makeField('birthCanton', 'Cantón de nacimiento', 'select', { getOptions: (currentAnswers) => getCantons(currentAnswers.birthProvince), requiredMessage: 'Seleccioná el cantón de nacimiento.' }),
          makeField('birthDate', 'Fecha de nacimiento', 'date', { requiredMessage: 'Seleccioná la fecha de nacimiento.', futureMessage: 'La fecha de nacimiento no puede estar en el futuro.' }),
          makeField('nationality', 'Nacionalidad', 'text', { placeholder: 'Nacionalidad', requiredMessage: 'Ingresá la nacionalidad.' }),
          makeField('profession', 'Profesión / Oficio', 'text', { full: true, placeholder: 'Profesión / Oficio', requiredMessage: 'Ingresá la profesión u oficio.' })
        ]
      },
      {
        columns: 2,
        fields: [
          makeField('neighborhood', 'Barrio / Señas adicionales', 'text', { full: true, placeholder: 'Barrio, urbanización o señas adicionales', requiredMessage: 'Ingresá el barrio o señas adicionales.' }),
          makeField('landlinePhone', 'Teléfono fijo', 'tel', { placeholder: 'Teléfono fijo', optional: true }),
          makeField('cellPhone', 'Celular', 'tel', { placeholder: 'Celular', requiredMessage: 'Ingresá el celular.' }),
          makeField('personalEmail', 'Email personal', 'email', { full: true, placeholder: 'Email personal', requiredMessage: 'Ingresá el email personal.', invalidMessage: 'Ingresá un email personal válido.' }),
          makeField('homeAddress', 'Dirección', 'text', { full: true, placeholder: 'Dirección', requiredMessage: 'Ingresá la dirección.' }),
          makeField('homeCountry', 'País', 'select', { options: [{ value: COUNTRY_DEFAULT, label: COUNTRY_DEFAULT }] }),
          makeField('homeProvince', 'Provincia', 'select', { options: PROVINCE_OPTIONS.map((province) => ({ value: province, label: province })), resetField: 'homeCanton', requiredMessage: 'Seleccioná la provincia del domicilio.' }),
          makeField('homeCanton', 'Cantón', 'select', { full: true, getOptions: (currentAnswers) => getCantons(currentAnswers.homeProvince), requiredMessage: 'Seleccioná el cantón del domicilio.' }),
          makeField('residenceType', 'Tipo de residencia', 'radio', { full: true, options: RESIDENCE_OPTIONS, requiredMessage: 'Seleccioná el tipo de residencia.' }),
          makeField('housingPayment', 'Pago mensual vivienda', 'currency', { placeholder: '150,000', inputmode: 'decimal', invalidMessage: 'Ingresá el pago mensual de vivienda.' }),
          makeField('exactHomeAddress', 'Dirección exacta del domicilio', 'text', { full: true, placeholder: 'Dirección exacta del domicilio', requiredMessage: 'Ingresá la dirección exacta del domicilio.' })
        ]
      }
    ],
    employment: [
      {
        columns: 2,
        fields: [
          makeField('employerName', 'Nombre Patrono', 'text', { full: true, placeholder: 'Nombre Patrono', requiredMessage: 'Ingresá el nombre del patrono.' }),
          makeField('occupation', 'Ocupación', 'text', { full: true, placeholder: 'Ocupación', requiredMessage: 'Ingresá la ocupación.' }),
          makeField('grossMonthlyIncome', 'Ingresos Bruto Mensual', 'currency', { placeholder: '750,000', inputmode: 'decimal', invalidMessage: 'Ingresá el ingreso bruto mensual.' }),
          makeField('employmentStartDate', 'Fecha de Ingreso', 'date', { requiredMessage: 'Seleccioná la fecha de ingreso.', futureMessage: 'La fecha de ingreso no puede estar en el futuro.' }),
          makeField('businessActivity', 'Actividad Empresarial', 'text', { full: true, placeholder: 'Actividad Empresarial', requiredMessage: 'Ingresá la actividad empresarial.' }),
          makeField('workNeighborhood', 'Barrio / Señas del trabajo', 'text', { full: true, placeholder: 'Barrio, urbanización o señas del lugar de trabajo', requiredMessage: 'Ingresá el barrio o señas del trabajo.' }),
          makeField('workPhone', 'Teléfono', 'tel', { placeholder: 'Teléfono', requiredMessage: 'Ingresá el teléfono de trabajo.' }),
          makeField('workFax', 'Fax', 'tel', { placeholder: 'Fax', optional: true }),
          makeField('workEmail', 'Email', 'email', { full: true, placeholder: 'Email', requiredMessage: 'Ingresá el email laboral.', invalidMessage: 'Ingresá un email laboral válido.' }),
          makeField('workAddress', 'Dirección', 'text', { full: true, placeholder: 'Dirección', requiredMessage: 'Ingresá la dirección de trabajo.' }),
          makeField('workCountry', 'País', 'select', { options: [{ value: COUNTRY_DEFAULT, label: COUNTRY_DEFAULT }] }),
          makeField('workProvince', 'Provincia', 'select', { options: PROVINCE_OPTIONS.map((province) => ({ value: province, label: province })), resetField: 'workCanton', requiredMessage: 'Seleccioná la provincia de trabajo.' }),
          makeField('workCanton', 'Cantón', 'select', { full: true, getOptions: (currentAnswers) => getCantons(currentAnswers.workProvince), requiredMessage: 'Seleccioná el cantón de trabajo.' }),
          makeField('specificWorkAddress', 'Domicilio específico', 'text', { full: true, placeholder: 'Domicilio específico', requiredMessage: 'Ingresá el domicilio específico.' })
        ]
      }
    ],
    spouse: [
      {
        columns: 2,
        fields: [
          makeField('spouseIdType', 'Tipo ID', 'radio', { options: ID_TYPE_OPTIONS, requiredMessage: 'Seleccioná el tipo de identificación del cónyuge.' }),
          makeField('spouseIdNumber', 'Número ID', 'text', { placeholder: 'Número ID', requiredMessage: 'Ingresá el número de identificación del cónyuge.' }),
          makeField('spouseFullName', 'Nombre completo', 'text', { full: true, placeholder: 'Nombre completo', requiredMessage: 'Ingresá el nombre completo del cónyuge.' }),
          makeField('spouseGender', 'Sexo', 'radio', { options: GENDER_OPTIONS, compact: true, requiredMessage: 'Seleccioná el sexo del cónyuge.' }),
          makeField('spouseNationality', 'Nacionalidad', 'text', { placeholder: 'Nacionalidad', requiredMessage: 'Ingresá la nacionalidad del cónyuge.' }),
          makeField('spouseBirthPlace', 'Lugar de nacimiento', 'text', { full: true, placeholder: 'Lugar de nacimiento', requiredMessage: 'Ingresá el lugar de nacimiento del cónyuge.' }),
          makeField('spouseEmploymentStartDate', 'Fecha de Ingreso', 'date', { requiredMessage: 'Seleccioná la fecha de ingreso del cónyuge.', futureMessage: 'La fecha de ingreso del cónyuge no puede estar en el futuro.' }),
          makeField('spouseProfession', 'Profesión / Oficio', 'text', { placeholder: 'Profesión / Oficio', requiredMessage: 'Ingresá la profesión u oficio del cónyuge.' }),
          makeField('spouseGrossMonthlyIncome', 'Ingresos Bruto Mensual', 'currency', { full: true, placeholder: '500,000', inputmode: 'decimal', invalidMessage: 'Ingresá el ingreso bruto mensual del cónyuge.' })
        ]
      }
    ],
    references: [
      {
        title: 'Referencia 1',
        badge: '1',
        fields: [
          makeField('reference1Name', 'Nombre completo', 'text', { placeholder: 'Nombre completo', requiredMessage: 'Ingresá el nombre completo de la referencia 1.' }),
          makeField('reference1Phone', 'Teléfono', 'tel', { placeholder: 'Teléfono', requiredMessage: 'Ingresá el teléfono de la referencia 1.' }),
          makeField('reference1Relationship', 'Parentesco', 'text', { placeholder: 'Parentesco', requiredMessage: 'Ingresá el parentesco de la referencia 1.' })
        ]
      },
      {
        title: 'Referencia 2',
        badge: '2',
        fields: [
          makeField('reference2Name', 'Nombre completo', 'text', { placeholder: 'Nombre completo', requiredMessage: 'Ingresá el nombre completo de la referencia 2.' }),
          makeField('reference2Phone', 'Teléfono', 'tel', { placeholder: 'Teléfono', requiredMessage: 'Ingresá el teléfono de la referencia 2.' }),
          makeField('reference2Relationship', 'Parentesco', 'text', { placeholder: 'Parentesco', requiredMessage: 'Ingresá el parentesco de la referencia 2.' })
        ]
      }
    ]
  };

  const getCantons = (province) => COSTA_RICA_GEOGRAPHY[province] ?? [];

  // Currency input formatting
  const formatCurrencyInput = (value) => {
    if (!value && value !== 0) return '';
    const num = String(value).replace(/[^0-9.]/g, '');
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0];
  };
  const parseCurrencyInput = (formatted) => formatted.replace(/,/g, '');
  const isBlank = (value) => (value ?? '').trim().length === 0;
  const getFieldOptions = (field) => field.getOptions ? field.getOptions(answers).map((value) => ({ value, label: value })) : field.options ?? [];
  const getOptionLabel = (options, value) => options.find((option) => option.value === value)?.label ?? value;
  const formatMoney = (value, currency) => {
    if (!Number.isFinite(Number(value)) || Number(value) <= 0) return '';
    const cur = currency || answers.requestedCurrency || 'USD';
    return new Intl.NumberFormat('es-CR', {
      style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 2
    }).format(Number(value));
  };
  const isFutureDate = (value) => {
    if (!value) return false;
    const selectedDate = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  let answers = createInitialAnswers();
  let attemptedAdvance = false;
  let currentStepIndex = 0;
  let showSuccess = false;

  // Rapi-ID Check state
  let rapiIdOpen = false;
  let rapiIdLoading = false;
  let rapiIdMessage = '';
  let rapiIdError = '';
  let rapiIdFrontFile = null;
  let rapiIdBackFile = null;

  async function handleRapiIdScan() {
    if (!rapiIdFrontFile) { rapiIdError = 'Seleccioná la imagen frontal de la cédula.'; return; }
    rapiIdLoading = true;
    rapiIdError = '';
    rapiIdMessage = '';

    const formData = new FormData();
    formData.append('front', rapiIdFrontFile);
    if (rapiIdBackFile) formData.append('back', rapiIdBackFile);

    try {
      const res = await fetch('/api/rapi-id', { method: 'POST', body: formData });
      const result = await res.json();

      if (result.success && result.data) {
        // Auto-fill form fields from AI extraction
        const extracted = result.data;
        const updated = { ...answers };
        for (const [key, value] of Object.entries(extracted)) {
          if (value && key in updated) updated[key] = value;
        }
        answers = updated;
        rapiIdMessage = result.message || '¡Datos extraídos exitosamente!';
        // Auto-close after success
        setTimeout(() => { rapiIdOpen = false; }, 2000);
      } else {
        rapiIdError = result.error || 'No se pudo procesar la cédula.';
      }
    } catch {
      rapiIdError = 'Error de conexión. Intentá de nuevo.';
    }
    rapiIdLoading = false;
  }

  const setFieldValue = (field, value) => {
    const nextAnswers = { ...answers, [field.name]: value };
    if (field.resetField) nextAnswers[field.resetField] = '';
    answers = nextAnswers;
  };

  const resetForm = () => {
    answers = createInitialAnswers();
    currentStepIndex = 0;
    attemptedAdvance = false;
    showSuccess = false;
  };

  const hasAnyAnswer = () =>
    Object.entries(answers).some(([key, value]) => {
      if ((key === 'homeCountry' || key === 'workCountry') && value === COUNTRY_DEFAULT) return false;
      return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
    });

  const getFieldsForStep = (stepId) => stepLayouts[stepId].flatMap((section) => section.fields);

  const validateField = (field) => {
    const value = answers[field.name];
    if (field.optional && isBlank(value)) return '';
    if ((field.type === 'text' || field.type === 'tel' || field.type === 'radio' || field.type === 'select') && isBlank(value)) return field.requiredMessage ?? `Ingresá ${field.label.toLowerCase()}.`;
    if (field.type === 'email') {
      if (isBlank(value)) return field.requiredMessage ?? `Ingresá ${field.label.toLowerCase()}.`;
      if (!EMAIL_REGEX.test(value.trim())) return field.invalidMessage ?? 'Ingresá un email válido.';
    }
    if (field.type === 'number') {
      if (!Number.isFinite(Number(value)) || Number(value) <= 0) return field.invalidMessage ?? `Ingresá ${field.label.toLowerCase()} válido.`;
    }
    if (field.type === 'currency') {
      const raw = parseCurrencyInput(String(value));
      if (!Number.isFinite(Number(raw)) || Number(raw) <= 0) return field.invalidMessage ?? `Ingresá ${field.label.toLowerCase()} válido.`;
    }
    if (field.type === 'int') {
      if (!Number.isInteger(Number(value)) || Number(value) <= 0) return field.invalidMessage ?? `Ingresá ${field.label.toLowerCase()} válido.`;
      if (field.max && Number(value) > Number(field.max)) return field.invalidMessage ?? `El valor máximo es ${field.max}.`;
    }
    if (field.type === 'date') {
      if (isBlank(value)) return field.requiredMessage ?? `Seleccioná ${field.label.toLowerCase()}.`;
      if (isFutureDate(value)) return field.futureMessage ?? 'La fecha no puede estar en el futuro.';
    }
    return '';
  };

  const getStepErrors = (stepId) => Object.fromEntries(
    getFieldsForStep(stepId)
      .map((field) => [field.name, validateField(field)])
      .filter(([, error]) => Boolean(error))
  );

  let isSubmitting = false;
  let submitError = '';
  let portalUrl = '';

  const handleAdvance = async () => {
    attemptedAdvance = true;
    const errors = getStepErrors(currentStepId);
    if (Object.keys(errors).length) return;
    if (currentStepIndex === activeStepIds.length - 1) {
      isSubmitting = true;
      submitError = '';
      try {
        const response = await fetch('/api/solicitud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
        const result = await response.json();
        if (result.success) {
          portalUrl = result.portalUrl || '';
          showSuccess = true;
        } else {
          submitError = result.error || 'Error al enviar la solicitud.';
        }
      } catch (err) {
        submitError = 'Error de conexión. Intentá de nuevo.';
      } finally {
        isSubmitting = false;
        attemptedAdvance = false;
      }
      return;
    }
    currentStepIndex += 1;
    attemptedAdvance = false;
  };

  const handleBack = () => {
    if (currentStepIndex === 0) return;
    currentStepIndex -= 1;
    attemptedAdvance = false;
  };

  $: spouseRequired = SPOUSE_REQUIRED_STATUSES.has(answers.maritalStatus);
  $: activeStepIds = spouseRequired ? ALL_STEP_IDS : ALL_STEP_IDS.filter((stepId) => stepId !== 'spouse');
  $: if (!showSuccess && currentStepIndex > activeStepIds.length - 1) currentStepIndex = Math.max(activeStepIds.length - 1, 0);
  $: currentStepId = showSuccess ? null : activeStepIds[Math.min(currentStepIndex, activeStepIds.length - 1)];
  $: currentStep = currentStepId ? FINANCING_STEPS.find((step) => step.id === currentStepId) : null;
  $: currentSections = currentStepId ? stepLayouts[currentStepId] : [];
  $: currentStepErrors = currentStepId ? getStepErrors(currentStepId) : {};
  $: actualStepTotal = activeStepIds.length;
  $: progressLabel = showSuccess ? 'Solicitud completada' : `Paso ${currentStepIndex + 1} de ${actualStepTotal}`;
  $: sidebarSteps = FINANCING_STEPS.map((step) => {
    const activeIndex = activeStepIds.indexOf(step.id);
    const isSkipped = step.id === 'spouse' && !spouseRequired && !isBlank(answers.maritalStatus);
    const isUndecided = step.id === 'spouse' && isBlank(answers.maritalStatus);
    return {
      ...step,
      isSkipped,
      isUndecided,
      isCurrent: !showSuccess && step.id === currentStepId,
      isComplete: activeIndex > -1 && (showSuccess || activeIndex < currentStepIndex)
    };
  });
  $: progressDots = activeStepIds.map((stepId, index) => ({
    stepId,
    isCurrent: !showSuccess && index === currentStepIndex,
    isComplete: showSuccess || index < currentStepIndex
  }));
</script>

<SiteLayout page="solicitud" footerSpacing="compact">
  <section class="application-page section">
    <div class="application-page__shell">
      <header class="application-page__intro">
        <div class="application-page__headline">
          <h1>Iniciá tu solicitud de financiamiento en línea</h1>
        </div>
      </header>

      <!-- Rapi-ID Check -->
      {#if !showSuccess}
        <div class="rapi-id" class:rapi-id--open={rapiIdOpen}>
          <button type="button" class="rapi-id__toggle" on:click={() => { rapiIdOpen = !rapiIdOpen; }}>
            <span class="rapi-id__badge">⚡ Rapi-ID Check</span>
            <span class="rapi-id__hint">{rapiIdOpen ? 'Cerrar' : 'Escaneá tu cédula y auto-completá el formulario'}</span>
            <span class="rapi-id__arrow">{rapiIdOpen ? '▲' : '▼'}</span>
          </button>

          {#if rapiIdOpen}
            <div class="rapi-id__panel">
              <p class="rapi-id__desc">Subí una foto de tu cédula (frente y opcional reverso) y la inteligencia artificial completará los datos automáticamente.</p>

              <div class="rapi-id__uploads">
                <label class="rapi-id__upload-box">
                  <span class="rapi-id__upload-icon">{rapiIdFrontFile ? '✅' : '📷'}</span>
                  <span class="rapi-id__upload-label">{rapiIdFrontFile ? rapiIdFrontFile.name.slice(0, 20) : 'Frente de cédula'}</span>
                  <span class="rapi-id__upload-req">Requerido</span>
                  <input type="file" accept="image/*" on:change={(e) => { rapiIdFrontFile = e.target.files?.[0] || null; rapiIdError = ''; }} style="display:none" />
                </label>
                <label class="rapi-id__upload-box">
                  <span class="rapi-id__upload-icon">{rapiIdBackFile ? '✅' : '📷'}</span>
                  <span class="rapi-id__upload-label">{rapiIdBackFile ? rapiIdBackFile.name.slice(0, 20) : 'Reverso de cédula'}</span>
                  <span class="rapi-id__upload-req">Opcional</span>
                  <input type="file" accept="image/*" on:change={(e) => { rapiIdBackFile = e.target.files?.[0] || null; }} style="display:none" />
                </label>
              </div>

              {#if rapiIdError}
                <p class="rapi-id__error">{rapiIdError}</p>
              {/if}
              {#if rapiIdMessage}
                <p class="rapi-id__success">{rapiIdMessage}</p>
              {/if}

              <button type="button" class="rapi-id__scan-btn" disabled={rapiIdLoading || !rapiIdFrontFile} on:click={handleRapiIdScan}>
                {#if rapiIdLoading}
                  <span class="rapi-id__spinner"></span> Analizando cédula...
                {:else}
                  ⚡ Escanear y auto-completar
                {/if}
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <div class="application-stage">
        <div class="summary-card summary-card--row">
          <div class="summary-card__lead">
            <strong>{progressLabel}</strong>
            <div class="summary-progress" style={`--progress-dot-count: ${progressDots.length};`} aria-hidden="true">
              {#each progressDots as dot}
                <span class="summary-progress__dot" class:is-current={dot.isCurrent} class:is-complete={dot.isComplete}></span>
              {/each}
            </div>
          </div>
          <div class="phase-list" aria-label="Fases del formulario">
            {#each sidebarSteps as step, index}
              <div
                class="phase-list__item"
                class:is-current={step.isCurrent}
                class:is-complete={step.isComplete}
                class:is-skipped={step.isSkipped}
                class:is-undecided={step.isUndecided}
              >
                <div class="phase-list__index">{index + 1}</div>
                <div class="phase-list__content">
                  <span>{step.title}</span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="application-card">
          {#if !showSuccess}
            <form class="application-form" on:submit|preventDefault={handleAdvance}>
              <div class="application-card__top">
                <h2>{currentStep.title}</h2>
              </div>

              <div class="application-card__body">
                {#each currentSections as section}
                  <section class:reference-card={currentStepId === 'references'} class="form-section">
                    {#if currentStepId === 'references'}
                      <div class="reference-card__header">
                        <span class="reference-card__number">{section.badge}</span>
                        <h3>{section.title}</h3>
                      </div>
                    {/if}

                    <div class="form-grid">
                      {#each section.fields as field}
                        {#if field.type === 'radio'}
                          <fieldset class:field-card--full={field.full} class="radio-field">
                            <legend class="radio-field__label">{field.label}</legend>
                            <div class="field-card field-card--radio">
                              <div class:radio-group--compact={field.compact} class="radio-group">
                                {#each field.options as option}
                                  <label class="radio-pill">
                                    <input
                                      type="radio"
                                      name={field.name}
                                      value={option.value}
                                      checked={answers[field.name] === option.value}
                                      on:change={() => setFieldValue(field, option.value)}
                                    />
                                    <span>{option.label}</span>
                                  </label>
                                {/each}
                              </div>
                            </div>
                            {#if attemptedAdvance && currentStepErrors[field.name]}
                              <span class="field-card__error">{currentStepErrors[field.name]}</span>
                            {/if}
                          </fieldset>
                        {:else}
                          <label class:field-card--full={field.full} class="field-card">
                            <span class="field-card__label">{field.label}</span>
                            {#if field.type === 'select'}
                              <select value={answers[field.name]} on:change={(event) => setFieldValue(field, event.currentTarget.value)}>
                                <option value="">{field.name.endsWith('Country') ? COUNTRY_DEFAULT : `Seleccioná ${field.label.toLowerCase()}`}</option>
                                {#each getFieldOptions(field) as option}
                                  <option value={option.value}>{option.label}</option>
                                {/each}
                              </select>
                            {:else if field.type === 'currency'}
                              <input
                                type="text"
                                inputmode={field.inputmode}
                                placeholder={field.placeholder}
                                value={formatCurrencyInput(answers[field.name])}
                                on:input={(event) => {
                                  const raw = parseCurrencyInput(event.currentTarget.value);
                                  setFieldValue(field, raw);
                                  event.currentTarget.value = formatCurrencyInput(raw);
                                }}
                              />
                            {:else}
                              <input
                                type={field.type === 'int' ? 'number' : field.type}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                inputmode={field.inputmode}
                                placeholder={field.placeholder}
                                value={answers[field.name]}
                                on:input={(event) => setFieldValue(field, event.currentTarget.value)}
                              />
                            {/if}
                            {#if attemptedAdvance && currentStepErrors[field.name]}
                              <span class="field-card__error">{currentStepErrors[field.name]}</span>
                            {/if}
                          </label>
                        {/if}
                      {/each}
                    </div>
                  </section>
                {/each}
              </div>

              <div class="application-card__actions">
                {#if submitError}
                  <p class="application-card__error">{submitError}</p>
                {/if}
                {#if currentStepIndex === 0}
                  <button type="button" class="btn ghost application-card__secondary" on:click={resetForm} disabled={!hasAnyAnswer() || isSubmitting}>
                    Borrar
                  </button>
                {:else}
                  <button type="button" class="btn ghost application-card__secondary" on:click={handleBack} disabled={isSubmitting}>
                    Atrás
                  </button>
                {/if}
                <button type="submit" class="btn primary application-card__primary" disabled={isSubmitting}>
                  {#if isSubmitting}
                    Enviando...
                  {:else}
                    {currentStepIndex === activeStepIds.length - 1 ? 'Enviar' : 'Siguiente'}
                  {/if}
                </button>
              </div>
            </form>
          {:else}
            <div class="application-result">
              <div class="application-card__top">
                <div>
                  <p class="application-card__step-label">Solicitud completada</p>
                  <h2>¡Tu solicitud fue enviada!</h2>
                </div>
                <p class="application-card__description">
                  Gracias, {answers.applicantFullName}. Recibimos tu solicitud de financiamiento. Un asesor la revisará y te contactará pronto.
                </p>
              </div>

              <div class="result-hero">
                <p class="result-hero__eyebrow">Resumen final</p>
                <strong>{answers.applicantFullName}</strong>
                <span>{formatMoney(answers.requestedCreditAmount, answers.requestedCurrency)} · {answers.requestedTermMonths} meses · {answers.employerName}</span>
              </div>

              <div class="result-grid">
                <article class="result-card"><span>Monto solicitado</span><strong>{formatMoney(answers.requestedCreditAmount, answers.requestedCurrency)}</strong></article>
                <article class="result-card"><span>Plazo solicitado</span><strong>{answers.requestedTermMonths} meses</strong></article>
                <article class="result-card"><span>Estado civil</span><strong>{getOptionLabel(MARITAL_STATUS_OPTIONS, answers.maritalStatus)}</strong></article>
                <article class="result-card"><span>Referencias cargadas</span><strong>2 familiares</strong></article>
              </div>

              <div class="result-actions">
                {#if portalUrl}
                  <a href={portalUrl} class="btn primary" style="text-decoration:none; text-align:center; display:inline-block;">Ver estado de mi solicitud</a>
                {/if}
                <button type="button" class="btn primary" on:click={resetForm} style={portalUrl ? 'background:transparent; border:1px solid rgba(255,246,226,.3); color:var(--c-cream,#e8e4dc);' : ''}>Nueva solicitud</button>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <section class="application-legal" aria-labelledby="application-legal-title">
        <div class="application-legal__inner">
          <p class="application-legal__eyebrow" id="application-legal-title">Aviso importante</p>
          <p>{LEGAL_DISCLAIMER}</p>
        </div>
      </section>
    </div>
  </section>
</SiteLayout>

<style>
  .application-page {
    padding-top: calc(var(--hero-safe-top, 88px) + clamp(24px, 5vw, 56px));
    padding-bottom: clamp(56px, 9vw, 88px);
    background: var(--c-crema);
  }

  .application-page__shell {
    width: min(1280px, 96vw);
    margin: 0 auto;
    display: grid;
    gap: clamp(26px, 4vw, 42px);
  }

  .application-page__intro {
    width: 100%;
  }

  .application-page__headline {
    display: grid;
    justify-items: center;
  }

  .application-page__headline h1,
  .application-card__top h2,
  .result-hero strong {
    margin: 0;
    color: var(--c-navy);
    line-height: 1.02;
    letter-spacing: -0.03em;
  }

  .application-page__headline h1 {
    width: min(13ch, 100%);
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
    font-weight: 700;
    line-height: 1.08;
    text-align: center;
    text-wrap: balance;
  }

  .application-stage {
    display: grid;
    gap: clamp(18px, 2.4vw, 24px);
    align-items: start;
    width: 100%;
  }

  .summary-card,
  .application-card {
    border-radius: clamp(28px, 3vw, 36px);
    box-shadow: 0 18px 30px rgba(5, 15, 34, 0.08);
  }

  .summary-card {
    display: grid;
    gap: 18px;
    padding: 24px;
    background: var(--c-navy);
    border: 1px solid rgba(213, 181, 132, 0.36);
  }

  .summary-card--row {
    grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
    align-items: center;
  }

  .summary-card__lead {
    display: grid;
    gap: 10px;
  }

  .summary-card strong { font-size: 1.25rem; color: #fff6e2; }

  .summary-progress {
    display: grid;
    grid-template-columns: repeat(var(--progress-dot-count, 4), minmax(0, 1fr));
    gap: 8px;
  }

  .summary-progress__dot {
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 246, 226, 0.12);
    transition: background-color var(--transition-fast), transform var(--transition-fast);
  }

  .summary-progress__dot.is-current {
    background: #fff6e2;
    transform: scaleY(1.08);
  }

  .summary-progress__dot.is-complete {
    background: var(--c-arena);
  }

  .phase-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }
  .phase-list__item {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(255, 246, 226, 0.06);
    border: 1px solid rgba(255, 246, 226, 0.08);
  }
  .phase-list__item.is-current { background: rgba(255, 246, 226, 0.12); border-color: rgba(213, 181, 132, 0.48); }
  .phase-list__item.is-complete { background: rgba(213, 181, 132, 0.18); }
  .phase-list__item.is-skipped { opacity: 0.72; }
  .phase-list__item.is-undecided {
    background: rgba(255, 246, 226, 0.03);
    border-color: rgba(255, 246, 226, 0.06);
    opacity: 0.52;
  }
  .phase-list__index {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: rgba(255, 246, 226, 0.1);
    color: #fff6e2;
    font-size: 0.76rem;
    font-weight: 600;
  }

  .phase-list__content,
  .application-form,
  .application-result,
  .application-card__top,
  .application-card__body,
  .form-section,
  .field-card,
  .reference-card,
  .result-hero,
  .result-card,
  .application-legal__inner {
    display: grid;
    gap: 10px;
  }

  .phase-list__content span {
    color: #fff6e2;
    font-size: 0.84rem;
    font-weight: 500;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .application-card {
    width: 100%;
    padding: clamp(24px, 3vw, 34px);
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.12);
  }

  .application-card__top h2 {
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    font-size: clamp(1.9rem, 2vw + 1rem, 3rem);
    font-weight: 700;
    text-align: left;
    text-wrap: balance;
  }

  .application-legal__eyebrow,
  .result-hero__eyebrow {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .application-legal__eyebrow {
    color: rgba(18, 41, 65, 0.55);
  }

  .form-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }

  .radio-field {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    border: none;
    min-inline-size: 0;
  }

  .radio-field__label {
    padding: 0 4px;
    color: var(--c-navy);
    font-weight: 700;
    line-height: 1.2;
  }

  .field-card,
  .reference-card {
    padding: 18px;
    border-radius: 24px;
    border: 1px solid rgba(18, 41, 65, 0.12);
    background: #ffffff;
  }

  .reference-card { gap: 16px; background: linear-gradient(180deg, #ffffff 0%, #f8f8f7 100%); }
  .field-card--full { grid-column: 1 / -1; }
  .field-card__label,
  .reference-card__header h3 { font-weight: 700; color: var(--c-navy); }

  .field-card--radio {
    padding: 14px 18px;
  }

  .field-card input,
  .field-card select {
    width: 100%;
    min-height: 54px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid rgba(18, 41, 65, 0.14);
    background: #ffffff;
    color: var(--c-navy);
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .field-card input:focus,
  .field-card select:focus {
    border-color: rgba(213, 181, 132, 0.9);
    box-shadow: 0 0 0 3px rgba(213, 181, 132, 0.2);
  }

  .field-card input::placeholder { color: rgba(18, 41, 65, 0.3); }

  /* Rapi-ID Check */
  .rapi-id { margin-bottom: 20px; border-radius: 16px; overflow: hidden; border: 1.5px solid rgba(213, 181, 132, 0.3); background: linear-gradient(135deg, rgba(213, 181, 132, 0.06), rgba(10, 25, 41, 0.03)); }
  .rapi-id--open { border-color: rgba(213, 181, 132, 0.5); }
  .rapi-id__toggle { width: 100%; display: flex; align-items: center; gap: 12px; padding: 16px 20px; border: none; background: none; cursor: pointer; text-align: left; }
  .rapi-id__badge { background: linear-gradient(135deg, #0a1929, #122941); color: #d5b584; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; white-space: nowrap; }
  .rapi-id__hint { flex: 1; font-size: 0.82rem; color: rgba(18, 41, 65, 0.5); }
  .rapi-id__arrow { font-size: 0.7rem; color: rgba(18, 41, 65, 0.3); }
  .rapi-id__panel { padding: 0 20px 20px; }
  .rapi-id__desc { font-size: 0.85rem; color: rgba(18, 41, 65, 0.55); line-height: 1.6; margin: 0 0 16px; }
  .rapi-id__uploads { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .rapi-id__upload-box { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 20px 12px; border: 2px dashed rgba(18, 41, 65, 0.12); border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: center; }
  .rapi-id__upload-box:hover { border-color: rgba(213, 181, 132, 0.5); background: rgba(213, 181, 132, 0.04); }
  .rapi-id__upload-icon { font-size: 1.5rem; }
  .rapi-id__upload-label { font-size: 0.8rem; font-weight: 600; color: var(--c-navy, #122941); }
  .rapi-id__upload-req { font-size: 0.7rem; color: rgba(18, 41, 65, 0.35); }
  .rapi-id__error { font-size: 0.82rem; color: #ef4444; margin: 0 0 12px; }
  .rapi-id__success { font-size: 0.82rem; color: #22c55e; font-weight: 600; margin: 0 0 12px; }
  .rapi-id__scan-btn {
    width: 100%; padding: 14px 24px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #0a1929, #1a3a5c); color: #d5b584;
    font-weight: 700; font-size: 0.92rem; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .rapi-id__scan-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(10, 25, 41, 0.3); }
  .rapi-id__scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .rapi-id__spinner { width: 18px; height: 18px; border: 2px solid rgba(213, 181, 132, 0.2); border-top-color: #d5b584; border-radius: 50%; animation: rapiSpin 0.8s linear infinite; }
  @keyframes rapiSpin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .rapi-id__uploads { grid-template-columns: 1fr; }
    .rapi-id__toggle { flex-wrap: wrap; }
    .rapi-id__hint { order: 3; width: 100%; margin-top: 4px; }
  }
  .field-card__error { color: #b03a2e; font-size: 0.92rem; font-weight: 600; }
  .radio-group { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
  .radio-group--compact { gap: 12px; }
  .radio-pill { display: inline-flex; align-items: center; gap: 10px; color: var(--c-ink-soft); font-weight: 600; }
  .radio-pill input { width: 18px; min-height: auto; height: 18px; padding: 0; accent-color: var(--c-sand); }

  .reference-card__header { display: flex; align-items: center; gap: 14px; }
  .reference-card__header h3 { margin: 0; font-size: 1.08rem; }
  .reference-card__number {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: var(--c-navy);
    color: #fff6e2;
    font-weight: 700;
  }

  .application-card__actions,
  .result-actions { display: flex; justify-content: space-between; gap: 14px; }
  .application-card__primary,
  .application-card__secondary,
  .result-actions :global(.btn) { min-width: 168px; }

  .result-hero {
    gap: 8px;
    padding: clamp(18px, 2vw, 24px);
    border-radius: 24px;
    background: var(--c-navy);
    color: #fff6e2;
  }

  .result-hero__eyebrow { color: rgba(255, 246, 226, 0.62); }
  .result-hero strong { color: #fff6e2; font-size: clamp(2rem, 2.4vw + 1rem, 3.2rem); }
  .result-hero span { color: rgba(255, 246, 226, 0.72); max-width: 42ch; }
  .result-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .result-card { padding: 20px; border-radius: 24px; border: 1px solid rgba(18, 41, 65, 0.12); background: #ffffff; }
  .result-card span { color: rgba(18, 41, 65, 0.6); font-size: 0.94rem; }
  .result-card strong { color: var(--c-navy); font-size: clamp(1.2rem, 0.8vw + 1rem, 1.7rem); line-height: 1.1; }
  .application-legal { width: min(1280px, 96vw); margin: 0 auto; }
  .application-legal p { margin: 0; color: rgba(213, 181, 132, 0.98); font-size: 0.98rem; line-height: 1.72; }

  @media (max-width: 980px) {
    .summary-card--row { grid-template-columns: minmax(0, 1fr); }
    .phase-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 720px) {
    .application-page__headline h1,
    .application-card__top h2 {
      width: min(12ch, 100%);
      font-size: clamp(1.9rem, 8vw, 3rem);
    }

    .application-card__top h2 {
      width: 100%;
    }
    .phase-list,
    .result-grid { grid-template-columns: minmax(0, 1fr); }
    .application-card__actions,
    .result-actions { flex-direction: column-reverse; }
    .application-card__primary,
    .application-card__secondary,
    .result-actions :global(.btn) { width: 100%; }
  }
</style>
