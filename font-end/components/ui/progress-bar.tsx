export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return <div className={`h-1.5 overflow-hidden rounded-full bg-zinc-800 ${className}`}><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></div>;
}
