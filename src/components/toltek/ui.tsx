import { useI18n } from "@/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, CheckCircle2, CreditCard, ExternalLink, Info, Loader2, MapPin, Ruler, Smartphone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toUsdc, type Piece } from "@/lib/toltek";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import tlamatikMark from "@/assets/tlamatik-mark.png.asset.json";

export function Logo({ className }: { className?: string }) {
  const { t, money } = useI18n();
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img src={tlamatikMark.url} alt={t("Sello Tlamatik")} width={36} height={36} className="h-9 w-9" />
      <span className="font-serif text-2xl font-semibold tracking-wide">Tlamatik</span>
    </span>
  );
}

export function StellarBadge({ className, label = "Certificado en Stellar" }: { className?: string; label?: string }) {
  const { t, money } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-seal px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground shadow-sm", className)}>
      <img src={tlamatikMark.url} alt="" className="h-3.5 w-3.5 rounded-full" /> {t(label)}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, sub, center }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  const { t, money } = useI18n();
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t(eyebrow)}</p>}
      <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{t(title)}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{t(sub)}</p>}
    </div>
  );
}

export function PieceCard({ piece, action }: { piece: Piece; action?: React.ReactNode }) {
  const { t, money } = useI18n();
  const [open, setOpen] = useState(false);
  const clickable = !!piece.featured;
  return (
    <>
    <article
      onClick={clickable ? (e) => { if (!(e.target as HTMLElement).closest("button,a")) setOpen(true); } : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" && e.target === e.currentTarget) setOpen(true); } : undefined}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? t("Abrir pasaporte de {{title}}", { title: t(piece.title) }) : undefined}
      className={cn("group overflow-hidden rounded-xl border bg-card shadow-float transition-transform hover:-translate-y-1", clickable && "cursor-pointer ring-2 ring-gold/60")}>
      <div className="relative aspect-square overflow-hidden bg-sand">
        <img src={piece.image} alt={t(piece.title)} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <StellarBadge className="absolute left-3 top-3" />
        {piece.badge && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-indigo px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-foreground shadow-sm">
            <Sparkles className="h-3 w-3" /> {piece.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{piece.id}</span>
        {piece.unesco && (
          <span className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-full bg-seal px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground shadow-sm">
            <Award className="h-3.5 w-3.5 shrink-0" /> {t(piece.unesco)}
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{piece.community}, {piece.region}</p>
        <h3 className="text-lg font-semibold leading-snug">{t(piece.title)}</h3>
        <p className="text-sm text-muted-foreground">{piece.artisan} · {t(piece.technique)}</p>
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1.5 font-semibold">{money(piece.priceMxn)} <PriceBreakdown priceMxn={piece.priceMxn} /></p>
              <p className="text-xs text-muted-foreground">≈ {toUsdc(piece.priceMxn)} USDC</p>
            </div>
            {!action && (clickable ? (
              <button onClick={() => setOpen(true)} className="text-sm font-medium text-primary hover:underline">{t("Ver pasaporte →")}</button>
            ) : (
              <Link to="/verificar" className="text-sm font-medium text-primary hover:underline">{t("Ver pasaporte →")}</Link>
            ))}
          </div>
          {action}
        </div>
      </div>
    </article>
    {clickable && <PassportModal piece={piece} open={open} onOpenChange={setOpen} />}
    </>
  );
}

/** Desglose de compra completo: obra + certificado + envío. */
export function FullBreakdown({ piece }: { piece: Piece }) {
  const { t, money } = useI18n();
  const cert = piece.certFeeMxn ?? 0;
  const ship = piece.shippingMxn ?? 0;
  const rows: [string, number][] = [["Obra", piece.priceMxn], ["Certificado Phygital", cert], ["Envío", ship]];
  return (
    <dl className="space-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{t(k)}</dt><dd className="font-mono">{money(v)}</dd></div>
      ))}
      <div className="flex justify-between gap-3 border-t pt-2 font-semibold"><dt>{t("Total")}</dt><dd className="font-mono">{money(piece.priceMxn + cert + ship)}</dd></div>
      {piece.priceUsd && <p className="text-xs text-muted-foreground">{t("Precio internacional de la obra: USD $")}{" "}{piece.priceUsd}</p>}
    </dl>
  );
}

export function LedgerBadge({ piece }: { piece: Piece }) {
  const { t, money } = useI18n();
  const hash = piece.stellarTxHash ?? "";
  return (
    <a
      href={`#soroban-explorer/tx/${hash}`}
      onClick={(e) => { e.preventDefault(); toast(t("Abriendo Soroban Explorer (simulado)"), { description: `tx ${hash.slice(0, 10)}…${hash.slice(-6)}` }); }}
      className="flex items-center gap-3 rounded-xl border border-jade/30 bg-jade/10 p-3 text-sm transition-colors hover:bg-jade/15"
    >
      <img src={tlamatikMark.url} alt="" className="h-8 w-8 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-jade">{t("Inmutable ·")}{" "}{t(piece.ledgerStatus)}</span>
        <span className="block truncate font-mono text-xs text-muted-foreground">{hash}</span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-jade" />
    </a>
  );
}

export function StripeButton({ piece, className }: { piece: Piece; className?: string }) {
  const { t, money } = useI18n();
  return (
    <Button variant="outline" className={className} onClick={() => toast.success(t("Checkout de Stripe simulado"), { description: `USD $${piece.priceUsd ?? toUsdc(piece.priceMxn)} · ${piece.title}` })}>
      <CreditCard />{t("Buy in USD (Stripe)")}</Button>
  );
}

/** Modal de Pasaporte para piezas destacadas. */
export function PassportModal({ piece, open, onOpenChange }: { piece: Piece; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, money } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        <div className="grid md:grid-cols-2">
          <div className="bg-sand">
            <img src={piece.image} alt={t(piece.title)} className="h-full max-h-[70vh] w-full object-contain md:max-h-none md:object-cover" />
          </div>
          <div className="space-y-4 p-6">
            <DialogHeader className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t(piece.category)}</p>
              <DialogTitle className="font-serif text-2xl leading-tight">{t(piece.title)}</DialogTitle>
              <DialogDescription className="flex items-start gap-1"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {piece.artisan} · {piece.location}</DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(piece.story)}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-semibold text-foreground">{t("Técnica:")}</span> {t(piece.techniqueDetail)}</p>
              <p className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {piece.dimensions}{" "}{t("· Pasaporte")}{" "}{piece.id}</p>
            </div>
            <div className="rounded-xl border bg-card p-4"><FullBreakdown piece={piece} /></div>
            <div className="grid gap-2">
              <CodiButton piece={piece} primary className="w-full" />
              <StripeButton piece={piece} className="w-full" />
            </div>
            <LedgerBadge piece={piece} />
            <Link to="/verificar" search={{ id: piece.id }} className="block text-center text-sm font-medium text-primary hover:underline">{t("Abrir verificador público →")}</Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Deterministic pseudo-QR derived from a hex string (visual mock). */
export function QrCode({ value, size = 140, className }: { value: string; size?: number; className?: string }) {
  const { t, money } = useI18n();
  const n = 25;
  const hex = (value || "0").padEnd(64, "0");
  const bits: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    const c = parseInt(hex[(i * 7) % hex.length] ?? "0", 16);
    bits.push(((c >> (i % 4)) & 1) === 1);
  }
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]] as [number, number][]) {
      if (x >= fx && x < fx + 7 && y >= fy && y < fy + 7) {
        const dx = x - fx, dy = y - fy;
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
      if (x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7) return 0;
    }
    return -1;
  };
  const cells = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const f = finder(x, y);
      const on = f === -1 ? bits[y * n + x] : f === 1;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} className={cn("rounded-md bg-card fill-indigo", className)} role="img" aria-label={t("Código QR del pasaporte")}>
      {cells}
    </svg>
  );
}



