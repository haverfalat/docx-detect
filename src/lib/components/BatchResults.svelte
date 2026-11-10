<script>
  import { Card, Select, TextField } from 'noph-ui';
  import { getOverview } from '#lib/docx/overview.js';
  import Findings from './Findings.svelte';

  let { results, busy, completed } = $props();
  let query = $state('');
  let filter = $state('all');
  let expanded = $state([]);

  const options = [
    { value: 'all', label: 'Összes eredmény' },
    { value: 'rose', label: 'Erős jelek' },
    { value: 'amber', label: 'Határesetek' },
    { value: 'green', label: 'Nincs felismert jel' },
    { value: 'error', label: 'Nem olvasható' },
  ];

  const severity = { rose: 0, amber: 1, green: 2, error: 3, reading: 4, queued: 5 };

  const items = $derived(
    results
      .map((result) => ({
        ...result,
        overview: result.report ? getOverview(result.report.findings) : null,
      }))
      .sort((first, second) => {
        if (busy) return first.id - second.id;

        const firstRank = severity[first.overview?.tone || first.status];
        const secondRank = severity[second.overview?.tone || second.status];

        return (
          firstRank - secondRank ||
          (second.report?.findings.length || 0) - (first.report?.findings.length || 0) ||
          first.id - second.id
        );
      }),
  );

  const visible = $derived(
    items.filter((item) => {
      const matchesName = item.name.toLocaleLowerCase('hu').includes(query.toLocaleLowerCase('hu'));
      const matchesFilter =
        filter === 'all' || item.overview?.tone === filter || item.status === filter;

      return matchesName && matchesFilter;
    }),
  );

  const failed = $derived(results.filter((result) => result.status === 'error').length);

  function toggle(id) {
    expanded = expanded.includes(id) ? expanded.filter((value) => value !== id) : [...expanded, id];
  }
</script>

{#if results.length === 1}
  {#if results[0].report}
    <Findings report={results[0].report} />
  {:else if results[0].error}
    <Card variant="outlined"><p role="alert">{results[0].name}: {results[0].error}</p></Card>
  {/if}
{:else}
  <section class="stack" aria-label="A fájlok eredményei">
    <div class="findings-heading">
      <h2>{busy ? 'Sorban átnézzük őket' : 'Az ellenőrzés kész'}</h2>
      <p role="status">
        {completed}/{results.length} fájl kész{failed ? `, ${failed} nem olvasható` : ''}
      </p>
    </div>
    <div class="filters">
      <TextField label="Keresés fájlnév alapján" type="search" bind:value={query} />
      <Select label="Mutasd" {options} bind:value={filter} />
    </div>
    {#each visible as item (item.id)}
      <div class="result-item" data-tone={item.overview?.tone}>
        {#if item.report}
          <Card
            variant="outlined"
            onclick={() => toggle(item.id)}
            aria-expanded={expanded.includes(item.id)}
          >
            <div class="result-summary">
              <strong>{item.name}</strong>
              <p class="result-verdict">{item.overview.title}</p>
              <span class="upload-hint"
                >{item.report.findings.length} találat. {expanded.includes(item.id)
                  ? 'Részletek bezárása −'
                  : 'Részletek megnyitása +'}</span
              >
            </div>
          </Card>
          {#if expanded.includes(item.id)}
            <div class="result-details"><Findings report={item.report} showOverview={false} /></div>
          {/if}
        {:else}
          <Card variant="outlined">
            <div class="result-summary">
              <strong>{item.name}</strong>
              <p class:error={item.status === 'error'}>
                {item.error || (item.status === 'reading' ? 'Épp ezt nézzük…' : 'Vár a sorára')}
              </p>
            </div>
          </Card>
        {/if}
      </div>
    {:else}
      <p>Nincs a szűrésnek megfelelő fájl.</p>
    {/each}
  </section>
{/if}

<style>
  .result-item {
    display: grid;
    min-width: 0;
  }
  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    text-align: left;
  }
  .result-summary {
    display: grid;
    gap: 8px;
    text-align: left;
  }
  .result-summary strong {
    overflow-wrap: anywhere;
  }
  .result-verdict {
    color: var(--result-color);
  }
  [data-tone='green'] {
    --result-color: light-dark(#356442, #a5d6ae);
  }
  [data-tone='amber'] {
    --result-color: light-dark(#795a1a, #e5c577);
  }
  [data-tone='rose'] {
    --result-color: light-dark(#8b3e59, #f2afc5);
  }
  .result-details {
    margin-top: 12px;
    padding-inline: 12px;
  }
  .error {
    color: var(--np-color-error);
  }
  @media (max-width: 520px) {
    .filters {
      grid-template-columns: 1fr;
    }
  }
</style>
