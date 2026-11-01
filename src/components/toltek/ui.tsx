import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, CheckCircle2, Info, Loader2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtMxn, toUsdc, type Piece } from "@/lib/toltek";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import tlamatikMark from "@/assets/tlamatik-mark.png.asset.json";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img src={tlamatikMark.url} alt="Sello Tlamatik" width={36} height={36} className="h-9 w-9" />
      <span className="font-serif text-2xl font-semibold tracking-wide">Tlamatik</span>
    </span>
  );
}

export function StellarBadge({ className, label = "Certificado en Stellar" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-seal px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground shadow-sm", className)}>
      <img src={tlamatikMark.url} alt="" className="h-3.5 w-3.5 rounded-full" /> {label}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, sub, center }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function PieceCard({ piece, action }: { piece: Piece; action?: React.ReactNode }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-float transition-transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-sand">
        <img src={piece.image} alt={piece.title} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <StellarBadge className="absolute left-3 top-3" />
        <span className="absolute right-3 top-3 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{piece.id}</span>
        {piece.unesco && (
          <span className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-full bg-seal px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground shadow-sm">
            <Award className="h-3.5 w-3.5 shrink-0" /> {piece.unesco}
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{piece.community}, {piece.region}</p>
        <h3 className="text-lg font-semibold leading-snug">{piece.title}</h3>
        <p className="text-sm text-muted-foreground">{piece.artisan} · {piece.technique}</p>
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1.5 font-semibold">{fmtMxn(piece.priceMxn)} <PriceBreakdown priceMxn={piece.priceMxn} /></p>
              <p className="text-xs text-muted-foreground">≈ {toUsdc(piece.priceMxn)} USDC</p>
            </div>
            {!action && (
              <Link to="/verificar" className="text-sm font-medium text-primary hover:underline">Ver pasaporte →</Link>
            )}
          </div>
          {action}
        </div>
      </div>
    </article>
  );
}

/** Deterministic pseudo-QR derived from a hex string (visual mock). */
export function QrCode({ value, size = 140, className }: { value: string; size?: number; className?: string }) {
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
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} className={cn("rounded-md bg-card fill-indigo", className)} role="img" aria-label="Código QR del pasaporte">
      {cells}
    </svg>
  );
}

const fmt2 = (n: number) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MXN";

/** Desglose transparente "Buyer Premium": 95.2% artesano / 4.8% certificado. */
export function PriceBreakdown({ priceMxn }: { priceMxn: number }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label="Ver desglose transparente del precio" className="text-muted-foreground transition-colors hover:text-primary">
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        <p className="font-semibold">Desglose transparente</p>
        <dl className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Precio Base para el Artesano (95.2%)</dt>
            <dd className="shrink-0 font-mono">{fmt2(priceMxn * 0.952)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Certificado Phygital &amp; Buyer Premium (4.8%)</dt>
            <dd className="shrink-0 font-mono">{fmt2(priceMxn * 0.048)}</dd>
          </div>
          <div className="flex items-start justify-between gap-3 border-t pt-2 font-semibold">
            <dt>Total Transparentado</dt>
            <dd className="shrink-0 font-mono">{fmt2(priceMxn)}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/** Botón + modal de pago CoDi® / pey.mx (mockup interactivo). */
export function CodiButton({ piece, className }: { piece: Piece; className?: string }) {
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
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}>
        <Smartphone /> Pagar con CoDi® (0% Comisión)
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="text-center">
          <DialogHeader className="text-center">
            <DialogTitle className="font-serif text-2xl">CoDi® · pey.mx</DialogTitle>
            <DialogDescription>{piece.title} · {fmtMxn(piece.priceMxn)}</DialogDescription>
          </DialogHeader>
          {state === "done" ? (
            <div className="rounded-xl border border-jade/30 bg-jade/10 p-6">
              <CheckCircle2 className="mx-auto h-12 w-12 text-jade" />
              <p className="mt-3 font-semibold text-jade">✓ Pago confirmado por pey.mx (SPEI)</p>
              <p className="mt-1 text-sm text-muted-foreground">Pasaporte grabado en Stellar Testnet: Hash 0x7a8f…b855</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-fit animate-pulse rounded-2xl border-4 border-primary/25 p-3">
                <QrCode value={piece.id + ":" + piece.priceMxn} size={170} />
              </div>
              <p className="text-sm text-muted-foreground">Escanea desde cualquier app bancaria en México (Banxico)</p>
              <Button className="w-full" onClick={confirm} disabled={state === "wait"}>
                {state === "wait" && <Loader2 className="animate-spin" />} Simular Confirmación de Pago CoDi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
