<script>
  import { Button, LinearProgress, LoadingIndicator } from 'noph-ui';
  import { Icon } from 'noph-ui/icons';

  let { busy, onfile } = $props();
  let input;

  let dragDepth = $state(0);

  const dragging = $derived(dragDepth > 0 && !busy);

  function select() {
    const file = input.files?.[0];

    input.value = '';

    if (file && !busy) {
      onfile(file);
    }
  }

  function dragEnter(event) {
    event.preventDefault();

    const containsFile = Array.from(event.dataTransfer?.types || []).includes('Files');

    if (!busy && containsFile) {
      dragDepth += 1;
    }
  }

  function dragOver(event) {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = busy ? 'none' : 'copy';
    }
  }

  function dragLeave() {
    dragDepth = Math.max(0, dragDepth - 1);
  }

  function drop(event) {
    event.preventDefault();

    dragDepth = 0;

    const file = event.dataTransfer?.files[0];

    if (file && !busy) {
      onfile(file);
    }
  }
</script>

<section
  class="drop-zone"
  class:dragging
  aria-label="Word-dokumentum feltöltése"
  aria-busy={busy}
  ondragenter={dragEnter}
  ondragover={dragOver}
  ondragleave={dragLeave}
  ondrop={drop}
>
  <svg class="drop-border" aria-hidden="true">
    <rect width="100%" height="100%" rx="16" />
  </svg>
  <input bind:this={input} type="file" accept=".docx" onchange={select} disabled={busy} hidden />
  <div class="upload-icon">
    {#if busy}
      <LoadingIndicator --np-loading-indicator-size="36px" aria-label="A dokumentum beolvasása" />
    {:else}
      <Icon --np-icon-size="36px">description</Icon>
    {/if}
  </div>
  <h2 role={busy ? 'status' : undefined}>
    {busy
      ? 'Átnézzük a dokumentumot…'
      : dragging
        ? 'Engedd el, és megnézzük'
        : 'Húzz ide egy Word-dokumentumot'}
  </h2>
  <div>
    <Button onclick={() => input.click()} disabled={busy} variant="filled"
      >{#snippet start()}<Icon>upload</Icon>{/snippet}Fájl kiválasztása</Button
    >
  </div>
  <div class="upload-footer">
    {#if busy}
      <LinearProgress indeterminate aria-label="A dokumentum ellenőrzése folyamatban" />
    {:else}
      <p class="upload-hint">.docx fájl, legfeljebb 20 MB. A fájl a gépeden marad.</p>
    {/if}
  </div>
</section>

<style>
  .drop-zone {
    position: relative;
    display: grid;
    gap: 16px;
    padding: 28px 24px;
    border: 2px solid transparent;
    border-radius: var(--np-shape-corner-large);
    background: var(--np-color-surface);
    transition: background-color 200ms;
  }
  .drop-border {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    overflow: visible;
    pointer-events: none;
    color: var(--np-color-outline-variant);
    transition: color 200ms;
  }
  .drop-border rect {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-dasharray: 8 6;
  }
  .dragging .drop-border {
    color: var(--np-color-primary);
  }
  .dragging rect {
    animation: border-march 1s linear infinite;
  }
  @keyframes border-march {
    to {
      stroke-dashoffset: -28;
    }
  }
  .dragging {
    background: var(--np-color-secondary-container);
  }
  .upload-icon {
    height: 48px;
    align-items: center;
    display: flex;
    justify-content: center;
    color: var(--np-color-primary);
  }
  .upload-footer {
    height: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  @media (prefers-reduced-motion: reduce) {
    .drop-zone,
    .drop-border {
      transition: none;
    }
    .dragging rect {
      animation: none;
    }
  }
</style>
