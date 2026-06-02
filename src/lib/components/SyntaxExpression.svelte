<script lang="ts">
  let { expression } = $props<{ expression: string }>();

  // Use a reactive derivation to split and colorize the expression
  const tokens = $derived.by(() => {
    // Basic regex to separate numbers, operators and functions
    const regex = /([0-9.]+|sin|cos|tan|ln|log|sqrt|pi|e|[+\-*/^%()]|[=])/g;
    const matches = expression.match(regex) || [];
    
    return matches.map((token: string) => {
      let type = 'number';
      if (['+', '-', '*', '/', '^', '%'].includes(token)) type = 'operator';
      else if (['(', ')'].includes(token)) type = 'bracket';
      else if (['sin', 'cos', 'tan', 'ln', 'log', 'sqrt'].includes(token)) type = 'function';
      else if (['pi', 'e'].includes(token)) type = 'constant';
      
      return { text: token, type };
    });
  });
</script>

<div class="syntax-container">
  {#each tokens as token}
    <span class="token {token.type}">{token.text}</span>
  {/each}
  <span class="caret"></span>
</div>

<style>
  .syntax-container {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 1px;
    font-family: 'Space Grotesk', monospace;
    transition: all 0.2s;
  }

  .token { transition: color 0.2s; }
  
  .token.number { color: var(--fg); }
  .token.operator { color: var(--accent); font-weight: 700; padding: 0 2px; }
  .token.bracket { color: #8b5cf6; opacity: 0.8; }
  .token.function { color: #10b981; font-style: italic; }
  .token.constant { color: #f59e0b; }

  .caret {
    width: 2px;
    height: 1.2em;
    background: var(--accent);
    margin-left: 2px;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
  }
</style>
