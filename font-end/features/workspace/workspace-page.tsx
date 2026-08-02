"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Brand } from "@/components/ui/brand";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, ApiError } from "@/lib/api";
import { asList, languageLabel, levelLabel, percentage } from "@/lib/format";
import type { JsonValue, Note, Project, RoadmapStep } from "@/types/api";
import { ChatPanel } from "./chat-panel";

export function WorkspacePage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [stepUpdateError, setStepUpdateError] = useState("");
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [chatScope, setChatScope] = useState<RoadmapStep | "project" | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    api.getProject(projectId).then(setProject).catch((caught) => {
      if (caught instanceof ApiError && [401, 403, 500].includes(caught.status)) router.replace("/login");
      else setError(caught instanceof ApiError ? caught.message : "Não foi possível carregar este projeto.");
    });
  }, [projectId, router]);

  const steps = useMemo(() => [...(project?.RoadmapSteps ?? [])].sort((a, b) => a.step - b.step), [project]);
  if (error) return <main className="grid min-h-screen place-items-center p-5"><div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><p className="text-red-200">{error}</p><Link href="/dashboard" className="mt-5 inline-block text-sm font-medium text-violet-300">Voltar aos projetos</Link></div></main>;
  if (!project) return <WorkspaceSkeleton />;

  const completed = steps.filter((step) => step.completed).length;
  const progress = percentage(completed, steps.length);

  function selectStep(step: number) {
    setActiveStep(step);
    setMobileNavOpen(false);
    requestAnimationFrame(() => document.getElementById(`step-${step}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function toggleStep(step: RoadmapStep) {
    setStepUpdateError("");
    setUpdatingStepId(step.id);
    try {
      await api.completeStep(step.id, step.completed);
      setProject((current) => current ? { ...current, RoadmapSteps: current.RoadmapSteps?.map((currentStep) => currentStep.id === step.id ? { ...currentStep, completed: !step.completed } : currentStep) } : current);
    } catch (caught) {
      setStepUpdateError(caught instanceof ApiError ? caught.message : "Não foi possível atualizar esta etapa. Tente novamente.");
    } finally {
      setUpdatingStepId(null);
    }
  }

  return <main className="min-h-screen bg-[#09090b] text-zinc-100">
    <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-zinc-800 bg-zinc-950 lg:block"><Sidebar project={project} steps={steps} activeStep={activeStep} completed={completed} progress={progress} onSelect={selectStep} /></aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur lg:hidden"><div className="flex items-center gap-2"><button onClick={() => setMobileNavOpen(true)} aria-label="Abrir navegação" className="grid size-10 place-items-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300">☰</button><Link href="/dashboard" className="rounded-lg px-2 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white">← Menu</Link></div><Brand compact /><span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">{progress}%</span></header>
      {mobileNavOpen && <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setMobileNavOpen(false)}><aside className="h-full w-[min(20rem,88vw)] overflow-auto bg-zinc-950 shadow-2xl" onClick={(event) => event.stopPropagation()}><Sidebar project={project} steps={steps} activeStep={activeStep} completed={completed} progress={progress} onSelect={selectStep} onClose={() => setMobileNavOpen(false)} /></aside></div>}
      <section className="min-w-0"><WorkspaceHeader project={project} steps={steps.length} completed={completed} progress={progress} /><div className="mx-auto max-w-5xl px-4 py-8 pb-32 sm:px-8 sm:py-10"><section className="animate-rise-in"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-medium text-violet-300">Roadmap de desenvolvimento</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Seu próximo passo está aqui.</h1><p className="mt-2 text-sm text-zinc-400">Abra uma etapa para consultar todo o contexto que a IA preparou para você.</p></div><div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-right"><p className="text-xs text-zinc-500">Etapas concluídas</p><p className="mt-1 text-lg font-semibold">{completed} <span className="text-zinc-500">/ {steps.length}</span></p></div></div></section>{stepUpdateError && <p role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{stepUpdateError}</p>}<section className="mt-8 space-y-3">{steps.length === 0 ? <EmptyRoadmap /> : steps.map((step) => <RoadmapCard key={step.id} step={step} isActive={activeStep === step.step} onOpen={() => setActiveStep(step.step)} onToggle={() => toggleStep(step)} onAskQuestion={() => setChatScope(step)} isUpdating={updatingStepId === step.id} />)}</section></div></section>
    </div>
    <FloatingActions onNotes={() => setNotesOpen(true)} onChat={() => setChatScope("project")} onNext={() => { const next = steps.find((step) => !step.completed); if (next) selectStep(next.step); }} />
    {notesOpen && <NotesPanel projectId={project.id} steps={steps} onClose={() => setNotesOpen(false)} />}
    {chatScope && <ChatPanel key={chatScope === "project" ? "project" : chatScope.id} projectId={project.id} step={chatScope === "project" ? undefined : chatScope} onClose={() => setChatScope(null)} />}
  </main>;
}

function Sidebar({ project, steps, activeStep, completed, progress, onSelect, onClose }: { project: Project; steps: RoadmapStep[]; activeStep: number | null; completed: number; progress: number; onSelect: (step: number) => void; onClose?: () => void }) { return <div className="flex min-h-full flex-col p-5"><div className="flex items-center justify-between"><Brand />{onClose && <button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-white">×</button>}</div><div className="mt-8"><p className="line-clamp-2 text-lg font-semibold">{project.name}</p><p className="mt-2 line-clamp-3 text-sm leading-5 text-zinc-500">{project.description}</p></div><div className="mt-5 flex flex-wrap gap-2"><Chip>{languageLabel(project.language)}</Chip><Chip>{project.framework.replace(/_/g, " ")}</Chip><Chip>{levelLabel(project.level)}</Chip></div><div className="mt-7 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex items-center justify-between text-sm"><span className="font-medium">Progresso</span><span className="font-semibold text-violet-300">{progress}%</span></div><ProgressBar value={progress} className="mt-3" /><p className="mt-3 text-xs text-zinc-500">{completed} de {steps.length} etapas concluídas</p></div><nav className="mt-8 min-h-0 flex-1"><p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">Navegar pelo roadmap</p><div className="space-y-1">{steps.map((step) => <button key={step.id} onClick={() => onSelect(step.step)} className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${activeStep === step.step ? "bg-violet-500/10 text-violet-200" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${step.completed ? "bg-emerald-500 text-emerald-950" : activeStep === step.step ? "bg-violet-500 text-white" : "bg-zinc-800 text-zinc-500"}`}>{step.completed ? "✓" : step.step}</span><span className="truncate text-sm">{step.title}</span></button>)}</div></nav><div className="mt-6 border-t border-zinc-800 pt-4"><button title="Ainda não há endpoint para configurações" disabled className="w-full cursor-not-allowed rounded-xl px-3 py-2 text-left text-sm text-zinc-600">Configurações do projeto <span className="text-xs">(em breve)</span></button></div></div>; }
function Chip({ children }: { children: React.ReactNode }) { return <span className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">{children}</span>; }
function WorkspaceHeader({ project, steps, completed, progress }: { project: Project; steps: number; completed: number; progress: number }) { return <header className="hidden border-b border-zinc-800 bg-zinc-950/70 px-8 py-4 backdrop-blur lg:flex lg:items-center lg:justify-between"><div className="flex items-center gap-5"><Link href="/dashboard" className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white">← Voltar ao menu</Link><div><p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Workspace</p><div className="mt-1 flex items-center gap-3"><h2 className="font-semibold">{project.name}</h2><StatusBadge status={project.status} /></div></div></div><div className="flex items-center gap-4"><span className="text-sm text-zinc-500">{completed}/{steps} concluídas</span><div className="w-28"><ProgressBar value={progress} /></div><span className="text-sm font-semibold text-violet-300">{progress}%</span></div></header>; }
function RoadmapCard({ step, isActive, onOpen, onToggle, onAskQuestion, isUpdating }: { step: RoadmapStep; isActive: boolean; onOpen: () => void; onToggle: () => void; onAskQuestion: () => void; isUpdating: boolean }) { const [open, setOpen] = useState(false); function toggle() { const next = !open; setOpen(next); if (next) onOpen(); } return <article id={`step-${step.step}`} className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-zinc-950 transition ${open || isActive ? "border-violet-500/40 shadow-xl shadow-violet-950/10" : "border-zinc-800 hover:border-zinc-700"}`}><button onClick={toggle} className="flex w-full items-start gap-4 p-4 text-left sm:p-5"><span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${step.completed ? "bg-emerald-500 text-emerald-950" : "bg-violet-500/10 text-violet-300"}`}>{step.completed ? "✓" : String(step.step).padStart(2, "0")}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-semibold text-zinc-100">{step.title}</span>{step.completed && <span className="text-xs font-medium text-emerald-400">Concluída</span>}</span><span className="mt-1.5 block line-clamp-2 text-sm leading-6 text-zinc-400">{step.description}</span><span className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500"><span>◷ {step.estimatedTime}</span><span>{open ? "Ocultar detalhes" : "Ver guia completo"}</span></span></span><span className={`mt-1 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span></button><div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="min-h-0"><div className="border-t border-zinc-800 px-4 pb-5 pt-6 sm:px-6 sm:pb-7"><StepDetails step={step} onToggle={onToggle} onAskQuestion={onAskQuestion} isUpdating={isUpdating} /></div></div></div></article>; }
function StepDetails({ step, onToggle, onAskQuestion, isUpdating }: { step: RoadmapStep; onToggle: () => void; onAskQuestion: () => void; isUpdating: boolean }) { return <div className="space-y-7"><DetailBlock title="Descrição" icon="◈"><p className="text-sm leading-7 text-zinc-300">{step.description}</p></DetailBlock><div className="grid gap-5 lg:grid-cols-2"><ListBlock title="Tecnologias" values={step.technologies} /><ListBlock title="Bibliotecas" values={step.libraries} /><ListBlock title="Padrões de projeto" values={step.designPatterns} /><ListBlock title="Conceitos de arquitetura" values={step.architectureConcepts} /></div><DetailBlock title="Estrutura de pastas" icon="⌘"><FileTree value={step.folderStructure} /></DetailBlock><ListBlock title="Arquivos a criar" values={step.filesToCreate} numbered /><DetailBlock title="Guia de implementação" icon="→" emphasis><ImplementationGuide value={step.implementationGuide} /></DetailBlock><div className="grid gap-5 lg:grid-cols-2"><ListBlock title="Boas práticas" values={step.bestPractices} variant="good" /><ListBlock title="Erros comuns" values={step.commonMistakes} variant="warning" /></div><ListBlock title="Assuntos para estudar" values={step.studyTopics} /><ListBlock title="Critérios de conclusão" values={step.completionCriteria} variant="good" /><DetailBlock title="Próxima etapa" icon="→"><p className="text-sm leading-7 text-zinc-300">{step.nextStep}</p></DetailBlock><div className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"><div><p className="text-sm font-semibold">{step.completed ? "Esta etapa está concluída" : "Quando terminar, registre seu avanço."}</p><p className="mt-1 text-xs leading-5 text-zinc-500">O progresso é salvo no seu roadmap.</p></div><div className="flex flex-col gap-2 sm:flex-row"><button onClick={onAskQuestion} className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20">✦ Perguntar à IA</button><button onClick={onToggle} disabled={isUpdating} className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60">{isUpdating ? "Salvando..." : step.completed ? "✓ Marcar como não concluída" : "Concluir etapa"}</button></div></div></div>; }
function DetailBlock({ title, icon, children, emphasis = false }: { title: string; icon: string; children: React.ReactNode; emphasis?: boolean }) { return <section className={emphasis ? "rounded-2xl border border-violet-500/20 bg-violet-500/[.045] p-4 sm:p-5" : ""}><h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100"><span className={`grid size-6 place-items-center rounded-md text-xs ${emphasis ? "bg-violet-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>{icon}</span>{title}</h3><div className="mt-4">{children}</div></section>; }
function ListBlock({ title, values, numbered = false, variant = "neutral" }: { title: string; values: JsonValue; numbered?: boolean; variant?: "neutral" | "good" | "warning" }) { const items = asList(values); const dot = variant === "good" ? "bg-emerald-400" : variant === "warning" ? "bg-amber-400" : "bg-violet-400"; return <section><h3 className="text-sm font-semibold text-zinc-100">{title}</h3>{items.length ? <ul className="mt-3 space-y-2">{items.map((item, index) => <li className="flex gap-3 text-sm leading-6 text-zinc-300" key={`${item}-${index}`}><span className={`mt-2 size-1.5 shrink-0 rounded-full ${numbered ? "grid size-5 -mt-0.5 place-items-center bg-zinc-800 text-[10px] font-bold text-zinc-400" : dot}`}>{numbered ? index + 1 : ""}</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-sm text-zinc-500">Nenhuma informação registrada.</p>}</section>; }
function ImplementationGuide({ value }: { value: JsonValue }) { const steps = asList(value); return <ol className="space-y-4">{steps.map((item, index) => <li className="flex gap-3" key={`${item}-${index}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">{index + 1}</span><div className="min-w-0 flex-1 text-sm leading-7 text-zinc-200"><GuideContent content={item} /></div></li>)}</ol>; }
function GuideContent({ content }: { content: string }) { const match = content.match(/```([\w+-]*)\n?([\s\S]*?)```/); if (!match) return <>{content}</>; return <><p>{content.slice(0, match.index).trim()}</p><div className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-[#0b0b0d]"><div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-500"><span>{match[1] || "code"}</span><button onClick={() => navigator.clipboard?.writeText(match[2])} className="rounded px-2 py-0.5 hover:bg-zinc-800 hover:text-zinc-200">Copiar</button></div><pre className="scrollbar-subtle overflow-auto p-4 font-mono text-xs leading-6 text-violet-100"><code>{match[2].trim()}</code></pre></div>{content.slice((match.index ?? 0) + match[0].length).trim() && <p>{content.slice((match.index ?? 0) + match[0].length).trim()}</p>}</>; }
function FileTree({ value }: { value: JsonValue }) { if (typeof value === "string") return <pre className="scrollbar-subtle overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 font-mono text-xs leading-6 text-zinc-300">{value}</pre>; return <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-xs leading-6 text-zinc-300"><TreeNode value={value} /></div>; }
function TreeNode({ value, depth = 0, label }: { value: JsonValue; depth?: number; label?: string }) { if (Array.isArray(value)) return <>{value.map((child, index) => <TreeNode value={child} depth={depth} label={typeof child === "string" ? child : undefined} key={index} />)}</>; if (value && typeof value === "object") return <>{label && <p style={{ paddingLeft: `${depth * 16}px` }} className="text-violet-300">▾ {label}</p>}{Object.entries(value).map(([key, child]) => <TreeNode key={key} value={child} depth={depth + (label ? 1 : 0)} label={key} />)}</>; return <p style={{ paddingLeft: `${depth * 16}px` }} className="text-zinc-400">{label ? `├─ ${label}${value === true ? "" : `: ${String(value)}`}` : String(value)}</p>; }
function FloatingActions({ onNotes, onChat, onNext }: { onNotes: () => void; onChat: () => void; onNext: () => void }) { return <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2"><ActionButton label="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</ActionButton><ActionButton label="Ir para próxima etapa" onClick={onNext}>◎</ActionButton><ActionButton label="Meu Caderno" onClick={onNotes}>⌑</ActionButton><ActionButton label="Conversar sobre o projeto" onClick={onChat} primary>✦</ActionButton></div>; }
function ActionButton({ children, label, onClick, primary = false }: { children: React.ReactNode; label: string; onClick: () => void; primary?: boolean }) { return <button onClick={onClick} aria-label={label} title={label} className={`grid size-11 place-items-center rounded-full border text-lg shadow-lg transition hover:scale-105 ${primary ? "border-violet-400 bg-violet-500 text-white shadow-violet-950/60" : "border-zinc-700 bg-zinc-900 text-zinc-300 shadow-black/30 hover:bg-zinc-800"}`}>{children}</button>; }
function NotesPanel({ projectId, steps, onClose }: { projectId: string; steps: RoadmapStep[]; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [stepId, setStepId] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const selectedStep = steps.find((step) => step.id === stepId);

  function stepForNote(note: Note) {
    return note.stepId ? steps.find((step) => step.id === note.stepId) : undefined;
  }

  useEffect(() => {
    let cancelled = false;

    const loadNotes = stepId ? api.getStepNotes(stepId) : api.getProjectNotes(projectId);
    loadNotes.then((loadedNotes) => {
      if (!cancelled) setNotes(loadedNotes);
    }).catch((caught) => {
      if (!cancelled) setError(caught instanceof ApiError ? caught.message : "Não foi possível carregar as anotações.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [projectId, stepId]);

  function handleScopeChange(nextStepId: string) {
    setLoading(true);
    setError("");
    setStepId(nextStepId);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const note = content.trim();
    if (!note) return;

    setSaving(true);
    setError("");
    try {
      const response = await api.createNote({ projectId, note, ...(stepId ? { stepId } : {}) });
      setNotes((current) => [response.data, ...current]);
      setContent("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível salvar a anotação.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!window.confirm("Excluir esta anotação? Esta ação não poderá ser desfeita.")) return;

    setDeletingNoteId(noteId);
    setError("");
    try {
      await api.deleteNote(noteId);
      setNotes((current) => current.filter((note) => note.id !== noteId));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível excluir a anotação.");
    } finally {
      setDeletingNoteId(null);
    }
  }

  return <div className="fixed inset-0 z-40 flex justify-end bg-black/60 p-0 sm:p-4" onClick={onClose}>
    <aside aria-labelledby="notes-title" onClick={(event) => event.stopPropagation()} className="animate-rise-in flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-[#0d0d11] shadow-2xl sm:rounded-3xl sm:border">
      <header className="border-b border-zinc-800 bg-gradient-to-br from-violet-500/15 via-zinc-950 to-zinc-950 px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500 text-xl text-white shadow-lg shadow-violet-950/50">⌑</span><div><p className="text-sm font-medium text-violet-200">Espaço pessoal do projeto</p><h2 id="notes-title" className="mt-0.5 text-2xl font-semibold tracking-tight text-white">Meu Caderno</h2></div></div>
          <button type="button" aria-label="Fechar caderno" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-700/80 bg-zinc-900/80 text-lg text-zinc-400 transition hover:border-zinc-600 hover:text-white">×</button>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm"><div><p className="text-xs text-zinc-500">Visualizando</p><p className="mt-0.5 font-medium text-zinc-200">{selectedStep ? `Etapa ${selectedStep.step}: ${selectedStep.title}` : "Todas as anotações do projeto"}</p></div><span className="rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-200">{loading ? "..." : notes.length} {notes.length === 1 ? "nota" : "notas"}</span></div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold text-zinc-200" htmlFor="note-content">Registrar uma anotação</label><span className="text-xs text-zinc-600">{content.length}/5000</span></div>
          <textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} required minLength={1} maxLength={5000} rows={5} disabled={saving} placeholder="Registre uma ideia, dúvida, decisão ou algo para revisar depois..." className="mt-3 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-60" />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><label className="sr-only" htmlFor="note-scope">Associar anotação a</label><select id="note-scope" value={stepId} onChange={(event) => handleScopeChange(event.target.value)} disabled={saving} className="max-w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-violet-400 disabled:opacity-60"><option value="">Projeto inteiro</option>{steps.map((step) => <option key={step.id} value={step.id}>Etapa {step.step}: {step.title}</option>)}</select></div><button type="submit" disabled={saving || !content.trim()} className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Salvando..." : "Salvar nota"}</button></div>
        </form>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">{error}</p>}
        <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-zinc-200">{selectedStep ? "Notas desta etapa" : "Histórico de anotações"}</h3>{!selectedStep && <p className="text-xs text-zinc-600">Inclui notas das etapas</p>}</div>
          {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50" />)}</div> : notes.length ? <div className="space-y-3">{notes.map((note) => { const noteStep = stepForNote(note); const isDeleting = deletingNoteId === note.id; return <article key={note.id} className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${noteStep ? "bg-violet-500/15 text-violet-200" : "bg-zinc-800 text-zinc-300"}`}><span className="text-sm">{noteStep ? "◎" : "⌂"}</span>{noteStep ? `Etapa ${noteStep.step}` : "Projeto"}</span>{noteStep && <p className="mt-2 truncate text-sm font-medium text-zinc-300">{noteStep.title}</p>}</div><div className="flex shrink-0 flex-col items-end gap-2"><time dateTime={note.createdAt} className="text-xs text-zinc-600">{formatNoteDate(note.createdAt)}</time><button type="button" onClick={() => handleDelete(note.id)} disabled={isDeleting} className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-60">{isDeleting ? "Excluindo..." : "Excluir"}</button></div></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">{note.content}</p></article>; })}</div> : <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 px-5 py-10 text-center"><span className="text-2xl">⌑</span><p className="mt-3 font-medium text-zinc-300">Nenhuma anotação por aqui</p><p className="mt-1 text-sm leading-6 text-zinc-500">Registre o que for importante para não perder o contexto do seu projeto.</p></div>}
        </section>
      </div>
    </aside>
  </div>;
}

function formatNoteDate(date: string) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date)); }
function EmptyRoadmap() { return <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-400">Este projeto ainda não possui etapas retornadas pela API.</div>; }
function WorkspaceSkeleton() { return <main className="min-h-screen bg-zinc-950 p-5 lg:grid lg:grid-cols-[19rem_1fr] lg:p-0"><div className="hidden min-h-screen border-r border-zinc-800 bg-zinc-950 lg:block" /><section className="p-5 lg:p-10"><div className="h-5 w-28 animate-pulse rounded bg-zinc-800" /><div className="mt-3 h-9 w-80 max-w-full animate-pulse rounded bg-zinc-800" /><div className="mt-10 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50" />)}</div></section></main>; }
