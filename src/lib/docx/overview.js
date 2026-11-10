export function getOverview(findings) {
  if (findings.some((finding) => finding.strength === 'Strong')) {
    return {
      tone: 'rose',
      title: 'Nagyon úgy tűnik, hogy programmal készült',
      detail: 'A fájlban erős nyomokat találtunk arra, hogy egy program rakta össze.',
    };
  }

  if (findings.filter((finding) => finding.strength === 'Moderate').length >= 2) {
    return {
      tone: 'amber',
      title: 'Határeset, lehet, hogy programmal készült',
      detail: 'Több jel is automatikus készítésre utal, de ezekből még nem mondanánk biztosat.',
    };
  }

  if (findings.length) {
    return {
      tone: 'amber',
      title: 'Határeset, ebből még nem derül ki',
      detail: 'Találtunk pár jelet, de ezek kézzel készített dokumentumokban is előfordulnak.',
    };
  }

  return {
    tone: 'green',
    title: 'Nem találtunk generálásra utaló jelet',
    detail: 'Az ellenőrzött adatok között most nem bukkant fel ilyen nyom.',
  };
}
