<script>
  import { Card, Icon } from 'm3-svelte';
  import check from '@ktibow/iconset-material-symbols/check-circle-outline';
  import uncertain from '@ktibow/iconset-material-symbols/warning-rounded';
  import alert from '@ktibow/iconset-material-symbols/error-outline';
  import { getOverview } from '#lib/docx/overview.js';

  const overviewIcons = { green: check, amber: uncertain, rose: alert };

  const strengthLabels = {
    Strong: 'Erős jel',
    Moderate: 'Közepes jel',
    Weak: 'Gyenge jel',
  };

  let { report } = $props();

  const overview = $derived(getOverview(report.findings));
</script>

<section class="findings stack" aria-label="Az ellenőrzés eredménye" aria-live="polite">
  <div class="assessment" data-tone={overview.tone}>
    <Card variant="filled">
      <div class="overview">
        <div class="overview-icon">
          <Icon icon={overviewIcons[overview.tone]} size={28} />
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
  {/each}
</section>

<style>
  .assessment {
    --m3c-surface-container-highest: var(--assessment-background);
    --m3c-primary: var(--assessment-color);
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
