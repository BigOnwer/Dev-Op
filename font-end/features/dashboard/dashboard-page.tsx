"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/ui/brand";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, ApiError } from "@/lib/api";
import { languageLabel } from "@/lib/format";
import type { Project, User } from "@/types/api";

export function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { Promise.all([api.getUser(), api.getProjects()]).then(([profile, items]) => { setUser(profile); setProjects(items); }).catch((caught) => { if (caught instanceof ApiError && [401, 403, 500].includes(caught.status)) router.replace("/login"); else setError("Não foi possível carregar seus projetos."); }); }, [router]);

  const inProgress = projects?.filter((project) => project.status === "IN_PROGRESS").length ?? 0;
  const completed = projects?.filter((project) => project.status === "COMPLETED").length ?? 0;
  const firstName = user?.name?.trim().split(/\s+/)[0] || "dev";
  const initials = user?.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?";

  return <main className="min-h-screen bg-[radial-gradient(circle_at_86%_0%,_rgba(109,40,217,.15),_transparent_23rem)]"><header className="border-b border-zinc-900 bg-zinc-950/70 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Brand /><div className="flex items-center gap-2 sm:gap-3"><ProfileAvatar user={user} initials={initials} /><Link href="/projects/new" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-violet-950/40 transition hover:bg-violet-400">+ Novo projeto</Link></div></div></header><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><p className="text-sm font-medium text-violet-300">{user ? `Olá, ${firstName}.` : "Carregando seu espaço…"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Seus projetos, em um só lugar.</h1><p className="mt-3 max-w-2xl text-zinc-400">Planeje, aprenda e acompanhe cada decisão que transforma uma ideia em um produto real.</p><section className="mt-8 grid gap-3 sm:grid-cols-3"><Metric label="Projetos" value={projects?.length} detail="em seu workspace" /><Metric label="Em andamento" value={inProgress} detail="com foco agora" /><Metric label="Concluídos" value={completed} detail="prontos para celebrar" /></section><section className="mt-12"><div className="flex items-end justify-between"><div><h2 className="text-xl font-semibold">Projetos recentes</h2><p className="mt-1 text-sm text-zinc-500">Abra um projeto para acessar seu roadmap completo.</p></div>{projects && projects.length > 0 && <Link className="text-sm font-medium text-violet-300 hover:text-violet-200" href="/projects/new">Criar outro projeto</Link>}</div>{error ? <ErrorState message={error} /> : projects === null ? <ProjectSkeletons /> : projects.length === 0 ? <EmptyState /> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>}</section></div></main>;
}

function ProfileAvatar({ user, initials }: { user: User | null; initials: string }) { const avatarUrl = user?.avatar?.startsWith("http") ? user.avatar : null; return <Link href="/profile" title="Abrir perfil" aria-label="Abrir perfil" className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-zinc-700 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:scale-105 hover:border-violet-400">{avatarUrl ? <Image src={avatarUrl} alt="Avatar do perfil" width={44} height={44} unoptimized className="size-full object-cover" /> : initials}</Link>; }
function Metric({ label, value, detail }: { label: string; value?: number; detail: string }) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-semibold">{value ?? "—"}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></div>; }
function ProjectCard({ project }: { project: Project }) { return <Link href={`/projects/${project.id}`} className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-zinc-900"><div className="flex items-start justify-between gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-sm font-bold text-violet-300">{project.name.slice(0, 1).toUpperCase()}</span><StatusBadge status={project.status} /></div><h3 className="mt-6 truncate text-lg font-semibold group-hover:text-violet-200">{project.name}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">{project.description}</p><div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-300">{languageLabel(project.language)}</span><span className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-300">{project.framework.replace(/_/g, " ")}</span></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs text-zinc-500"><span>Progresso no workspace</span><span>Abra para visualizar</span></div><ProgressBar value={0} /></div></Link>; }
function ProjectSkeletons() { return <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-64 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50" key={item} />)}</div>; }
function EmptyState() { return <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-14 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-xl text-violet-300">✦</div><h3 className="mt-5 text-lg font-semibold">Seu workspace começa aqui</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">Crie seu primeiro projeto e receba um roadmap personalizado para guiar cada etapa do desenvolvimento.</p><Link className="mt-6 inline-flex rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold hover:bg-violet-400" href="/projects/new">Criar primeiro projeto</Link></div>; }
function ErrorState({ message }: { message: string }) { return <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-200">{message} Verifique se o back-end está em execução na porta 8080.</div>; }
