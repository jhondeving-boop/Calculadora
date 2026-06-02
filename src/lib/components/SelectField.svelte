<script lang="ts">
  interface Props {
    value?: string;
    options?: string[];
    onchange?: (value: string) => void;
    label?: string;
    disabled?: boolean;
    class?: string;
  }

  let { 
    value = '',
    options = [],
    onchange, 
    label,
    disabled = false,
    class: className = ''
  } = $props();
</script>

<div class="select-field {className}">
  {#if label}
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label class="select-label">{label}</label>
  {/if}
  <div class="select-wrapper">
    <select 
      {value} 
      {disabled}
      onchange={(e) => onchange?.(e.currentTarget.value)}
    >
      {#each options as option}
        <option {value}>{option}</option>
      {/each}
    </select>
    <svg class="select-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>
</div>

<style>
  .select-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .select-label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  select {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--fg);
    font-size: 0.95rem;
    font-weight: 600;
    outline: none;
    width: 100%;
    cursor: pointer;
    z-index: 1;
    -webkit-appearance: none;
    padding-right: 24px;
  }

  .select-icon {
    position: absolute;
    right: 0;
    pointer-events: none;
    color: var(--muted);
  }

  select option {
    background: var(--card);
    color: var(--fg);
    padding: 8px;
  }

  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
