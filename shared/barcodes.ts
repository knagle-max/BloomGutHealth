// GS1 GTIN-8/12/13/14. Keep strings: leading zeroes are meaningful.
export function normalizeBarcode(value: string): string | null {
  const code = value.trim().replace(/[\s-]/g, "");
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return null;
  const digits = code.split("").map(Number);
  const check = digits.pop()!;
  const sum = digits.reverse().reduce((n, d, i) => n + d * (i % 2 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === check ? code : null;
}
export function productSearchText(value: string) {
  const text = value.trim();
  if (/^\d{8,14}$/.test(text)) return text;
  return text
    .replace(
      /\b\d+(?:\.\d+)?\b|\b(heaping|rounded|level|tablespoons?|teaspoons?|tbsp|tsp|grams?|of|one|two)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function expandUPCE(value: string): string | null {
  if (!/^[01]\d{7}$/.test(value)) return null;
  const [system, a, b, c, d, e, last, check] = value.split("");
  const body = /[012]/.test(last)
    ? system + a + b + last + "0000" + c + d + e
    : last === "3"
      ? system + a + b + c + "00000" + d + e
      : last === "4"
        ? system + a + b + c + d + "00000" + e
        : system + a + b + c + d + e + "0000" + last;
  return normalizeBarcode(body + check);
}
export function canonicalBarcode(value: string) {
  return normalizeBarcode(value)?.padStart(14, "0") ?? null;
}
