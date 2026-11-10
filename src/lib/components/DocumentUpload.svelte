<script>
  import { Button, Icon, LinearProgressEstimate, LoadingIndicator } from 'm3-svelte';
  import upload from '@ktibow/iconset-material-symbols/upload';
  import document from '@ktibow/iconset-material-symbols/description-outline';

  let { busy, onfile } = $props();
  let input;

  let dragDepth = $state(0);

  const dragging = $derived(dragDepth > 0 && !busy);

  function startLoading(node) {
    const frame = requestAnimationFrame(() => {
      node.querySelectorAll('animate, animateTransform').forEach((animation) => {
        animation.beginElement();
      });
    });

    return { destroy: () => cancelAnimationFrame(frame) };
  }

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
      <div use:startLoading>
        <LoadingIndicator size={36} center={false} aria-label="A dokumentum beolvasása" />
      </div>
    {:else}
      <Icon icon={document} size={36} />
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
    <Button onclick={() => input.click()} disabled={busy} iconType="left"
      ><Icon icon={upload} />Fájl kiválasztása</Button
    >
  </div>
  <div class="upload-footer">
    {#if busy}
      <LinearProgressEstimate sToHalfway={0.8} aria-label="A dokumentum ellenőrzése folyamatban" />
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
    border-radius: var(--m3-shape-large);
    background: var(--m3c-surface);
    transition: background-color 200ms;
  }
  .drop-border {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    overflow: visible;
    pointer-events: none;
    color: var(--m3c-outline-variant);
    transition: color 200ms;
  }
  .drop-border rect {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-dasharray: 8 6;
  }
  .dragging .drop-border {
    color: var(--m3c-primary);
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
    background: var(--m3c-primary-container-subtle);
  }
  .upload-icon {
    height: 48px;
    align-items: center;
    display: flex;
    justify-content: center;
    color: var(--m3c-primary);
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
