<script lang="ts">
  interface Props {
    class?: string;
    disabled?: boolean;
    onclick?: () => void;
    active?: boolean;
    variant?: 'default' | 'operator' | 'equals' | 'special' | 'pill';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
  }

  let { 
    class: className = '', 
    disabled = false, 
    onclick, 
    active = false,
    variant = 'default',
    size = 'md',
    type = 'button',
    children
  } = $props<Props & { children?: any }>();
</script>

<button 
  {type}
  {disabled}
  {onclick}
  class="btn btn-{variant} btn-{size}"
  class:active
  class:disabled
  class:custom={className}
>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .btn {
    border: 1.5px solid var(--border);
    background: var(--btn-bg);
    color: var(--fg);
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  }

  .btn:hover:not(:disabled) { 
    background: var(--btn-hover); 
    border-color: var(--muted);
  }

  .btn:active:not(:disabled) { 
    transform: scale(0.94);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn.active { 
    background: var(--accent); 
    color: var(--accent-fg);
    border-color: var(--accent);
  }

  /* Sizes */
  .btn-sm { 
    padding: 6px 12px; 
    font-size: 0.8rem; 
    border-radius: 8px; 
  }

  .btn-md { 
    padding: 10px 20px;
    font-size: 0.95rem;
  }

  .btn-lg { 
    padding: 12px 24px; 
    font-size: 1.1rem; 
  }

  /* Variants */
  .btn-operator {
    background: var(--op-bg);
    color: var(--op-fg);
  }

  .btn-operator:hover:not(:disabled) {
    background: var(--op-active);
    color: var(--op-active-fg);
  }

  .btn-equals {
    background: var(--accent);
    color: var(--accent-fg);
    border: none;
    font-weight: 800;
  }

  .btn-equals:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-special {
    background: var(--btn-bg);
    border-radius: 14px;
  }

  .btn-pill {
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
  }
</style>
