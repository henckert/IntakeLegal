import type { DetailedHTMLProps, TextareaHTMLAttributes } from 'react';

export type TextAreaProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

export function TextArea({ className = '', ...props }: TextAreaProps) {
  const base = 'block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-text-primary placeholder-slate-400 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30';
  return <textarea className={`${base} ${className}`} {...props} />;
}

export default TextArea;
