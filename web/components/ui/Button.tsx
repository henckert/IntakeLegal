import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

type Variant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: Variant;
}

const base =
  'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:opacity-95 focus:ring-primary focus:ring-offset-white shadow-md',
  secondary:
    'bg-secondary text-white hover:opacity-95 focus:ring-secondary focus:ring-offset-white shadow-md',
  outline:
    'border border-slate-300 text-text-primary bg-white hover:bg-slate-50 focus:ring-primary',
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export default Button;
