import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Copy, ExternalLink, Gift, MapPin, Play, ShoppingBag, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode, StellarBadge } from "@/components/toltek/ui";
import { contractId, fmtMxn, images, sampleHash, toUsdc } from "@/lib/toltek";

export const Route = createFileRoute("/verificar")({
  head: () => ({
    meta: [
      { title: "Verificador Público — Toltek" },
      { name: "description", content: "Escanea el QR de una pieza y confirma su autenticidad en el ledger de Stellar." },
      { property: "og:title", content: "Verificador Público Universal — Toltek" },
      { property: "og:description", content: "Pieza auténtica y certificada: consulta su historia y registro blockchain." },
    ],
  }),
  component: Verify,
});

const gallery = [
  { src: images.alebrije, label: "Pieza terminada" },
  { src: images.hero, label: "Tallado en copal", video: true },
  { src: images.olinala, label: "Pigmentos naturales" },
];

function Verify() {
  const [active, setActive] = useState(0);
  const cur = gallery[active]!;
  const [audit, setAudit] = useState(true);
  const [tip, setTip] = useState(false);
  const price = 8900;
  const ts = "2026-03-14 17:42:09 UTC";

  const copy = (v: string) => {
    navigator.clipboard?.writeText(v);
    toast("Copiado al portapapeles");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-jade/30 bg-jade/10 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-jade text-jade-foreground"><BadgeCheck className="h-8 w-8" /></span>
          <div>
            <p className="font-serif text-2xl font-semibold text-jade md:text-3xl">✓ PIEZA AUTÉNTICA & CERTIFICADA</p>
            <p className="text-sm text-muted-foreground">Pasaporte TK-0042 · escaneado hace unos segundos</p>
          </div>
        </div>
        <StellarBadge label="Registrado en Ledger de Stellar / Soroban Testnet" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-sand shadow-float">
            <img src={cur.src} alt={cur.label} className="aspect-square w-full object-cover md:aspect-[4/3]" />
            {cur.video && (
              <button onClick={() => toast("Reproduciendo video del proceso (demo)")} className="absolute inset-0 grid place-items-center bg-indigo/30">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-card/90 text-primary"><Play className="h-7 w-7" /></span>
              </button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {gallery.map((g, i) => (
              <button key={g.label} onClick={() => setActive(i)} className={`overflow-hidden rounded-lg border-2 text-left ${i === active ? "border-primary" : "border-transparent"}`}>
                <img src={g.src} alt={g.label} loading="lazy" className="aspect-video w-full object-cover" />
                <p className="truncate px-1 py-1 text-xs text-muted-foreground">{g.video ? "▶ " : ""}{g.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Talla en madera de copal</p>
            <h1 className="mt-2 text-4xl font-semibold">Alebrije Jaguar Nahual</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 font-serif font-semibold text-primary">MA</span>
              <div>
                <p className="font-semibold">Maestro Don Miguel Aguilar</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Taller Familiar Aguilar · San Antonio Arrazola, Oaxaca, México</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-float">
            <p className="text-2xl font-semibold">{fmtMxn(price)}</p>
            <p className="text-sm text-muted-foreground">≈ {toUsdc(price)} USDC · 92% llega directo al taller</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button onClick={() => toast.success("Pago simulado enviado", { description: `${toUsdc(price)} USDC → GBTK…AGUI` })}><ShoppingBag /> Comprar en USDC / MXN</Button>
              <Button variant="outline" onClick={() => setTip(true)}><Gift /> Propina / Mecenazgo</Button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">La Memoria del Oficio</h2>
            <Accordion type="single" collapsible defaultValue="tecnica" className="mt-2">
              <AccordionItem value="tecnica">
                <AccordionTrigger>Técnica ancestral heredada</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">Don Miguel aprendió de su padre a tallar el copal verde con machete y cuchillo, siguiendo la veta para que la madera “diga” qué animal guarda. Tres generaciones del taller han perfeccionado el oficio iniciado en Arrazola por Manuel Jiménez.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="materiales">
                <AccordionTrigger>Materiales autóctonos</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">Madera de copal (Bursera glabrifolia) de reforestación comunitaria, grana cochinilla, añil, cempasúchil y jugo de limón para fijar los pigmentos.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="simbolos">
                <AccordionTrigger>Simbología cultural</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">El jaguar es tona o nahual protector en la cosmovisión zapoteca. Los puntos representan semillas de maíz; las flores, la fertilidad de la tierra.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl bg-indigo text-indigo-foreground shadow-float">
        <button onClick={() => setAudit(!audit)} className="flex w-full items-center justify-between p-5 text-left">
          <span className="font-serif text-xl font-semibold">Panel Técnico de Auditoría Blockchain</span>
          <ChevronDown className={`transition-transform ${audit ? "rotate-180" : ""}`} />
        </button>
        {audit && (
          <div className="grid gap-6 border-t border-indigo-foreground/10 p-5 md:grid-cols-[1fr_auto]">
            <dl className="space-y-4 text-sm">
              {[
                ["Hash SHA-256 del expediente", sampleHash],
                ["Smart Contract (Soroban)", contractId],
                ["Timestamp inmutable", ts],
                ["Ledger", "#52,184,907 · Testnet"],
              ] as [string, string][]).map(([k, v]) => (

              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wider opacity-60">{k}</dt>
                  <dd className="mt-1 flex items-start gap-2 break-all font-mono text-gold">
                    {v}
                    <button onClick={() => copy(v)} aria-label="Copiar" className="shrink-0 opacity-60 hover:opacity-100"><Copy className="h-4 w-4" /></button>
                  </dd>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => toast.success("Hash SHA-256 verificado en ledger")}>Re-verificar hash</Button>
                <Button size="sm" variant="secondary" onClick={() => toast("Abriendo Stellar Expert (simulado)")}><ExternalLink /> Ver en Stellar Expert</Button>
              </div>
            </dl>
            <div className="rounded-xl bg-card p-3"><QrCode value={sampleHash} size={150} /></div>
          </div>
        )}
      </div>

      <Dialog open={tip} onOpenChange={setTip}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Apoyo directo al Maestro Aguilar</DialogTitle>
            <DialogDescription>El 100% de la propina llega a su billetera Stellar.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 25].map((a) => (
              <Button key={a} variant="outline" onClick={() => { setTip(false); toast.success(`Propina de ${a} USDC enviada`, { description: "Gracias por sostener el oficio." }); }}>{a} USDC</Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
