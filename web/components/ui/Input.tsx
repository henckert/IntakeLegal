import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  const base = 'block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-text-primary placeholder-slate-400 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30';
  return <input className={`${base} ${className}`} {...props} />;
}

export default Input;
