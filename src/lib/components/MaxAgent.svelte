<script>
  let isOpen = false;
  let messages = []; // { role: 'user' | 'assistant', content: string }
  let inputText = '';
  let isTyping = false;
  let chatBody;

  const WELCOME = '¡Hola! 👋 Soy **Max**, tu Rapi-Agente Inteligente. ¿En qué te puedo ayudar hoy?\n\nPodés preguntarme sobre:\n🚗 Financiamiento vehicular\n📋 Requisitos y proceso\n🧮 Cómo usar la calculadora\n⚡ Rapi-ID Check';

  function toggle() { isOpen = !isOpen; }

  function scrollToBottom() {
    if (chatBody) setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 50);
  }

  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  async function sendMessage() {
    const text = inputText.trim();
    if (!text || isTyping) return;
    inputText = '';

    messages = [...messages, { role: 'user', content: text }];
    scrollToBottom();
    isTyping = true;

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const result = await res.json();
      if (result.reply) {
        messages = [...messages, { role: 'assistant', content: result.reply }];
      } else {
        messages = [...messages, { role: 'assistant', content: 'Disculpá, hubo un error. ¿Podés intentar de nuevo?' }];
      }
    } catch {
      messages = [...messages, { role: 'assistant', content: 'Error de conexión. Revisá tu internet e intentá de nuevo.' }];
    }
    isTyping = false;
    scrollToBottom();
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }
</script>

<!-- Floating button -->
<button class="max-fab" on:click={toggle} aria-label="Chat con Max">
  {#if isOpen}
    <span class="max-fab__icon">✕</span>
  {:else}
    <span class="max-fab__icon">⚡</span>
    <span class="max-fab__label">Max</span>
  {/if}
</button>

<!-- Chat panel -->
{#if isOpen}
  <div class="max-chat">
    <div class="max-chat__header">
      <div class="max-chat__avatar">⚡</div>
      <div class="max-chat__title">
        <strong>Max</strong>
        <span>Rapi-Agente Inteligente</span>
      </div>
      <button class="max-chat__close" on:click={toggle}>✕</button>
    </div>

    <div class="max-chat__body" bind:this={chatBody}>
      <!-- Welcome message -->
      <div class="max-msg max-msg--bot">
        <div class="max-msg__avatar">⚡</div>
        <div class="max-msg__bubble">{@html formatMessage(WELCOME)}</div>
      </div>

      {#each messages as msg}
        <div class="max-msg" class:max-msg--bot={msg.role === 'assistant'} class:max-msg--user={msg.role === 'user'}>
          {#if msg.role === 'assistant'}
            <div class="max-msg__avatar">⚡</div>
          {/if}
          <div class="max-msg__bubble">{@html formatMessage(msg.content)}</div>
        </div>
      {/each}

      {#if isTyping}
        <div class="max-msg max-msg--bot">
          <div class="max-msg__avatar">⚡</div>
          <div class="max-msg__bubble max-msg__typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      {/if}
    </div>

    <div class="max-chat__input">
      <input
        type="text"
        placeholder="Escribí tu mensaje..."
        bind:value={inputText}
        on:keydown={handleKeydown}
        disabled={isTyping}
      />
      <button on:click={sendMessage} disabled={isTyping || !inputText.trim()}>➤</button>
    </div>
  </div>
{/if}

<style>
  /* FAB button */
  .max-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; align-items: center; gap: 8px;
    padding: 14px 20px; border: none; border-radius: 50px;
    background: linear-gradient(135deg, #0a1929, #1a3a5c);
    color: #d5b584; font-weight: 700; font-size: 0.9rem;
    cursor: pointer; box-shadow: 0 8px 32px rgba(10, 25, 41, 0.5);
    transition: all 0.3s;
  }
  .max-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(10, 25, 41, 0.6); }
  .max-fab__icon { font-size: 1.2rem; }
  .max-fab__label { font-size: 0.85rem; letter-spacing: 0.02em; }

  /* Chat panel */
  .max-chat {
    position: fixed; bottom: 88px; right: 24px; z-index: 9998;
    width: 380px; max-height: 540px;
    display: flex; flex-direction: column;
    background: #0d1f33; border: 1px solid rgba(213, 181, 132, 0.15);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    animation: maxSlideUp 0.25s ease-out;
  }
  @keyframes maxSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  /* Header */
  .max-chat__header {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; background: linear-gradient(135deg, #0a1929, #122941);
    border-bottom: 1px solid rgba(213, 181, 132, 0.1);
  }
  .max-chat__avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #d5b584, #c4a06a);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; color: #0a1929; flex-shrink: 0;
  }
  .max-chat__title { flex: 1; }
  .max-chat__title strong { display: block; color: #d5b584; font-size: 0.92rem; }
  .max-chat__title span { display: block; color: rgba(255, 246, 226, 0.35); font-size: 0.72rem; }
  .max-chat__close { background: none; border: none; color: rgba(255, 255, 255, 0.3); font-size: 1.1rem; cursor: pointer; padding: 4px 8px; }
  .max-chat__close:hover { color: #fff; }

  /* Body */
  .max-chat__body {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
    max-height: 380px; min-height: 200px;
    scrollbar-width: thin; scrollbar-color: rgba(213, 181, 132, 0.2) transparent;
  }

  /* Messages */
  .max-msg { display: flex; gap: 8px; max-width: 90%; }
  .max-msg--bot { align-self: flex-start; }
  .max-msg--user { align-self: flex-end; flex-direction: row-reverse; }
  .max-msg__avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #d5b584, #c4a06a);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; color: #0a1929; flex-shrink: 0; margin-top: 2px;
  }
  .max-msg__bubble {
    padding: 10px 14px; border-radius: 16px; font-size: 0.85rem; line-height: 1.55;
  }
  .max-msg--bot .max-msg__bubble {
    background: rgba(255, 255, 255, 0.06); color: rgba(255, 246, 226, 0.85);
    border-bottom-left-radius: 4px;
  }
  .max-msg--user .max-msg__bubble {
    background: linear-gradient(135deg, #d5b584, #c4a06a); color: #0a1929;
    border-bottom-right-radius: 4px; font-weight: 500;
  }

  /* Typing indicator */
  .max-msg__typing { display: flex; gap: 4px; padding: 12px 18px; }
  .max-msg__typing span {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(213, 181, 132, 0.4);
    animation: maxTypingDot 1.2s infinite;
  }
  .max-msg__typing span:nth-child(2) { animation-delay: 0.2s; }
  .max-msg__typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes maxTypingDot { 0%, 60% { opacity: 0.3; transform: scale(0.8); } 30% { opacity: 1; transform: scale(1.1); } }

  /* Input */
  .max-chat__input {
    display: flex; gap: 8px; padding: 12px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(10, 25, 41, 0.5);
  }
  .max-chat__input input {
    flex: 1; padding: 10px 14px; border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px; background: rgba(255, 255, 255, 0.05);
    color: #fff; font-size: 0.88rem; outline: none;
  }
  .max-chat__input input:focus { border-color: rgba(213, 181, 132, 0.3); }
  .max-chat__input input::placeholder { color: rgba(255, 255, 255, 0.25); }
  .max-chat__input button {
    width: 40px; height: 40px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #d5b584, #c4a06a);
    color: #0a1929; font-size: 1.1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .max-chat__input button:hover:not(:disabled) { transform: scale(1.05); }
  .max-chat__input button:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Mobile */
  @media (max-width: 480px) {
    .max-chat { width: calc(100vw - 16px); right: 8px; bottom: 80px; max-height: 70vh; }
    .max-fab { bottom: 16px; right: 16px; }
  }
</style>
