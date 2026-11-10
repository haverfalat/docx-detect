export function getFindings({
  coreXml,
  application,
  creator,
  lastModifiedBy,
  created,
  modified,
  recordedWords,
  editingTime,
  words,
  paragraphCount,
  unmarkedParagraphCount,
}) {
  const findings = [];

  const addFinding = (title, detail, evidence, strength) =>
    findings.push({ title, detail, evidence, strength });

  if (/python-docx/i.test(coreXml)) {
    addFinding(
      'Pythonos készítés nyoma',
      'A fájlban szerepel a python-docx neve. Ez erős jel arra, hogy a dokumentumot kóddal rakták össze. Azt viszont nem árulja el, ki írta a szöveget.',
      'docProps/core.xml: python-docx',
      'Strong',
    );
  }

  if (/^PHPWord(?:\s|$)/i.test(application)) {
    addFinding(
      'PHPWord készítette a fájlt',
      'A készítő alkalmazás mezőjében a PHPWord neve szerepel. Ez egy dokumentumokat kódból összeállító könyvtár, így erős nyom a programozott készítésre. A mező sablonból is öröklődhet.',
      `docProps/app.xml: Application = ${application}`,
      'Strong',
    );
  }

  if (creator === 'Un-named' && lastModifiedBy === 'Un-named') {
    addFinding(
      'JavaScriptes dokumentumkészítőre utaló szerzőadatok',
      'A szerző és az utolsó módosító neve is „Un-named”. A JavaScriptes docx könyvtár ezeket használja alapból. Ez egy lehetséges nyom, de önmagában nem azonosítja biztosan a készítő programot.',
      'docProps/core.xml: creator = Un-named, lastModifiedBy = Un-named',
      'Moderate',
    );
  }

  if (created.startsWith('2013-12-23')) {
    addFinding(
      'Régi dátum a sablonból',
      'Ez a dátum megegyezik a python-docx egyik alapértelmezett sablonjának dátumával. Valószínűleg a sablonból maradt itt.',
      `Létrehozva: ${created}`,
      'Strong',
    );
  }

  if (recordedWords === '0' && words > 30) {
    addFinding(
      'Nem stimmel a szószám',
      'A fájl szerint nulla szó van benne, közben van benne szöveg. Elképzelhető, hogy a készítő program nem frissítette a statisztikákat.',
      `Tárolt szószám: 0, a szövegben nagyjából ${words} szó van.`,
      'Moderate',
    );
  }

  if (paragraphCount > 3 && unmarkedParagraphCount === paragraphCount) {
    addFinding(
      'Hiányoznak a szerkesztési jelölők',
      'A bekezdésekben nincsenek rsidR szerkesztési azonosítók. Ez előfordul generált fájloknál, de egyes szövegszerkesztők is kihagyják őket.',
      `${unmarkedParagraphCount} bekezdés rsidR jelölő nélkül`,
      'Moderate',
    );
  }

  if (editingTime === '0') {
    addFinding(
      'Nincs rögzített szerkesztési idő',
      'A fájl nulla perc szerkesztést tárol. Ez lehet automatikus készítés, bemásolt szöveg vagy egyszerűen pontatlan adat is.',
      'Szerkesztési idő: 0 perc',
      'Weak',
    );
  }

  if (created && created === modified) {
    addFinding(
      'Egyezik a létrehozás és a módosítás ideje',
      'A két időpont teljesen egyforma. Lehet, hogy a fájlt egy lépésben mentették, vagy a dátumok a sablonból maradtak benne. Ez önmagában gyenge jel.',
      created,
      'Weak',
    );
  }

  return findings;
}
