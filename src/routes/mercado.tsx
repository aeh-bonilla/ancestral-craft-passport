import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileSignature, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CodiButton, PieceCard, SectionTitle, StellarBadge } from "@/components/toltek/ui";
import { patterns, pieces, toUsdc, type Pattern } from "@/lib/toltek";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mercado")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Mercado Ético y Licenciamiento B2B — Tlamatik" },
      { name: "description", content: "Compra artesanías certificadas o licencia patrones tradicionales con regalías para la comunidad." },
      { property: "og:title", content: "Mercado Ético — Tlamatik" },
      { property: "og:description", content: "Artesanías con origen comunitario y licencias éticas firmadas en Soroban." },
    ],
  }),
  component: Market,
});

const regions = ["Oaxaca", "Chiapas", "Jalisco", "Michoacán", "Guerrero", "Puebla"];
const techniques = ["Textil", "Cerámica", "Talla en Madera", "Filigrana", "Laca"];
const uses = ["Textil comercial", "Arquitectura", "Edición limitada"];

function Market() {
  const [mode, setMode] = useState<"fisico" | "b2b">("fisico");
  const [region, setRegion] = useState<string | null>(null);
  const [tech, setTech] = useState<string | null>(null);
  const [max, setMax] = useState(10000);
  const [lic, setLic] = useState<Pattern | null>(null);
  const [use, setUse] = useState(uses[0]);
  const [royalty, setRoyalty] = useState(12);
  const [signing, setSigning] = useState(false);

  const list = useMemo(() => pieces.filter((p) => (!region || p.region === region) && (!tech || p.technique === tech) && p.priceMxn <= max), [region, tech, max]);

  const sign = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setLic(null);
      toast.success("Licencia ética aprobada", { description: `${royalty}% de regalías automáticas para ${lic?.community}` });
    }, 1600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mx-auto flex w-full max-w-md rounded-2xl border bg-sand p-1 sm:w-fit sm:rounded-full">
        {([["fisico", "Comprar Artesanías Físicas"], ["b2b", "Licenciamiento Ético para Marcas"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={cn("flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium leading-tight transition-colors sm:rounded-full sm:px-4", mode === k ? "bg-indigo text-indigo-foreground" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>

      {mode === "fisico" ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6 rounded-xl border bg-card p-5 shadow-float lg:self-start">
            <Chips title="Región" items={regions} value={region} onChange={setRegion} />
            <Chips title="Técnica" items={techniques} value={tech} onChange={setTech} />
            <div>
              <p className="mb-3 text-sm font-semibold">Precio máximo: ${max.toLocaleString("es-MX")} MXN</p>
              <Slider min={250} max={10000} step={250} value={[max]} onValueChange={(v) => setMax(v[0] ?? 10000)} />
            </div>
          </aside>
          <div>
            <p className="mb-4 text-sm text-muted-foreground">{list.length} piezas certificadas</p>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <PieceCard key={p.id} piece={p} action={
                  <div className="flex w-full flex-col gap-1.5">
                    <Button size="sm" className="w-full" onClick={() => toast.success("Checkout rápido completado", { description: `${toUsdc(p.priceMxn)} USDC enviados a ${p.artisan}` })}>
                      <ShoppingCart /> Comprar
                    </Button>
                    <CodiButton piece={p} className="w-full" />
                  </div>
                } />
              ))}
              {list.length === 0 && <p className="text-muted-foreground">No hay piezas con estos filtros.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <SectionTitle eyebrow="Para diseñadores, moda y arquitectura" title="Patrones y Expresiones Culturales Tradicionales Registradas" sub="Usa un diseño tradicional de forma legal y ética: el consentimiento comunitario y las regalías quedan grabados en un contrato Soroban." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {patterns.map((p) => (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-float sm:flex-row">
                <img src={p.image} alt={p.name} loading="lazy" className="aspect-video w-full object-cover sm:aspect-auto sm:w-44" />
                <div className="flex flex-1 flex-col p-5">
                  <StellarBadge label={`ECT · ${p.id}`} className="self-start" />
                  <h3 className="mt-3 text-xl font-semibold">{p.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">{p.community}</p>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm">Regalía sugerida <b>{p.royalty}%</b></span>
                    <Button size="sm" onClick={() => { setLic(p); setRoyalty(p.royalty); }}><FileSignature /> Solicitar licencia</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!lic} onOpenChange={(o) => !o && setLic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Solicitud de licencia</DialogTitle>
            <DialogDescription>{lic?.name} · {lic?.community}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold">Tipo de uso</p>
              <div className="grid grid-cols-3 gap-2">
                {uses.map((u) => (
                  <button key={u} onClick={() => setUse(u)} className={cn("rounded-lg border p-2 text-xs font-medium", use === u && "border-primary bg-primary/10 text-primary")}>{u}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Regalías automáticas para la comunidad: <span className="text-primary">{royalty}%</span></p>
              <Slider min={5} max={25} step={1} value={[royalty]} onValueChange={(v) => setRoyalty(v[0] ?? 12)} />
            </div>
            <div className="rounded-lg bg-sand p-3 font-mono text-xs text-muted-foreground">
              contract.license(pattern="{lic?.id}", use="{use}", royalty_bps={royalty * 100})
            </div>
          </div>
          <DialogFooter>
            <Button onClick={sign} disabled={signing} className="w-full">
              {signing ? <Loader2 className="animate-spin" /> : <FileSignature />} Firmar contrato en Soroban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chips({ title, items, value, onChange }: { title: string; items: string[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button key={i} onClick={() => onChange(value === i ? null : i)} className={cn("rounded-full border px-3 py-1 text-xs", value === i ? "border-primary bg-primary text-primary-foreground" : "bg-background")}>{i}</button>
        ))}
      </div>
    </div>
  );
}
