export interface StepperProps {
  steps: string[];
  current: number; // 0-based index
  className?: string;
}

export default function Stepper({ steps, current, className = '' }: StepperProps) {
  const pct = Math.min(100, Math.max(0, Math.round(((current + 1) / steps.length) * 100)));
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-accent1 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex w-full justify-between text-xs text-slate-600">
        {steps.map((s, i) => (
          <span key={i} className={i === current ? 'font-semibold text-text-primary' : ''}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
