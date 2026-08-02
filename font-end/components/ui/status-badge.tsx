import { statusLabel } from "@/lib/format";
import type { ProjectStatus } from "@/types/api";

const styles: Record<ProjectStatus, string> = { PLANNING: "bg-amber-400/10 text-amber-300 ring-amber-400/20", IN_PROGRESS: "bg-violet-400/10 text-violet-300 ring-violet-400/20", COMPLETED: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20", PAUSED: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20" };
export function StatusBadge({ status }: { status: ProjectStatus | null }) { const value = status ?? "PLANNING"; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styles[value]}`}>{statusLabel(status)}</span>; }
