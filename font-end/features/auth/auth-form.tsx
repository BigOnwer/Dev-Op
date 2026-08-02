"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/ui/brand";
import { api, ApiError } from "@/lib/api";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (isRegister && name.trim().length < 2) return setError("Informe seu nome.");
    if (!email.includes("@")) return setError("Informe um e-mail válido.");
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    setPending(true);
    try {
      if (isRegister) {
        await api.register({ name: name.trim(), email, password });
        router.replace("/login?registered=1");
      } else {
        await api.login({ email, password });
        router.replace("/dashboard");
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível conectar ao servidor.");
    } finally { setPending(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,_rgba(126,34,206,.16),_transparent_32rem)] p-5">
    <section className="w-full max-w-md animate-rise-in rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7 shadow-2xl shadow-black/40 backdrop-blur sm:p-9">
      <Brand />
      <div className="mt-10">
        <p className="text-sm font-medium text-violet-300">Bem-vindo ao seu workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{isRegister ? "Crie sua conta" : "Que bom ter você aqui."}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{isRegister ? "Comece a transformar suas ideias em software, passo a passo." : "Entre para continuar desenvolvendo seus projetos."}</p>
      </div>
      <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
        {isRegister && <Field label="Nome" value={name} onChange={setName} placeholder="Como podemos te chamar?" autoComplete="name" />}
        <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" autoComplete="email" />
        <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Mínimo de 6 caracteres" autoComplete={isRegister ? "new-password" : "current-password"} />
        {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button disabled={pending} className="mt-2 w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Aguarde…" : isRegister ? "Criar conta" : "Entrar no DevOp"}</button>
      </form>
      <p className="mt-7 text-center text-sm text-zinc-400">{isRegister ? "Já possui uma conta?" : "Ainda não possui uma conta?"} <Link className="font-medium text-violet-300 hover:text-violet-200" href={isRegister ? "/login" : "/register"}>{isRegister ? "Entrar" : "Criar conta"}</Link></p>
    </section>
  </main>;
}

function Field({ label, value, onChange, type = "text", placeholder, autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder: string; autoComplete: string }) {
  const isPassword = type === "password";
  return <label className="block text-sm font-medium text-zinc-300"><span className="mb-2 block">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} minLength={isPassword ? 8 : undefined} maxLength={isPassword ? 128 : type === "email" ? 254 : 100} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></label>;
}
