<script lang="ts">
  import Icon from './Icon.svelte';

  type Operation = 'diff' | 'add' | 'subtract';

  let operation = $state<Operation>('diff');
  let startDate = $state(new Date().toISOString().split('T')[0]);
  let endDate = $state(new Date().toISOString().split('T')[0]);
  let daysToAdd = $state(30);
  let result = $state<string>('');

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function calculate() {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      switch (operation) {
        case 'diff': {
          const diffTime = end.getTime() - start.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const years = Math.floor(diffDays / 365);
          const months = Math.floor((diffDays % 365) / 30);
          const days = diffDays % 30;
          
          let parts = [];
          if (years !== 0) parts.push(`${years} año${years !== 1 ? 's' : ''}`);
          if (months !== 0) parts.push(`${months} mes${months !== 1 ? 'es' : ''}`);
          parts.push(`${days} día${days !== 1 ? 's' : ''}`);
          
          result = `${diffDays} días (${parts.join(', ')})`;
          break;
        }
        case 'add': {
          const date = new Date(startDate);
          date.setDate(date.getDate() + daysToAdd);
          result = date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        }
        case 'subtract': {
          const date = new Date(startDate);
          date.setDate(date.getDate() - daysToAdd);
          result = date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          break;
        }
      }
    } catch (e) {
      result = 'Error en cálculo';
    }
  }

  function setToday() {
    const today = getToday();
    startDate = today;
    endDate = today;
    calculate();
  }

  function getDaysBetween() {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  $effect(() => {
    if (startDate && endDate) {
      calculate();
    }
  });
</script>

<div class="date-calculator">
  <div class="tabs">
    <button class="tab" class:active={operation === 'diff'} onclick={() => operation = 'diff'}>
      Diferencia
    </button>
    <button class="tab" class:active={operation === 'add'} onclick={() => operation = 'add'}>
      Sumar días
    </button>
    <button class="tab" class:active={operation === 'subtract'} onclick={() => operation = 'subtract'}>
      Restar días
    </button>
  </div>

  {#if operation === 'diff'}
    <div class="input-group">
      <label>
        <span>Fecha inicial</span>
        <input type="date" bind:value={startDate} />
      </label>
      
      <div class="arrow">
        <Icon name="arrow-right" size={20} />
      </div>
      
      <label>
        <span>Fecha final</span>
        <input type="date" bind:value={endDate} />
      </label>
    </div>
  {:else}
    <div class="input-group column">
      <label>
        <span>Fecha base</span>
        <input type="date" bind:value={startDate} />
      </label>
      
      <label>
        <span>Días a {operation === 'add' ? 'sumar' : 'restar'}</span>
        <div class="number-input">
          <button onclick={() => daysToAdd = Math.max(0, daysToAdd - 1)}>
            <Icon name="minus" size={16} />
          </button>
          <input type="number" bind:value={daysToAdd} min="0" />
          <button onclick={() => daysToAdd = daysToAdd + 1}>
            <Icon name="plus" size={16} />
          </button>
        </div>
      </label>
    </div>
  {/if}

  <div class="result-box">
    <span class="label">Resultado</span>
    <span class="result">{result || '—'}</span>
  </div>

  <button class="today-btn" onclick={setToday}>
    Hoy
  </button>
</div>

<style>
  .date-calculator {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 10px 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .tabs {
    display: flex;
    gap: 8px;
    background: var(--card);
    padding: 6px;
    border-radius: 14px;
    border: 1px solid var(--border);
  }

  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: transparent;
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover { color: var(--fg); }
  .tab.active { background: var(--fg); color: var(--bg); }

  .input-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .input-group.column {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group label {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-group label span {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
  }

  input[type="date"], input[type="number"] {
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    color: var(--fg);
    font-size: 1.1rem;
    font-weight: 600;
    width: 100%;
    font-family: inherit;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  input[type="date"]:focus, input[type="number"]:focus {
    border-color: var(--muted);
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.5);
    cursor: pointer;
  }

  :global([data-theme="light"]) input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.3);
  }

  .arrow {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    color: var(--muted);
    background: var(--card);
    border-radius: 50%;
  }

  .number-input {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 14px;
    padding: 8px;
  }

  .number-input button {
    width: 40px;
    height: 40px;
    border: none;
    background: var(--btn-bg);
    color: var(--fg);
    border-radius: 10px;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .number-input button:hover { background: var(--btn-hover); }

  .number-input input {
    border: none;
    background: transparent;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 0;
    width: 80px;
  }

  .result-box {
    background: var(--card);
    border: 2px dashed var(--border);
    border-radius: 20px;
    padding: 24px;
    text-align: center;
  }

  .result-box .label {
    display: block;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .result-box .result {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--fg);
    display: block;
    text-transform: capitalize;
  }

  .today-btn {
    background: var(--btn-bg);
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .today-btn:hover { border-color: var(--muted); color: var(--fg); }

  @media (max-height: 760px) {
    .date-calculator { gap: 12px; padding: 6px 0; }
    .tabs { padding: 4px; gap: 6px; }
    .tab { padding: 8px 10px; font-size: 0.74rem; }
    .input-group { gap: 8px; }
    input[type="date"], input[type="number"] { padding: 12px; font-size: 0.95rem; }
    .number-input { padding: 6px; }
    .number-input button { width: 34px; height: 34px; }
    .number-input input { font-size: 1.2rem; width: 64px; }
    .result-box { padding: 14px; }
    .result-box .result { font-size: 1.1rem; }
    .today-btn { padding: 10px 16px; }
  }
</style>