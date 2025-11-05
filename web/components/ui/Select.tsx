import type { DetailedHTMLProps, SelectHTMLAttributes } from 'react';

export type SelectProps = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export function Select({ className = '', children, ...props }: SelectProps) {
  const base = 'block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-text-primary shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30';
  return (
    <select className={`${base} ${className}`} {...props}>
      {children}
    </select>
  );
}

export default Select;
