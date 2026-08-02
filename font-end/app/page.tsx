import Link from "next/link";

const highlights = [
  ["01", "Descreva sua ideia", "Conte o que você quer construir e escolha a sua stack."],
  ["02", "Receba o roadmap", "A IA organiza as etapas, decisões e conceitos importantes."],
  ["03", "Evolua com clareza", "Conclua cada passo e acompanhe seu progresso no workspace."],
];

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_16%_2%,rgba(139,92,246,.24),transparent_26rem),radial-gradient(circle_at_86%_20%,rgba(192,38,211,.16),transparent_22rem)]" />
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="inline-flex items-center gap-2.5" aria-label="DevOp, início">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-black shadow-lg shadow-violet-950/50">D</span>
        <span className="text-lg font-semibold tracking-tight">Dev<span className="text-violet-400">Op</span></span>
      </Link>
      <nav className="flex items-center gap-2 text-sm font-medium sm:gap-4">
        <Link href="/login" className="rounded-xl px-3 py-2 text-zinc-300 transition hover:bg-zinc-900 hover:text-white">Entrar</Link>
        <Link href="/register" className="rounded-xl bg-zinc-100 px-3.5 py-2 text-zinc-950 transition hover:bg-white">Criar conta</Link>
      </nav>
    </header>

    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <div className="max-w-4xl">
        <p className="animate-rise-in inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200"><span className="size-1.5 rounded-full bg-violet-300" /> Desenvolvimento guiado por IA</p>
        <h1 className="animate-rise-in mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">Transforme sua ideia em um plano que você consegue executar.</h1>
        <p className="animate-rise-in mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">DevOp cria roadmaps de desenvolvimento personalizados para você estudar, construir e manter o foco no que realmente importa.</p>
        <div className="animate-rise-in mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-semibold shadow-lg shadow-violet-950/50 transition hover:bg-violet-400">Começar gratuitamente <span className="ml-2">→</span></Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800">Já tenho uma conta</Link>
        </div>
      </div>

      <div className="relative mt-16 max-w-5xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-black/40 backdrop-blur sm:mt-20 sm:p-7">
        <div className="absolute -right-16 -top-16 size-52 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div><p className="text-xs font-medium uppercase tracking-widest text-violet-300">Workspace</p><h2 className="mt-1 text-lg font-semibold">Aplicativo de finanças pessoais</h2></div>
          <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-300">42% concluído</span>
        </div>
        <div className="relative mt-5 grid gap-3 md:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-3">
            {["Definir a arquitetura", "Modelar as transações", "Construir a API"].map((step, index) => <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4" key={step}><span className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${index === 0 ? "bg-emerald-500 text-emerald-950" : "bg-violet-500/10 text-violet-300"}`}>{index === 0 ? "✓" : `0${index + 1}`}</span><span className="text-sm font-medium text-zinc-200">{step}</span></div>)}
          </div>
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[.06] p-5"><p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Próximo passo</p><p className="mt-3 text-lg font-semibold">Estruture as entidades principais.</p><p className="mt-2 text-sm leading-6 text-zinc-400">Tenha um caminho claro, com tecnologias, práticas e critérios de conclusão em cada etapa.</p><div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full w-[42%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" /></div></div>
        </div>
      </div>
    </section>

    <section className="relative border-y border-zinc-900 bg-zinc-950/60">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"><div className="max-w-2xl"><p className="text-sm font-medium text-violet-300">Um processo simples</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Seu projeto deixa de ser uma aba aberta na cabeça.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{highlights.map(([number, title, description]) => <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6" key={number}><span className="text-sm font-semibold text-violet-300">{number}</span><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p></article>)}</div></div>
    </section>

    <footer className="relative mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>DevOp — seu plano para construir melhor.</span><div className="flex gap-5"><Link href="/login" className="hover:text-zinc-200">Entrar</Link><Link href="/register" className="hover:text-zinc-200">Criar conta</Link></div></footer>
  </main>;
}
