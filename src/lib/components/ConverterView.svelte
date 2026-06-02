<script lang="ts">
  import { converter } from '../stores';

  const categories = $derived(converter.categories.map(c => c.name));
</script>

<div class="converter">
  <div class="category-selector custom-scroll">
    {#each categories as cat}
      <button 
        class="cat-btn" 
        class:active={converter.category === cat}
        onclick={() => converter.setCategory(cat)}
      >
        {cat}
      </button>
    {/each}
  </div>

  <div class="conversion-group">
    <div class="unit-box">
      <div class="select-wrapper">
        <select value={converter.fromUnit} onchange={(e) => converter.setFromUnit(e.currentTarget.value)}>
          {#each converter.getAvailableUnits() as unit}
            <option value={unit}>{unit}</option>
          {/each}
        </select>
        <svg class="select-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <input type="number" value={converter.value} oninput={(e) => converter.setValue(e.currentTarget.value)} placeholder="0" />
    </div>

    <div class="arrow-container">
      <div class="line"></div>
      <div class="arrow-circle">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
      <div class="line"></div>
    </div>

    <div class="unit-box result-box">
      <div class="select-wrapper">
        <select value={converter.toUnit} onchange={(e) => converter.setToUnit(e.currentTarget.value)}>
          {#each converter.getAvailableUnits() as unit}
            <option value={unit}>{unit}</option>
          {/each}
        </select>
        <svg class="select-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="result-value">{converter.result}</div>
    </div>
  </div>
</div>

<style>
  .converter {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 10px 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .category-selector {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .cat-btn {
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cat-btn:hover { border-color: var(--muted); color: var(--fg); }
  .cat-btn.active { background: var(--fg); color: var(--bg); border-color: var(--fg); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

  .conversion-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .unit-box {
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s ease;
  }

  .unit-box:focus-within { border-color: var(--muted); background: var(--bg); }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  select {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--muted);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    outline: none;
    width: 100%;
    cursor: pointer;
    z-index: 1;
    -webkit-appearance: none;
    appearance: none;
  }

  .select-icon {
    position: absolute;
    right: 0;
    pointer-events: none;
    color: var(--muted);
    opacity: 0.5;
  }

  select option {
    background: var(--card);
    color: var(--fg);
    padding: 8px;
  }

  input {
    background: transparent;
    border: none;
    color: var(--fg);
    font-size: 2.5rem;
    font-weight: 700;
    width: 100%;
    outline: none;
    padding: 0;
    margin: 0;
    font-family: inherit;
  }

  .result-box { background: var(--bg); border-style: dashed; }
  .result-value { font-size: 2.5rem; font-weight: 700; color: var(--fg); min-height: 3.2rem; }

  .arrow-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: -4px 0;
  }

  .line { flex: 1; height: 2px; background: var(--border); border-radius: 99px; }

  .arrow-circle {
    width: 36px;
    height: 36px;
    background: var(--card);
    border: 2px solid var(--border);
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--muted);
  }

  /* Hide arrows from number input */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button { appearance: none; margin: 0; }

  .custom-scroll::-webkit-scrollbar { height: 4px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

  @media (max-height: 760px) {
    .converter { gap: 14px; padding: 6px 0; }
    .category-selector { gap: 8px; }
    .cat-btn { padding: 8px 14px; font-size: 0.74rem; }
    .unit-box { padding: 14px; gap: 8px; }
    input { font-size: 2rem; }
    .result-value { font-size: 2rem; min-height: 2.5rem; }
    .arrow-container { margin: -2px 0; }
  }
</style>