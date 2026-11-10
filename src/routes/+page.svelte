<script>
  import { Card } from 'noph-ui';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import DocumentUpload from '#lib/components/DocumentUpload.svelte';
  import Findings from '#lib/components/Findings.svelte';
  import { analyze } from '#lib/docx/analyze.js';

  let report = $state(null);
  let busy = $state(false);
  let error = $state('');

  async function inspect(file) {
    if (busy) {
      return;
    }

    busy = true;
    report = null;
    error = '';

    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const [result] = await Promise.all([
        analyze(file),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);

      report = result;
    } catch {
      error =
        'Ezt a fájlt nem sikerült megnyitni. Próbálj egy 20 MB-nál kisebb, nem jelszavas .docx fájlt.';
    } finally {
      busy = false;
    }
  }
</script>

<main>
  <h1>DOCX-ellenőrző</h1>
  <DocumentUpload {busy} onfile={inspect} />
  {#if error}
    <Card variant="outlined"><p role="alert">{error}</p></Card>
  {/if}
  {#if report}<div in:fade={{ duration: 350, easing: cubicOut }}>
      <Findings {report} />
    </div>{/if}
</main>

<footer>
  <a href="https://github.com/haverfalat/docx-detect" target="_blank" rel="noreferrer">Forráskód</a>
</footer>
