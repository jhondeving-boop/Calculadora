<script lang="ts">
  let { name, size = 20, strokeWidth = 2, class: className = "" } = $props<{
    name: 'menu' | 'sun' | 'moon' | 'standard' | 'scientific' | 'converter' | 'programmer' | 'trash' | 'chevron-down' | 'arrow-down' | 'copy' | 'calendar' | 'search' | 'plus' | 'minus' | 'arrow-right' | 'pin' | 'star' | 'pip' | 'maximize' | 'close';
    size?: number;
    strokeWidth?: number;
    class?: string;
  }>();

  const paths = {
    menu: 'M3 12h18M3 6h18M3 18h18',
    sun: 'M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z',
    moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
    standard: 'M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm5 4h0m0 4h0m3-4h0m0 4h0m3-4h0m0 4h0',
    scientific: 'M8 4h8M8 20h8M12 4v16M6 10l-2-2M6 14l-2 2M18 10l2-2M18 14l2 2',
    converter: 'M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4',
    programmer: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    trash: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    'chevron-down': 'M6 9l6 6 6-6',
    'arrow-down': 'M7 13l5 5 5-5M7 6l5 5 5-5',
    copy: 'M8 17.7L2 17.7V2H14.3V8M14.3 8L20 8V23.7H8V8',
    calendar: 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    'arrow-right': 'M5 12h14M12 5l7 7-7 7',
    pin: 'M12 2v8m0 0l3-3m-3 3l-3-3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    pip: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h4M21 11V3h-8M21 3l-9 9',
    maximize: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
    close: 'M18 6L6 18M6 6l12 12'
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  style="display: flex; align-items: center; justify-content: center;"
>
  {#if name === 'copy'}
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
  {:else}
    <path d={paths[name as keyof typeof paths]} />
  {/if}
</svg>

<style>
  svg {
    transition: transform 0.2s ease;
    display: inline-block;
    vertical-align: middle;
  }
</style>