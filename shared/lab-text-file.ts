/** Local source-text convenience only; no upload, OCR, laboratory identity or automatic save. */
export const LAB_TEXT_FILE_LIMIT = 30000;
export type LabTextFile = { name: string; size: number; text(): Promise<string> };
export async function readLabTextFile(file: LabTextFile) {
  if (!/\.(?:csv|tsv|txt)$/i.test(file.name)) throw Error('Choose a plain CSV, TSV or TXT report. PDF, images and spreadsheets are not read here.');
  if (!Number.isSafeInteger(file.size) || file.size < 1 || file.size > LAB_TEXT_FILE_LIMIT) throw Error('Choose a nonempty source-text file up to 30,000 bytes. Split larger reports before loading.');
  let text: string;
  try { text = await file.text(); } catch { throw Error('The file could not be read. Your current source draft was retained.'); }
  if (text.trimStart().startsWith('%PDF-')) throw Error('PDF contents are not read here. Choose a CSV, TSV or TXT export; your current draft was retained.');
  if (!text.trim() || text.length > LAB_TEXT_FILE_LIMIT || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/.test(text)) throw Error('Use a nonempty UTF-8 text report without binary data, up to 30,000 characters. Your current draft was retained.');
  return { name: file.name, text };
}
