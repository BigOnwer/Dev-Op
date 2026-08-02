import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/dashboard" className="inline-flex items-center gap-2.5 text-white" aria-label="DevOp, ir para projetos">
    <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-black shadow-lg shadow-violet-950/50">D</span>
    {!compact && <span className="text-lg font-semibold tracking-tight">Dev<span className="text-violet-400">Op</span></span>}
  </Link>;
}
