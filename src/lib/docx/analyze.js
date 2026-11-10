import JSZip from 'jszip';
import { getFindings } from './findings.js';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_XML_LENGTH = 15_000_000;
const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function parseXml(xml) {
  const document = new DOMParser().parseFromString(xml, 'application/xml');

  if (document.getElementsByTagName('parsererror').length) {
    throw new Error('A fájl belső adatai sérültek, ezt most nem tudjuk beolvasni.');
  }

  return document;
}

function getValue(document, name) {
  return document.getElementsByTagNameNS('*', name)[0]?.textContent?.trim() || '';
}

async function readXml(archive, path) {
  const entry = archive.file(path);

  if (!entry) {
    return '<root/>';
  }

  const xml = await entry.async('string');

  if (xml.length > MAX_XML_LENGTH) {
    throw new Error('Ez a dokumentum túl nagy vagy összetett az ellenőrzéshez.');
  }

  return xml;
}

export async function analyze(file) {
  if (!/\.docx$/i.test(file.name)) {
    throw new Error('Válassz egy .docx fájlt.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ez a fájl túl nagy. Válassz egy 20 MB-nál kisebbet.');
  }

  const archive = await JSZip.loadAsync(file);

  if (!archive.file('[Content_Types].xml') || !archive.file('word/document.xml')) {
    throw new Error('Ez nem egy érvényes Word-dokumentum.');
  }

  const [coreXml, appXml, documentXml] = await Promise.all([
    readXml(archive, 'docProps/core.xml'),
    readXml(archive, 'docProps/app.xml'),
    readXml(archive, 'word/document.xml'),
  ]);

  const core = parseXml(coreXml);
  const app = parseXml(appXml);
  const document = parseXml(documentXml);

  const text = Array.from(document.getElementsByTagNameNS('*', 't'))
    .map((node) => node.textContent)
    .join(' ')
    .trim();

  const words = text ? text.split(/\s+/u).length : 0;
  const paragraphs = Array.from(document.getElementsByTagNameNS('*', 'p')).filter((paragraph) =>
    paragraph.textContent?.trim(),
  );

  const unmarkedParagraphs = paragraphs.filter(
    (paragraph) => !paragraph.hasAttributeNS(WORD_NAMESPACE, 'rsidR'),
  );

  const findings = getFindings({
    coreXml,
    application: getValue(app, 'Application'),
    creator: getValue(core, 'creator'),
    lastModifiedBy: getValue(core, 'lastModifiedBy'),
    created: getValue(core, 'created'),
    modified: getValue(core, 'modified'),
    recordedWords: getValue(app, 'Words'),
    editingTime: getValue(app, 'TotalTime'),
    words,
    paragraphCount: paragraphs.length,
    unmarkedParagraphCount: unmarkedParagraphs.length,
  });

  return { name: file.name, words, findings };
}
