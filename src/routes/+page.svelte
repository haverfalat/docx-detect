<script>
  import DocumentUpload from '#lib/components/DocumentUpload.svelte';
  import BatchResults from '#lib/components/BatchResults.svelte';
  import { analyze } from '#lib/docx/analyze.js';

  let results = $state([]);
  let busy = $state(false);
  let completed = $state(0);
  let batch = $state(0);

  async function inspect(files) {
    if (busy || !files.length) {
      return;
    }

    busy = true;
    completed = 0;
    batch += 1;
    results = files.map((file, id) => ({
      id,
      name: file.name,
      status: 'queued',
      report: null,
      error: '',
    }));

    try {
      for (const [index, file] of files.entries()) {
        results[index].status = 'reading';

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        try {
          const [report] = await Promise.all([
            analyze(file),
            new Promise((resolve) => setTimeout(resolve, files.length === 1 ? 700 : 0)),
          ]);

          results[index].report = report;
          results[index].status = 'done';
        } catch {
          results[index].error =
            'Ezt a fájlt nem sikerült megnyitni. Ellenőrizd, hogy nem sérült vagy jelszavas-e, és 20 MB-nál kisebb .docx fájl legyen.';
          results[index].status = 'error';
        }

        completed += 1;
      }
    } finally {
      busy = false;
    }
  }
</script>

<main>
  <h1>DOCX-ellenőrző</h1>
  <DocumentUpload {busy} {completed} total={results.length} onfiles={inspect} />
  {#if results.length}{#key batch}<BatchResults {results} {busy} {completed} />{/key}{/if}
</main>

<footer>
  <a href="https://github.com/haverfalat/docx-detect" target="_blank" rel="noreferrer">Forráskód</a>
</footer>
