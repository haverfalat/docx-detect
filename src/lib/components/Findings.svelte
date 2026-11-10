<script>
  import { Card } from 'noph-ui';
  import { Icon } from 'noph-ui/icons';
  import { getOverview } from '#lib/docx/overview.js';

  const overviewIcons = { green: 'check_circle', amber: 'warning', rose: 'error' };

  const strengthLabels = {
    Strong: 'Erős jel',
    Moderate: 'Közepes jel',
    Weak: 'Gyenge jel',
  };

  let { report, showOverview = true } = $props();

  const overview = $derived(getOverview(report.findings));
</script>

<section class="findings stack" aria-label="Az ellenőrzés eredménye">
  {#if showOverview}
    <div class="assessment" data-tone={overview.tone}>
      <Card variant="filled">
        <div class="overview">
          <div class="overview-icon">
            <Icon --np-icon-size="28px">{overviewIcons[overview.tone]}</Icon>
          </div>
          <h2 class="assessment-title">{overview.title}</h2>
          <p>{overview.detail}</p>
        </div>
      </Card>
    </div>
    <div class="findings-heading">
      <h2>Találatok</h2>
      <p>{report.name} ({report.findings.length} találat)</p>
    </div>
  {/if}
  {#each report.findings as finding}
    <Card variant="outlined">
      <article class="finding-content stack">
        <div
          class="evidence-strength"
          class:strong={finding.strength === 'Strong'}
          class:moderate={finding.strength === 'Moderate'}
        >
          <span>{strengthLabels[finding.strength]}</span>
        </div>
        <h3>{finding.title}</h3>
        <p>{finding.detail}</p>
        <p class="evidence-source">{finding.evidence}</p>
      </article>
    </Card>
  {:else}
    {#if !showOverview}<p class="upload-hint">Nem találtunk generálásra utaló nyomot.</p>{/if}
  {/each}
</section>

<style>
  .assessment {
    --np-filled-card-container-color: var(--assessment-background);
    --np-color-primary: var(--assessment-color);
  }
  .assessment[data-tone='green'] {
    --assessment-background: light-dark(#e5efe4, #1c3023);
    --assessment-color: light-dark(#356442, #a5d6ae);
  }
  .assessment[data-tone='amber'] {
    --assessment-background: light-dark(#f6edd9, #352b18);
    --assessment-color: light-dark(#795a1a, #e5c577);
  }
  .assessment[data-tone='rose'] {
    --assessment-background: light-dark(#f6dfe6, #38202a);
    --assessment-color: light-dark(#8b3e59, #f2afc5);
  }
  .assessment-title {
    color: var(--assessment-color);
  }
</style>
