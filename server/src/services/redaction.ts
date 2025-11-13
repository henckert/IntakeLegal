/**
 * Simple PII redaction utilities.
 * Goal: mask common patterns (emails, phone numbers, dates) and return token map.
 * Not persisted; ephemeral mapping only.
 */

export type RedactionToken = {
  type: 'email' | 'phone' | 'date';
  value: string;
  token: string;
};

export type RedactionResult = {
  redactedText: string;
  tokens: RedactionToken[];
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// A pragmatic phone matcher (international and local, avoids matching short numbers)
const PHONE_RE = /(\+?\d{1,3}[\s-]?)?(\(\d{2,4}\)[\s-]?)?\d{3}[\s-]?\d{4,}/g;
const DATE_RE = /(\d{4}[-\/]\d{2}[-\/]\d{2}|\d{2}[-\/]\d{2}[-\/]\d{4})/g;

export function redactPII(text: string): RedactionResult {
  let out = text;
  const tokens: RedactionToken[] = [];

  const apply = (regex: RegExp, type: RedactionToken['type']) => {
    let match: RegExpExecArray | null;
    // Reset lastIndex to avoid cross-run interference
    regex.lastIndex = 0;
    while ((match = regex.exec(out)) !== null) {
      const value = match[0];
      const idx = tokens.filter(t => t.type === type).length + 1;
      const token = `[${type.toUpperCase()}_${idx}]`;
      tokens.push({ type, value, token });
      // Replace only the current occurrence; create a new regex for this value to avoid overlapping
      const esc = escapeRegExp(value);
      out = out.replace(new RegExp(esc, 'g'), token);
    }
  };

  apply(EMAIL_RE, 'email');
  apply(PHONE_RE, 'phone');
  apply(DATE_RE, 'date');

  return { redactedText: out, tokens };
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
