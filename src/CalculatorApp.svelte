<script>
  import SiteLayout from './lib/components/SiteLayout.svelte';
  import {
    CALCULATOR_STEPS,
    CURRENCY_OPTIONS,
    DISCLAIMER_PARAGRAPHS,
    EMAIL_REGEX,
    MAX_TERM_MONTHS,
    MIN_VEHICLE_YEAR,
    REFERENCE_ANNUAL_RATE,
    VEHICLE_TYPE_OPTIONS,
    VEHICLE_USE_OPTIONS
  } from './lib/calculator/constants.js';
  import {
    calculateQuote,
    formatCurrency,
    formatPercent,
    getMinimumDownPayment,
    parseNumber
  } from './lib/calculator/engine.js';

  const totalSteps = CALCULATOR_STEPS.length;
  const currentVehicleYear = new Date().getFullYear() + 1;
  const yearOptions = Array.from(
    { length: currentVehicleYear - MIN_VEHICLE_YEAR + 1 },
    (_, index) => currentVehicleYear - index
  );

  const optionMap = {
    vehicleType: VEHICLE_TYPE_OPTIONS,
    vehicleUse: VEHICLE_USE_OPTIONS,
    currency: CURRENCY_OPTIONS
  };

  const summaryItems = [
    { id: 'vehicleType', label: 'Tipo' },
    { id: 'vehicleUse', label: 'Uso' },
    { id: 'currency', label: 'Moneda' },
    { id: 'vehicleValue', label: 'Valor' },
    { id: 'year', label: 'Año' },
    { id: 'downPayment', label: 'Prima' },
    { id: 'termMonths', label: 'Plazo' }
  ];

  const initialAnswers = () => ({
    vehicleType: '',
    vehicleUse: '',
    currency: 'USD',
    vehicleValue: '',
    year: '',
    downPayment: '',
    termMonths: '',
    email: ''
  });

  let currentStepIndex = 0;
  let attemptedAdvance = false;
  let answers = initialAnswers();
  let yearMenuOpen = false;

  const getLabelForOption = (stepId, value) =>
    optionMap[stepId]?.find((option) => option.value === value)?.label ?? value;

  const setAnswer = (stepId, value) => {
    answers = {
      ...answers,
      [stepId]: value
    };
  };

  const closeYearMenu = () => {
    yearMenuOpen = false;
  };

  const toggleYearMenu = (event) => {
    event.stopPropagation();
    yearMenuOpen = !yearMenuOpen;
  };

  const selectYear = (year) => {
    setAnswer('year', String(year));
    yearMenuOpen = false;
  };

  const clearYear = () => {
    setAnswer('year', '');
    yearMenuOpen = false;
  };

  const handleWindowKeydown = (event) => {
    if (event.key === 'Escape' && yearMenuOpen) {
      yearMenuOpen = false;
    }
  };

  const handleYearMenuWheel = (event) => {
    event.stopPropagation();

    const menu = event.currentTarget;
    const atTop = menu.scrollTop <= 0;
    const atBottom = menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 1;

    if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
      event.preventDefault();
    }
  };

  const isResultStep = () => currentStepIndex >= totalSteps;

  const getCurrency = () => answers.currency || 'USD';

  const getVehicleValue = () => parseNumber(answers.vehicleValue);

  const getDownPayment = () => parseNumber(answers.downPayment);

  const getTermMonths = () => Number.parseInt(answers.termMonths, 10) || 0;

  const getMinimumPrima = () => getMinimumDownPayment(getVehicleValue());

  const getStepError = (stepId) => {
    switch (stepId) {
      case 'vehicleType':
        return answers.vehicleType ? '' : 'Seleccioná un tipo de vehículo para continuar.';
      case 'vehicleUse':
        return answers.vehicleUse ? '' : 'Seleccioná el uso principal del vehículo.';
      case 'currency':
        return answers.currency ? '' : 'Elegí la moneda en la que querés ver la simulación.';
      case 'vehicleValue': {
        const value = getVehicleValue();
        if (!value) return 'Ingresá un valor de vehículo mayor a cero.';
        return '';
      }
      case 'year': {
        const year = Number.parseInt(answers.year, 10);
        if (!year) return 'Seleccioná el año del vehículo.';
        if (year < MIN_VEHICLE_YEAR || year > currentVehicleYear) {
          return `Elegí un año entre ${MIN_VEHICLE_YEAR} y ${currentVehicleYear}.`;
        }
        return '';
      }
      case 'downPayment': {
        const vehicleValue = getVehicleValue();
        const downPayment = getDownPayment();
        const minimumPrima = getMinimumPrima();

        if (!downPayment) return 'Ingresá el monto que querés dar de prima.';
        if (downPayment >= vehicleValue) {
          return 'La prima debe ser menor al valor total del vehículo.';
        }
        if (downPayment < minimumPrima) {
          return `La prima mínima referencial es ${formatCurrency(minimumPrima, getCurrency())}.`;
        }
        return '';
      }
      case 'termMonths': {
        const months = getTermMonths();
        if (!months) return 'Ingresá el plazo deseado en meses.';
        if (months < 1 || months > MAX_TERM_MONTHS) {
          return `Elegí un plazo entre 1 y ${MAX_TERM_MONTHS} meses.`;
        }
        return '';
      }
      case 'email':
        if (!answers.email.trim()) return 'Ingresá un correo electrónico para ver tu tasa.';
        if (!EMAIL_REGEX.test(answers.email.trim())) {
          return 'Ingresá un correo electrónico válido.';
        }
        return '';
      default:
        return '';
    }
  };

  const isCurrentStepValid = () => {
    const step = currentStepIndex >= totalSteps
      ? null
      : CALCULATOR_STEPS[Math.min(currentStepIndex, totalSteps - 1)];
    return step ? !getStepError(step.id) : true;
  };

  const getDisplayValue = (stepId) => {
    const value = answers[stepId];

    if (!value) return '';

    if (stepId === 'vehicleType' || stepId === 'vehicleUse' || stepId === 'currency') {
      return getLabelForOption(stepId, value);
    }

    if (stepId === 'vehicleValue' || stepId === 'downPayment') {
      return formatCurrency(parseNumber(value), getCurrency());
    }

    if (stepId === 'termMonths') {
      return `${value} meses`;
    }

    return value;
  };

  const handleNext = () => {
    attemptedAdvance = true;

    if (!isCurrentStepValid()) return;

    yearMenuOpen = false;
    currentStepIndex += 1;
    attemptedAdvance = false;
  };

  const handleBack = () => {
    if (currentStepIndex === 0) return;
    yearMenuOpen = false;
    currentStepIndex -= 1;
    attemptedAdvance = false;
  };

  const handleRestart = () => {
    currentStepIndex = 0;
    attemptedAdvance = false;
    yearMenuOpen = false;
    answers = initialAnswers();
  };

  $: showResult = currentStepIndex >= totalSteps;
  $: activeStep = CALCULATOR_STEPS[Math.min(currentStepIndex, totalSteps - 1)];
  $: currentStepValue = activeStep ? answers[activeStep.id] : '';
  $: currentError = showResult ? '' : (currentStepValue, getStepError(activeStep.id));
  $: shouldShowError = Boolean(
    !showResult &&
      currentError &&
      (attemptedAdvance || (typeof currentStepValue === 'string' ? currentStepValue.trim() : currentStepValue))
  );
  $: quote = calculateQuote({
    vehicleValue: answers.vehicleValue,
    downPayment: answers.downPayment,
    termMonths: answers.termMonths,
    annualRate: REFERENCE_ANNUAL_RATE
  });
  $: visibleSummaryItems = summaryItems.filter(({ id }) => Boolean(answers[id]));
  $: completedStepCount = Math.min(currentStepIndex, totalSteps);
  $: progressLabel = isResultStep()
    ? 'Resultado listo'
    : `Paso ${currentStepIndex + 1} de ${totalSteps}`;
  $: if (activeStep?.id !== 'year' && yearMenuOpen) {
    yearMenuOpen = false;
  }