/** Desglose transparente "Buyer Premium": 95.2% artesano / 4.8% certificado. */
export function PriceBreakdown({ priceMxn }: { priceMxn: number }) {
  const { t, money } = useI18n();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label={t("Ver desglose transparente del precio")} className="text-muted-foreground transition-colors hover:text-primary">
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        <p className="font-semibold">{t("Desglose transparente")}</p>
        <dl className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">{t("Precio Base para el Artesano (95.2%)")}</dt>
            <dd className="shrink-0 font-mono">{money(priceMxn * 0.952, 2)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">{t("Certificado Phygital & Buyer Premium (4.8%)")}</dt>
            <dd className="shrink-0 font-mono">{money(priceMxn * 0.048, 2)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3 border-t pt-2 font-semibold">
            <dt>{t("Total Transparentado")}</dt>
            <dd className="shrink-0 font-mono">{money(priceMxn, 2)}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/** Botón + modal de pago CoDi® / pey.mx (mockup interactivo). */
export function CodiButton({ piece, className, primary }: { piece: Piece; className?: string; primary?: boolean }) {
  const { t, money } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"qr" | "wait" | "done">("qr");
  const close = (o: boolean) => {
    setOpen(o);
    if (!o) setTimeout(() => setState("qr"), 250);
  };
  const confirm = () => {
    setState("wait");
    setTimeout(() => setState("done"), 1500);
  };
  return (
    <>
      <Button variant={primary ? "default" : "outline"} size={primary ? "default" : "sm"} className={className} onClick={() => setOpen(true)}>
        <Smartphone /> {primary ? t("Pagar con CoDi® (pey.mx)") : t("Pagar con CoDi® (0% Comisión)")}
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="text-center">
          <DialogHeader className="text-center">
            <DialogTitle className="font-serif text-2xl">CoDi® · pey.mx</DialogTitle>
            <DialogDescription>{t(piece.title)} · {money(piece.priceMxn + (piece.certFeeMxn ?? 0) + (piece.shippingMxn ?? 0))}</DialogDescription>
          </DialogHeader>
          {state === "done" ? (
            <div className="rounded-xl border border-jade/30 bg-jade/10 p-6">
              <CheckCircle2 className="mx-auto h-12 w-12 text-jade" />
              <p className="mt-3 font-semibold text-jade">{t("✓ Pago confirmado por pey.mx (SPEI)")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("Pasaporte grabado en Stellar Testnet: Hash")}{" "}{piece.stellarTxHash ? `${piece.stellarTxHash.slice(0, 6)}…${piece.stellarTxHash.slice(-4)}` : "0x7a8f…b855"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-fit animate-pulse rounded-2xl border-4 border-primary/25 p-3">
                <QrCode value={piece.id + ":" + piece.priceMxn} size={170} />
              </div>
              <p className="text-sm text-muted-foreground">{t("Escanea desde cualquier app bancaria en México (Banxico)")}</p>
              <Button className="w-full" onClick={confirm} disabled={state === "wait"}>
                {state === "wait" && <Loader2 className="animate-spin" />}{" "}{t("Simular Confirmación de Pago CoDi")}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
