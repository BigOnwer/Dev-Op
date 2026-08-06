"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/ui/brand";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/api";

export function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [lastPassword, setLastPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api.getUser().then((profile) => {
      setUser(profile);
      setName(profile.name);
      if (profile.avatar?.startsWith("http")) setAvatarPreview(profile.avatar);
    }).catch((caught) => {
      if (caught instanceof ApiError && caught.status === 401) router.replace("/login");
      else setError(caught instanceof ApiError ? caught.message : "Não foi possível carregar seu perfil.");
    });
  }, [router]);

  function resetFeedback() { setError(""); setSuccess(""); }
  function mergeUser(updated: User) { setUser((current) => current ? { ...current, ...updated } : updated); }

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    if (name.trim().length < 2) return setError("Informe um nome com pelo menos 2 caracteres.");
    setSavingName(true);
    try { mergeUser(await api.updateUser(name.trim())); setSuccess("Nome atualizado com sucesso."); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "Não foi possível atualizar o perfil."); }
    finally { setSavingName(false); }
  }

  async function selectAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    resetFeedback();
    if (!new Set(["image/png", "image/jpeg", "image/webp"]).has(file.type)) { setError("Escolha uma imagem PNG, JPG ou WEBP."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("A imagem deve ter no máximo 5 MB."); return; }

    setSavingAvatar(true);
    try {
      const updatedUser = await api.uploadAvatar(file);
      mergeUser(updatedUser);
      setAvatarPreview(updatedUser.avatar?.startsWith("http") ? updatedUser.avatar : "");
      setSuccess("Avatar atualizado com sucesso.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível enviar o avatar.");
    } finally {
      setSavingAvatar(false);
      event.target.value = "";
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    if (newPassword.length < 8) return setError("A nova senha deve ter pelo menos 8 caracteres.");
    if (newPassword !== confirmPassword) return setError("A confirmação da nova senha não confere.");
    setSavingPassword(true);
    try {
      await api.updatePassword({ lastPassword, newPassword });
      setLastPassword(""); setNewPassword(""); setConfirmPassword("");
      setSuccess("Senha atualizada com sucesso.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível atualizar a senha.");
    } finally { setSavingPassword(false); }
  }

  if (!user && !error) return <ProfileSkeleton />;
  if (!user) return <main className="grid min-h-screen place-items-center p-5"><div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><p className="text-red-200">{error}</p><Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-violet-300">Voltar aos projetos</Link></div></main>;

  const initials = user.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <main className="min-h-screen bg-[radial-gradient(circle_at_86%_0%,_rgba(109,40,217,.15),_transparent_23rem)]"><header className="border-b border-zinc-900 bg-zinc-950/70 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-5xl items-center justify-between"><Brand /><Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white">← Projetos</Link></div></header><div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14"><p className="text-sm font-medium text-violet-300">Conta</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Seu perfil</h1><p className="mt-3 text-zinc-400">Gerencie suas informações, imagem e senha de acesso.</p>{(error || success) && <p role="alert" className={`mt-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-500/20 bg-red-500/10 text-red-200" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"}`}>{error || success}</p>}<div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><section className="space-y-6"><div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-7"><h2 className="text-lg font-semibold">Imagem de perfil</h2><p className="mt-1 text-sm text-zinc-500">PNG, JPG ou WEBP, com até 5 MB.</p><div className="mt-6 flex flex-wrap items-center gap-5"><div className="grid size-20 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl font-bold text-white">{avatarPreview ? <Image src={avatarPreview} alt="Avatar do perfil" width={80} height={80} unoptimized className="size-full object-cover" /> : initials}</div><label className={`cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 ${savingAvatar ? "pointer-events-none opacity-60" : ""}`}><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={selectAvatar} disabled={savingAvatar} />{savingAvatar ? "Enviando imagem..." : "Alterar avatar"}</label></div></div><form onSubmit={saveName} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-7"><h2 className="text-lg font-semibold">Informações pessoais</h2><label className="mt-6 block text-sm font-medium text-zinc-300"><span className="mb-2 block">Nome</span><input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></label><label className="mt-5 block text-sm font-medium text-zinc-300"><span className="mb-2 block">E-mail</span><input value={user.email} disabled className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-3 text-sm text-zinc-500" /></label><button disabled={savingName} className="mt-6 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60">{savingName ? "Salvando..." : "Salvar alterações"}</button></form></section><form onSubmit={savePassword} className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 sm:p-7"><h2 className="text-lg font-semibold">Segurança</h2><p className="mt-1 text-sm text-zinc-500">Use uma senha forte e exclusiva.</p><PasswordField label="Senha atual" value={lastPassword} onChange={setLastPassword} /><PasswordField label="Nova senha" value={newPassword} onChange={setNewPassword} /><PasswordField label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} /><button disabled={savingPassword} className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-60">{savingPassword ? "Atualizando..." : "Atualizar senha"}</button></form></div></div></main>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const isCurrentPassword = label === "Senha atual"; return <label className="mt-5 block text-sm font-medium text-zinc-300"><span className="mb-2 block">{label}</span><input type="password" required minLength={8} maxLength={128} autoComplete={isCurrentPassword ? "current-password" : "new-password"} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></label>; }
function ProfileSkeleton() { return <main className="min-h-screen bg-zinc-950 p-5 sm:p-8"><div className="mx-auto max-w-5xl"><div className="h-9 w-32 animate-pulse rounded bg-zinc-800" /><div className="mt-10 grid gap-6 lg:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/50" />)}</div></div></main>; }