</script>

<svelte:window on:click={closeYearMenu} on:keydown={handleWindowKeydown} />

<SiteLayout page="calculator" footerSpacing="compact">
  <section class="calculator-page section">
    <div class="calculator-page__shell">
      <header class="calculator-page__intro">
        <div class="calculator-page__headline">
          <h1>¡Conocé tu cuota mensual aproximada de forma rápida y sencilla!</h1>
        </div>
      </header>

      <div class="calculator-stage">
        <aside class="calculator-stage__summary">
          <div class="summary-card">
            <p class="summary-card__label">Progreso</p>
            <strong>{progressLabel}</strong>
            <p class="summary-card__text">
              {#if showResult}
                Esta simulación usa una tasa anual referencial de {formatPercent(REFERENCE_ANNUAL_RATE)}.
              {:else}
                Te faltan {Math.max(totalSteps - currentStepIndex - 1, 0)} pasos para desbloquear el resultado.
              {/if}
            </p>

            <div class="summary-progress" aria-hidden="true">
              {#each CALCULATOR_STEPS as step, index}
                <span
                  class="summary-progress__dot"
                  class:is-active={!showResult && index === currentStepIndex}
                  class:is-complete={index < completedStepCount || showResult}
                ></span>
              {/each}
            </div>

            <div class="summary-list">
              {#if visibleSummaryItems.length}
                {#each visibleSummaryItems as item}
                  <div class="summary-list__row">
                    <span>{item.label}</span>
                    <strong>{getDisplayValue(item.id)}</strong>
                  </div>
                {/each}
              {:else}
                <p class="summary-card__empty">Tus respuestas van apareciendo aquí mientras avanzás.</p>
              {/if}
            </div>
          </div>
        </aside>

        <div class="calculator-card">
          {#if !showResult}
            <form class="calculator-form" on:submit|preventDefault={handleNext}>
              <div class="calculator-card__top">
                <div>
                  <p class="calculator-card__step-label">{progressLabel}</p>
                  <h2>{activeStep.title}</h2>
                </div>
                <p class="calculator-card__description">{activeStep.description}</p>
              </div>

              {#key activeStep.id}
                <div class="calculator-card__body">
                  {#if activeStep.kind === 'options'}
                    <div class="option-grid">
                      {#each optionMap[activeStep.id] as option}
                        <label
                          class:selected={answers[activeStep.id] === option.value}
                          class="option-card"
                        >
                          <input
                            class="option-card__input"
                            type="radio"
                            name={activeStep.id}
                            value={option.value}
                            checked={answers[activeStep.id] === option.value}
                            on:change={() => setAnswer(activeStep.id, option.value)}
                          />
                          <span class="option-card__title">{option.label}</span>
                          <span class="option-card__body">{option.description}</span>
                        </label>
                      {/each}
                    </div>
                  {:else if activeStep.kind === 'currency'}
                    <label class="field-card" for={activeStep.id}>
                      <span class="field-card__label">
                        {activeStep.id === 'vehicleValue' ? 'Monto del vehículo' : 'Monto de prima'}
                      </span>
                      <div class="field-card__input-wrap">
                        <span>{answers.currency}</span>
                        <input
                          id={activeStep.id}
                          type="number"
                          min="0"
                          step="0.01"
                          inputmode="decimal"
                          placeholder={activeStep.id === 'vehicleValue' ? '32000' : '6400'}
                          value={answers[activeStep.id]}
                          on:input={(event) => setAnswer(activeStep.id, event.currentTarget.value)}
                        />
                      </div>
                      {#if activeStep.id === 'downPayment'}
                        <span class="field-card__hint">
                          Prima mínima referencial: {formatCurrency(getMinimumPrima(), getCurrency())}
                        </span>
                      {:else}
                        <span class="field-card__hint">
                          Resultado estimado en {answers.currency}.
                        </span>
                      {/if}
                    </label>
                  {:else if activeStep.kind === 'year'}
                    <label class="field-card" for="year">
                      <span class="field-card__label">Año del vehículo</span>
                      <div
                        class="field-card__select-wrap field-card__year-select"
                        class:is-open={yearMenuOpen}
                      >
                        <button
                          id="year"
                          type="button"
                          class="year-select__trigger"
                          class:year-select__trigger--placeholder={!answers.year}
                          aria-haspopup="menu"
                          aria-expanded={yearMenuOpen ? 'true' : 'false'}
                          aria-controls="year-options-listbox"
                          on:click|stopPropagation={toggleYearMenu}
                        >
                          {answers.year || 'Seleccioná un año'}
                        </button>
                        {#if yearMenuOpen}
                          <div class="year-select__menu-shell">
                            <div
                              id="year-options-listbox"
                              class="year-select__menu"
                              role="menu"
                              aria-label="Año del vehículo"
                              on:wheel={handleYearMenuWheel}
                            >
                              <button
                                type="button"
                                class="year-select__option year-select__option--placeholder"
                                class:is-selected={!answers.year}
                                on:click={clearYear}
                              >
                                Seleccioná un año
                              </button>
                              {#each yearOptions as year}
                                <button
                                  type="button"
                                  class="year-select__option"
                                  class:is-selected={answers.year === String(year)}
                                  on:click={() => selectYear(year)}
                                >
                                  {year}
                                </button>
                              {/each}
                            </div>
                          </div>
                        {/if}
                      </div>
                    </label>
                  {:else if activeStep.kind === 'term'}
                    <label class="field-card" for="termMonths">
                      <span class="field-card__label">Plazo en meses</span>
                      <div class="field-card__input-wrap">
                        <span>Meses</span>
                        <input
                          id="termMonths"
                          type="number"
                          min="1"
                          max={MAX_TERM_MONTHS}
                          step="1"
                          inputmode="numeric"
                          placeholder="84"
                          value={answers.termMonths}
                          on:input={(event) => setAnswer('termMonths', event.currentTarget.value)}
                        />
                      </div>
                      <span class="field-card__hint">Máximo permitido: {MAX_TERM_MONTHS} meses.</span>
                    </label>
                  {:else if activeStep.kind === 'email'}
                    <label class="field-card" for="email">
                      <span class="field-card__label">Correo electrónico</span>
                      <div class="field-card__input-wrap field-card__input-wrap--email">
                        <span>Email</span>
                        <input
                          id="email"
                          type="email"
                          inputmode="email"
                          placeholder="tu@correo.com"
                          value={answers.email}
                          on:input={(event) => setAnswer('email', event.currentTarget.value)}
                        />
                      </div>
                      <span class="field-card__hint">
                        Te mostraremos el resultado en la siguiente pantalla.
                      </span>
                    </label>
                  {/if}

                  {#if shouldShowError}
                    <p class="calculator-card__error" role="alert">{currentError}</p>
                  {/if}
                </div>
              {/key}

              <div class="calculator-card__actions">
                <button
                  type="button"
                  class="btn ghost calculator-card__secondary"
                  on:click={handleBack}
                  disabled={currentStepIndex === 0}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  class="btn primary calculator-card__primary"
                  aria-disabled={!isCurrentStepValid() ? 'true' : 'false'}
                  on:click={handleNext}
                >
                  {currentStepIndex === totalSteps - 1 ? 'Ver resultado' : 'Siguiente'}
                </button>
              </div>
            </form>
          {:else}
            <div class="calculator-result">
              <div class="calculator-card__top">
                <div>
                  <p class="calculator-card__step-label">Resultado final</p>
                  <h2>Tu referencia está lista</h2>
                </div>
                <p class="calculator-card__description">
                  Gracias, {answers.email.trim()}. Esta simulación es aproximada y funciona como una
                  referencia inicial antes de revisión comercial.
                </p>
              </div>

              <div class="result-hero">
                <p class="result-hero__eyebrow">Tasa anual referencial</p>
                <strong>{formatPercent(REFERENCE_ANNUAL_RATE)}</strong>
                <span>Basada en tasa SOFR más spread según las condiciones vigentes.</span>
              </div>

              <div class="result-grid">
                <article class="result-card">
                  <span>Cuota mensual aproximada</span>
                  <strong>{formatCurrency(quote.monthlyPayment, getCurrency())}</strong>
                </article>
                <article class="result-card">
                  <span>Monto financiado</span>
                  <strong>{formatCurrency(quote.financedAmount, getCurrency())}</strong>
                </article>
                <article class="result-card">
                  <span>Prima ingresada</span>
                  <strong>{formatCurrency(quote.downPayment, getCurrency())}</strong>
                </article>
                <article class="result-card">
                  <span>Plazo seleccionado</span>
                  <strong>{answers.termMonths} meses</strong>
                </article>
              </div>

              <div class="result-actions">
                <button type="button" class="btn ghost" on:click={handleBack}>Editar datos</button>
                <button type="button" class="btn primary" on:click={handleRestart}>Nueva simulación</button>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <section class="calculator-legal" aria-labelledby="calculator-legal-title">
        <div class="calculator-legal__inner">
          <p class="calculator-legal__eyebrow" id="calculator-legal-title">Aviso importante</p>
          {#each DISCLAIMER_PARAGRAPHS as paragraph}
            <p>{paragraph}</p>
          {/each}
        </div>
      </section>
    </div>
  </section>
</SiteLayout>

<style>
  .calculator-page {
    padding-top: calc(var(--hero-safe-top, 88px) + clamp(24px, 5vw, 56px));
    padding-bottom: clamp(56px, 9vw, 88px);
    background: var(--c-crema);
  }

  .calculator-page__shell {
    width: min(1280px, 96vw);
    margin: 0 auto;
    display: grid;
    gap: clamp(26px, 4vw, 42px);
  }

  .calculator-page__intro {
    display: grid;
    gap: 14px;
    width: min(860px, 100%);
    margin: 0 auto;
    text-align: center;
  }

  .calculator-page__headline {
    display: grid;
    gap: 14px;
  }

  .calculator-page__headline h1 {
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(2.5rem, 4vw + 1rem, 4.8rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .calculator-stage {
    display: grid;
    grid-template-columns: minmax(250px, 320px) minmax(0, 1fr);
    gap: clamp(18px, 3vw, 28px);
    align-items: start;
    width: 100%;
  }

  .summary-card,
  .calculator-card {
    border-radius: clamp(28px, 3vw, 36px);
    border: 1px solid rgba(18, 41, 65, 0.14);
    box-shadow: 0 18px 30px rgba(5, 15, 34, 0.08);
  }

  .summary-card {
    position: sticky;
    top: calc(var(--hero-safe-top, 88px) + 16px);
    display: grid;
    gap: 18px;
    padding: 24px;
    background: var(--c-navy);
    border-color: rgba(213, 181, 132, 0.36);
  }

  .calculator-card {
    width: 100%;
    padding: clamp(24px, 3vw, 34px);
    background: var(--c-warm-gray);
    border: 1px solid rgba(18, 41, 65, 0.12);
  }

  .summary-card__label,
  .calculator-card__step-label,
  .calculator-legal__eyebrow {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .summary-card__label {
    color: rgba(255, 246, 226, 0.62);
  }

  .calculator-card__step-label,
  .calculator-legal__eyebrow {
    color: rgba(18, 41, 65, 0.55);
  }

  .summary-card strong {
    font-size: 1.35rem;
    color: #fff6e2;
  }

  .summary-card__text,
  .summary-card__empty {
    margin: 0;
    color: rgba(255, 246, 226, 0.76);
    line-height: 1.55;
  }

  .summary-progress {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 8px;
  }

  .summary-progress__dot {
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 246, 226, 0.12);
    transition: background-color var(--transition-fast), transform var(--transition-fast);
  }

  .summary-progress__dot.is-active {
    background: #fff6e2;
    transform: scaleY(1.08);
  }

  .summary-progress__dot.is-complete {
    background: var(--c-arena);
  }

  .summary-list {
    display: grid;
    gap: 10px;
  }

  .summary-list__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 246, 226, 0.12);
    font-size: 0.95rem;
  }

  .summary-list__row span {
    color: rgba(255, 246, 226, 0.68);
  }

  .summary-list__row strong {
    font-size: 0.98rem;
    text-align: right;
    color: #fff6e2;
  }

  .calculator-form,
  .calculator-result {
    display: grid;
    gap: clamp(24px, 3vw, 34px);
  }

  .calculator-card__top {
    display: grid;
    gap: 12px;
  }

  .calculator-card__top h2 {
    margin: 0;
    color: var(--c-navy);
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(2rem, 2vw + 1rem, 3rem);
    line-height: 0.98;
    letter-spacing: -0.04em;
  }

  .calculator-card__description {
    margin: 0;
    color: var(--c-ink-soft);
    max-width: 56ch;
  }

  .calculator-card__body {
    display: grid;
    gap: 18px;
    min-height: 270px;
    align-content: start;
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .option-card,
  .field-card {
    border-radius: 24px;
    border: 1px solid rgba(18, 41, 65, 0.12);
    background: #ffffff;
  }

  .option-card {
    display: grid;
    gap: 10px;
    padding: 22px;
    text-align: left;
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      background-color var(--transition-fast);
  }

  .option-card__input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-card:hover,
  .option-card:focus-visible {
    background: var(--c-navy);
    border-color: rgba(1, 13, 40, 0.52);
    transform: translateY(-1px) scale(1.018);
    box-shadow: 0 16px 26px rgba(1, 13, 40, 0.18);
  }

  .option-card.selected {
    border-color: rgba(213, 181, 132, 0.95);
    background: #ffffff;
    box-shadow: inset 0 0 0 1px rgba(213, 181, 132, 0.45);
  }

  .option-card.selected:hover,
  .option-card.selected:focus-visible {
    background: var(--c-navy);
    border-color: rgba(213, 181, 132, 0.95);
  }

  .option-card__title {
    color: var(--c-navy);
    font-weight: 700;
    font-size: 1.08rem;
  }

  .option-card__body,
  .field-card__hint {
    color: var(--c-ink-muted);
    line-height: 1.55;
  }

  .option-card:hover .option-card__title,
  .option-card:hover .option-card__body,
  .option-card:focus-visible .option-card__title,
  .option-card:focus-visible .option-card__body {
    color: #fff6e2;
  }

  .field-card {
    display: grid;
    gap: 12px;
    padding: clamp(18px, 2vw, 24px);
  }

  .field-card__label {
    font-weight: 700;
    color: var(--c-navy);
  }

  .field-card__input-wrap,
  .field-card__select-wrap {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid rgba(18, 41, 65, 0.12);
  }

  .field-card__input-wrap span {
    color: rgba(18, 41, 65, 0.48);
    font-weight: 700;
  }

  .field-card__input-wrap input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: clamp(1.2rem, 1vw + 1rem, 1.6rem);
    color: var(--c-navy);
    padding: 0;
  }

  .field-card__input-wrap input::placeholder {
    color: rgba(18, 41, 65, 0.28);
  }

  .field-card__select-wrap {
    grid-template-columns: minmax(0, 1fr);
    padding: 0;
  }

  .field-card__year-select {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(18, 41, 65, 0.16);
    background: linear-gradient(165deg, #ffffff 0%, #f8f8f7 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 8px 18px rgba(1, 13, 40, 0.06);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }

  .field-card__year-select::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 18px;
    width: 9px;
    height: 9px;
    border-right: 2px solid rgba(18, 41, 65, 0.62);
    border-bottom: 2px solid rgba(18, 41, 65, 0.62);
    transform: translateY(-65%) rotate(45deg);
    transition: transform var(--transition-fast);
    pointer-events: none;
  }

  .field-card__year-select:hover,
  .field-card__year-select:focus-within,
  .field-card__year-select.is-open {
    border-color: rgba(213, 181, 132, 0.84);
    box-shadow: 0 0 0 3px rgba(213, 181, 132, 0.24), 0 10px 20px rgba(1, 13, 40, 0.08);
    transform: translateY(-1px);
  }

  .field-card__year-select.is-open::after {
    transform: translateY(-35%) rotate(-135deg);
  }

  .year-select__trigger {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    padding: 16px 44px 16px 18px;
    border-radius: 18px;
    font-size: clamp(1.2rem, 1vw + 1rem, 1.6rem);
    font-weight: 700;
    color: var(--c-navy);
  }

  .year-select__trigger--placeholder {
    color: rgba(18, 41, 65, 0.45);
  }

  .year-select__menu-shell {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 15;
    border: 1px solid rgba(18, 41, 65, 0.2);
    border-radius: 16px;
    box-shadow: 0 20px 28px rgba(1, 13, 40, 0.18);
    overflow: hidden;
    padding: 0 1px 0 0;
    background: #ffffff;
  }

  .year-select__menu {
    display: grid;
    gap: 0;
    max-height: min(300px, 46vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    background: #ffffff;
    scrollbar-width: thin;
    scrollbar-color: var(--c-navy) transparent;
  }

  .year-select__menu::-webkit-scrollbar {
    width: 11px;
  }

  .year-select__menu::-webkit-scrollbar-button:single-button {
    display: block;
    height: 14px;
    background: transparent;
  }

  .year-select__menu::-webkit-scrollbar-button:single-button:vertical:decrement,
  .year-select__menu::-webkit-scrollbar-button:single-button:vertical:increment {
    height: 14px;
  }

  .year-select__menu::-webkit-scrollbar-track {
    background: transparent;
  }

  .year-select__menu::-webkit-scrollbar-thumb {
    background: var(--c-navy);
    border: 2px solid rgba(18, 41, 65, 0.14);
    border-radius: 8px;
  }

  .year-select__option {
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(18, 41, 65, 0.08);
    background: #ffffff;
    color: var(--c-navy);
    text-align: left;
    font-size: 1.05rem;
    font-weight: 600;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .year-select__option:hover,
  .year-select__option:focus-visible {
    background: rgba(18, 41, 65, 0.08);
    color: var(--c-navy-deep);
  }

  .year-select__option.is-selected {
    background: var(--c-navy);
    color: #fff6e2;
  }

  .year-select__option--placeholder {
    font-weight: 700;
    color: rgba(18, 41, 65, 0.62);
  }

  .year-select__option:last-child {
    border-bottom: none;
  }

  .calculator-card__error {
    margin: 0;
    color: #b03a2e;
    font-weight: 600;
  }

  .calculator-card__actions,
  .result-actions {
    display: flex;
    justify-content: space-between;
    gap: 14px;
  }

  .calculator-card__primary,
  .calculator-card__secondary,
  .result-actions :global(.btn) {
    min-width: 168px;
  }

  .result-hero {
    display: grid;
    gap: 8px;
    padding: clamp(18px, 2vw, 24px);
    border-radius: 24px;
    background: var(--c-navy);
    color: #fff6e2;
  }

  .result-hero__eyebrow {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 246, 226, 0.62);
  }

  .result-hero strong {
    font-family: 'Nordique Pro', 'Montserrat', serif;
    font-size: clamp(2.2rem, 2.6vw + 1rem, 4rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .result-hero span {
    color: rgba(255, 246, 226, 0.72);
    max-width: 40ch;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .result-card {
    display: grid;
    gap: 10px;
    padding: 20px;
    border-radius: 24px;
    border: 1px solid rgba(18, 41, 65, 0.12);
    background: #ffffff;
  }

  .result-card span {
    color: rgba(18, 41, 65, 0.6);
    font-size: 0.94rem;
  }

  .result-card strong {
    color: var(--c-navy);
    font-size: clamp(1.25rem, 0.8vw + 1rem, 1.7rem);
    line-height: 1.1;
  }

  .calculator-legal {
    width: min(1280px, 96vw);
    margin: 0 auto;
  }

  .calculator-legal__inner {
    display: grid;
    gap: 18px;
    padding: 0 clamp(4px, 1vw, 10px);
  }

  .calculator-legal p {
    margin: 0;
    color: rgba(213, 181, 132, 0.98);
    font-size: 0.98rem;
    line-height: 1.72;
  }

  @media (max-width: 980px) {
    .calculator-stage {
      grid-template-columns: minmax(0, 1fr);
    }

    .summary-card {
      position: static;
    }
  }

  @media (max-width: 720px) {
    .calculator-page__headline h1 {
      font-size: clamp(2.3rem, 12vw, 3.6rem);
    }

    .option-grid,
    .result-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .calculator-card__actions,
    .result-actions {
      flex-direction: column-reverse;
    }

    .calculator-card__primary,
    .calculator-card__secondary,
    .result-actions :global(.btn) {
      width: 100%;
    }

    .calculator-card__body {
      min-height: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .summary-progress__dot,
    .option-card {
      transition: none;
    }
  }
</style>





