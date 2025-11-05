type BadgeColor = 'red' | 'amber' | 'green';

function colorClass(color: BadgeColor) {
  switch (color) {
    case 'red':
      return 'bg-red-100 text-red-800';
    case 'amber':
      return 'bg-amber-100 text-amber-800';
    case 'green':
      return 'bg-green-100 text-green-800';
  }
}

export default function Badge({
  color,
  children,
  className = '',
}: {
  color: BadgeColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass(
        color,
      )} ${className}`}
    >
      {children}
    </span>
  );
}
