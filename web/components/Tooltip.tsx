export default function Tooltip({
  text,
  children,
  className = '',
  title,
}: {
  text: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  // Minimal implementation using native title attribute for MVP
  return (
    <span className={`inline-flex items-center ${className}`} title={title ?? text}>
      {children}
    </span>
  );
}
