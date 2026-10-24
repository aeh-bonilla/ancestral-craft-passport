import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, UploadCloud, FileAudio, FileImage, FileText, X, Anchor } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode, StellarBadge } from "@/components/toltek/ui";
import { artisans, contractId, sha256, shortHash, USDC_RATE } from "@/lib/toltek";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar Obra y Pasaporte Cultural — Toltek" },
      { name: "description", content: "Registra una pieza, sella su evidencia con SHA-256 y ánclala en Stellar." },
      { property: "og:title", content: "Registro de Obra — Toltek" },
      { property: "og:description", content: "Genera un Pasaporte Cultural Phygital con QR y hash inmutable." },
    ],
  }),
  component: Register,
});

const steps = ["Datos de la Pieza", "Evidencia del Saber", "Minting Criptográfico"];
const categories = ["Textil", "Cerámica", "Talla en Madera", "Filigrana", "Laca"];

function Register() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ title: "", artisan: artisans[0]!.name, category: "Talla en Madera", technique: "", materials: "", priceMxn: "" });
  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const [hash, setHash] = useState("");
  const [minting, setMinting] = useState<"idle" | "running" | "done">("idle");
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    sha256(JSON.stringify({ d, files: files.map((f) => f.name + f.size) })).then(setHash);
  }, [d, files]);

  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setD({ ...d, [k]: e.target.value });
  const usdc = d.priceMxn ? (Number(d.priceMxn) / USDC_RATE).toFixed(2) : "0.00";

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list).map((x) => ({ name: x.name, size: x.size, type: x.type }))]);
    toast.success(`${list.length} archivo(s) sellados con SHA-256`);
  };

  const next = () => {
    if (step === 0 && !d.title.trim()) { toast.error("Agrega el título de la pieza"); return; }
    setStep((s) => Math.min(2, s + 1));
  };

  const mint = () => {
    setMinting("running");
    setPhase(0);
    const phases = [700, 1400, 2100, 2800];
    phases.forEach((t, i) => setTimeout(() => setPhase(i + 1), t));
    setTimeout(() => {
      setMinting("done");
      toast.success("Pasaporte Phygital anclado en Stellar", { description: shortHash(hash) });
    }, 3200);
  };

  const fileIcon = (t: string) => (t.startsWith("image") ? FileImage : t.startsWith("audio") ? FileAudio : FileText);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold md:text-4xl">Registro de Obra & Pasaporte Cultural</h1>
      <p className="mt-2 text-muted-foreground">Cada dato que escribes se sella en vivo; nada sale de tu navegador hasta el anclaje.</p>

      <ol className="mt-8 flex flex-wrap gap-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <button onClick={() => i <= step && setStep(i)} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm", i === step && "border-primary bg-primary text-primary-foreground", i < step && "border-jade text-jade")}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-background/20 text-xs">{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border bg-card p-6 shadow-float">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título de la obra" className="sm:col-span-2"><Input value={d.title} onChange={set("title")} placeholder="Ej. Alebrije Jaguar Nahual" /></Field>
              <Field label="Artesano">
                <select value={d.artisan} onChange={set("artisan")} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  {artisans.map((a) => <option key={a.name}>{a.name}</option>)}
                </select>
              </Field>
              <Field label="Categoría">
                <select value={d.category} onChange={set("category")} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Técnica ancestral" className="sm:col-span-2"><Textarea value={d.technique} onChange={set("technique")} placeholder="Tallado a mano en copal, pintura con pigmentos naturales…" /></Field>
              <Field label="Materiales autóctonos"><Input value={d.materials} onChange={set("materials")} placeholder="Copal, grana cochinilla, añil" /></Field>
              <Field label="Precio (MXN)">
                <Input type="number" min={0} value={d.priceMxn} onChange={set("priceMxn")} placeholder="8900" />
                <p className="mt-1 text-xs text-muted-foreground">≈ {usdc} USDC</p>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div>
              <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                className={cn("flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors", drag ? "border-primary bg-primary/5" : "border-border talavera-bg")}>
                <UploadCloud className="h-10 w-10 text-primary" />
                <p className="mt-3 font-semibold">Arrastra fotos del proceso, audios o documentos</p>
                <p className="text-sm text-muted-foreground">o haz clic para seleccionar · JPG, MP3, PDF</p>
                <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </label>
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => {
                  const I = fileIcon(f.type);
                  return (
                    <li key={i} className="flex items-center gap-3 rounded-lg border bg-background p-3 text-sm">
                      <I className="h-5 w-5 text-primary" />
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Quitar"><X className="h-4 w-4" /></button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generación criptográfica</h2>
              <dl className="grid gap-3 text-sm">
                <Row k="Hash SHA-256 del expediente" v={hash} />
                <Row k="Contrato Soroban" v={contractId} />
                <Row k="Red" v="Stellar Testnet" />
                <Row k="Evidencias selladas" v={`${files.length} archivo(s)`} />
              </dl>
              <Button size="lg" className="w-full" onClick={mint} disabled={minting === "running"}>
                <Anchor /> Anclar en Stellar Blockchain & Generar Pasaporte Phygital
              </Button>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Atrás</Button>
            {step < 2 && <Button onClick={next}>Continuar</Button>}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl bg-indigo text-indigo-foreground shadow-float">
            <div className="greca" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Pasaporte Cultural</p>
                <span className="font-mono text-[10px] opacity-60">Vista previa</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl font-semibold">{d.title || "Título de la obra"}</h3>
              <p className="text-sm opacity-75">{d.artisan} · {d.category}</p>
              {d.materials && <p className="mt-1 text-xs opacity-60">{d.materials}</p>}
              <div className="mt-5 flex items-center gap-4">
                <div className="rounded-lg bg-card p-2"><QrCode value={hash} size={112} /></div>
                <div className="min-w-0 text-sm">
                  <p className="text-xs opacity-60">Precio</p>
                  <p className="font-semibold">{d.priceMxn ? `$${Number(d.priceMxn).toLocaleString("es-MX")} MXN` : "—"}</p>
                  <p className="text-xs text-gold">{usdc} USDC</p>
                </div>
              </div>
              <p className="mt-5 text-xs uppercase tracking-wider opacity-60">SHA-256 (en vivo)</p>
              <p className="break-all font-mono text-[11px] text-gold">{hash}</p>
              <StellarBadge className="mt-4" label={minting === "done" ? "Anclado en Stellar" : "Pendiente de anclaje"} />
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={minting !== "idle"} onOpenChange={(o) => !o && minting === "done" && setMinting("idle")}>
        <DialogContent className="overflow-hidden">
          {minting === "done" && <Confetti />}
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{minting === "done" ? "¡Pasaporte emitido!" : "Anclando en Stellar…"}</DialogTitle>
            <DialogDescription>{minting === "done" ? "La pieza ya puede verificarse con su QR." : "No cierres esta ventana."}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-3">
            {["Calculando hash SHA-256", "Firmando transacción con Freighter", "Invocando contrato Soroban", "Emitiendo Pasaporte Phygital"].map((l, i) => (
              <li key={l} className="flex items-center gap-3 text-sm">
                {phase > i ? <Check className="h-5 w-5 text-jade" /> : phase === i ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <span className="h-5 w-5 rounded-full border" />}
                <span className={phase > i ? "" : "text-muted-foreground"}>{l}</span>
              </li>
            ))}
          </ul>
          {minting === "done" && (
            <div className="flex items-center gap-4 rounded-xl border bg-sand p-4">
              <QrCode value={hash} size={80} />
              <div className="min-w-0 text-sm">
                <p className="font-semibold">{d.title || "Nueva obra"}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{shortHash(hash)}</p>
                <Button asChild size="sm" variant="link" className="h-auto px-0"><Link to="/verificar">Ver en verificador →</Link></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1.5", className)}><Label>{label}</Label>{children}</div>;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-sand p-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-1 break-all font-mono text-xs">{v}</dd>
    </div>
  );
}

function Confetti() {
  const colors = ["bg-primary", "bg-gold", "bg-jade", "bg-indigo"];
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} className={cn("animate-confetti absolute top-0 h-2.5 w-1.5 rounded-sm", colors[i % 4])}
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.08}s` }} />
      ))}
    </div>
  );
}
