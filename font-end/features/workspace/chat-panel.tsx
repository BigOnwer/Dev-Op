"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { RoadmapStep } from "@/types/api";
import { MarkdownContent } from "./markdown-content";

type ChatMessage = { role: "assistant" | "user"; content: string };

export function ChatPanel({ projectId, step, onClose }: { projectId: string; step?: RoadmapStep; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: step ? `Estou com o contexto da etapa ${step.step}: **${step.title}**. Como posso ajudar?` : "Estou com o contexto completo deste projeto. O que você gostaria de saber?" }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pending]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || pending) return;
    if (message.length > 4_000) {
      setError("A pergunta pode ter no máximo 4.000 caracteres.");
      return;
    }

    setDraft("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setPending(true);
    try {
      const response = await api.askProjectQuestion({ projectId, message, stepId: step?.id });
      setMessages((current) => [...current, { role: "assistant", content: response.data }]);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível obter a resposta da IA. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const context = step ? `Etapa ${step.step}` : "Projeto completo";
  return <div className="fixed inset-0 z-40 flex justify-end bg-black/50 p-3 sm:p-5" onClick={onClose}><aside onClick={(event) => event.stopPropagation()} className="animate-rise-in flex h-full w-full max-w-xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"><header className="flex items-start justify-between border-b border-zinc-800 p-5 sm:p-6"><div className="min-w-0"><p className="text-sm font-medium text-violet-300">Chat com IA · {context}</p><h2 className="mt-1 truncate text-xl font-semibold">{step ? step.title : "Mentor do projeto"}</h2></div><button onClick={onClose} aria-label="Fechar chat" className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-white">×</button></header><div className="scrollbar-subtle flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">{messages.map((chat, index) => <div key={`${chat.role}-${index}`} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${chat.role === "user" ? "rounded-br-md bg-violet-500 text-white" : "rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-300"}`}>{chat.role === "user" ? <p className="whitespace-pre-wrap">{chat.content}</p> : <MarkdownContent content={chat.content} />}</div></div>)}{pending && <div className="flex justify-start"><p className="rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">A IA está pensando...</p></div>}{error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}<div ref={messagesEndRef} /></div><form onSubmit={submit} className="border-t border-zinc-800 p-4 sm:p-5"><label className="sr-only" htmlFor="chat-message">Sua pergunta</label><textarea id="chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={step ? "Pergunte sobre esta etapa..." : "Pergunte sobre o projeto..."} rows={3} disabled={pending} className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60" /><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-zinc-500">A IA usará o contexto de {step ? "esta etapa" : "todo o projeto"}.</p><button disabled={!draft.trim() || pending} className="shrink-0 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Enviando..." : "Enviar"}</button></div></form></aside></div>;
}
