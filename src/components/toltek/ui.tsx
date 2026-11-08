import { useI18n } from "@/i18n";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Info,
  KeyRound,
  Loader2,
  MapPin,
  Ruler,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { contractId, sampleHash, shortHash, toUsdc, type Piece } from "@/lib/toltek";
import { getContractExplorerUrl, getTxExplorerUrl } from "@/lib/stellar/config";
import {
  downloadPassportCertificate,
  pieceToWork,
  recordRightsEvent,
} from "@/lib/authory-service";
import {
  confirmPeyPaymentServerFn,
  createPeyCodiQrServerFn,
  createPeyPaymentLinkServerFn,
  dispatchSignedPeyWebhookServerFn,
  listPeyWebhookEventsServerFn,
  saveSpeiSettlement,
  type PeyCodiQrResponse,
  type PeyPaymentLinkResponse,
  type ProcessedPeyWebhookEvent,
} from "@/lib/pey/pey.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
              <Link to="/verificar" search={{ id: piece.id }} className="text-sm font-medium text-primary hover:underline">{t("Ver pasaporte →")}</Link>
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
  const { t } = useI18n();
  const hash = piece.stellarTxHash ?? "";
  const url = getTxExplorerUrl(hash);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-jade/30 bg-jade/10 p-3 text-sm transition-colors hover:bg-jade/15"
    >
      <img src={tlamatikMark.url} alt="" className="h-8 w-8 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-jade">{t("Inmutable ·")}{" "}{t(piece.ledgerStatus)}</span>
        <span className="block truncate font-mono text-xs text-muted-foreground">{hash || "Soroban Testnet"}</span>
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

/** Botón + modal de pago CoDi® / pey.mx conectado a api.pey.mx (/codi/qr y /payment-link/create) + Smart Contract Soroban en Stellar Testnet. */
export function CodiButton({ piece, className, primary }: { piece: Piece; className?: string; primary?: boolean }) {
  const { t, money } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"qr" | "wait" | "done">("qr");
  const [stepProgress, setStepProgress] = useState(0);
  const [loadingApi, setLoadingApi] = useState(false);
  const [codiQr, setCodiQr] = useState<PeyCodiQrResponse | null>(null);
  const [paymentLink, setPaymentLink] = useState<PeyPaymentLinkResponse | null>(null);
  const [dualReceipt, setDualReceipt] = useState<ProcessedPeyWebhookEvent | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState("");

  const certFeeMxn = piece.certFeeMxn ?? 0;
  const shippingMxn = piece.shippingMxn ?? 0;
  const totalMxn = piece.priceMxn + certFeeMxn + shippingMxn;

  const copyValue = (val: string) => {
    navigator.clipboard?.writeText(val);
    toast(t("Copiado al portapapeles"));
  };

  const loadPeySession = async (customKey?: string) => {
    setLoadingApi(true);
    try {
      const originUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://ancestral-craft-passport.lovable.app";
      const [qrRes, linkRes] = await Promise.all([
        createPeyCodiQrServerFn({
          data: {
            pieceId: piece.id,
            title: piece.title,
            amountMxn: totalMxn,
            expirationSeconds: 600,
            apiKeyOverride: customKey || apiKeyOverride || undefined,
          },
        }),
        createPeyPaymentLinkServerFn({
          data: {
            pieceId: piece.id,
            title: piece.title,
            artisan: piece.artisan,
            community: piece.community,
            amountMxn: totalMxn,
            originUrl,
            apiKeyOverride: customKey || apiKeyOverride || undefined,
          },
        }),
      ]);
      setCodiQr(qrRes);
      setPaymentLink(linkRes);
    } catch {
      toast.error(t("No se pudo conectar con pey.mx"));
    } finally {
      setLoadingApi(false);
    }
  };

  useEffect(() => {
    if (open && state === "qr") {
      void loadPeySession();
    }
  }, [open, piece.id]);

  // Escucha eventos entrantes del webhook POST /api/webhooks/pey para esta pieza
  useEffect(() => {
    if (!open || state !== "qr") return;
    const openedAtMs = Date.now() - 2000;
    const timer = window.setInterval(async () => {
      try {
        const events = await listPeyWebhookEventsServerFn({
          data: { pieceId: piece.id },
        });
        const recent = events.find(
          (e) => new Date(e.datePaidIso).getTime() >= openedAtMs,
        );
        if (recent) {
          const netArtisanMxn = recent.netArtisanMxn.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          saveSpeiSettlement({
            artisan: recent.artisan,
            piece: `${recent.pieceId} · ${recent.pieceTitle}`,
            amount: `$${netArtisanMxn} MXN`,
            date: "08 nov 2026",
            clave: recent.trackingKey,
            codiQrId: recent.codiQrId,
            peyTransactionId: recent.transactionId,
            stellarTxHash: recent.sorobanTxHash,
            webhookEventType: recent.eventType,
          });
          setDualReceipt(recent);
          setState("done");
          toast.success(t("✓ Pago confirmado por pey.mx (SPEI)"), {
            description: `Webhook ${recent.eventType} + Stellar Tx ${shortHash(recent.sorobanTxHash)}`,
          });
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [open, state, piece.id]);

  const close = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setState("qr");
        setStepProgress(0);
        setDualReceipt(null);
      }, 250);
    }
  };

  const confirm = async () => {
    setState("wait");
    setStepProgress(0);
    try {
      const numRef = codiQr?.numRef || piece.id.replace(/\D/g, "") || "512";

      // Paso 1: Confirmar recepción del pago en pey.mx (CoDi / SPEI)
      await confirmPeyPaymentServerFn({
        data: {
          paymentLinkId: paymentLink?.id,
          codiQrId: codiQr?.id,
          amountMxn: totalMxn,
          numRef,
          apiKeyOverride: apiKeyOverride || undefined,
        },
      });
      setStepProgress(1);

      // Paso 2: Procesar notificación Webhook firmada y lanzar Smart Contract Soroban en Stellar Testnet
      const webhookRes = await dispatchSignedPeyWebhookServerFn({
        data: {
          eventType: "codi.qr.payment_received",
          pieceId: piece.id,
          title: piece.title,
          artisan: piece.artisan,
          amountMxn: totalMxn,
          codiQrId: codiQr?.id,
          numRef,
          concept: codiQr?.concept,
        },
      });
      setStepProgress(2);

      // Paso 3: Persistir evento de compra acreditada en el historial del pasaporte y en liquidaciones SPEI
      const terms = `Compra acreditada vía Webhook ${webhookRes.eventType} (pey.mx) · Cobro $${totalMxn} MXN · Clave SPEI ${webhookRes.trackingKey}`;
      await recordRightsEvent({
        id: webhookRes.sorobanEventId,
        workId: piece.id,
        type: "assignment",
        actor: piece.artisan,
        recipient: "Comprador Verificado CoDi (pey.mx)",
        effectiveDate: webhookRes.datePaidIso,
        terms,
        notes: `Webhook ID: ${webhookRes.webhookId} · IDC CoDi: ${webhookRes.codiQrId} · Pey Tx: ${webhookRes.transactionId} · Clave SPEI: ${webhookRes.trackingKey} · Soroban Tx: ${webhookRes.sorobanTxHash}`,
        stellarTransactionId: webhookRes.sorobanTxHash,
        createdAt: webhookRes.datePaidIso,
      });

      const netArtisanMxn = webhookRes.netArtisanMxn.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      saveSpeiSettlement({
        artisan: piece.artisan,
        piece: `${piece.id} · ${piece.title}`,
        amount: `$${netArtisanMxn} MXN`,
        date: "08 nov 2026",
        clave: webhookRes.trackingKey,
        codiQrId: webhookRes.codiQrId,
        peyTransactionId: webhookRes.transactionId,
        stellarTxHash: webhookRes.sorobanTxHash,
        webhookEventType: webhookRes.eventType,
      });

      setStepProgress(3);
      setDualReceipt(webhookRes);
      setState("done");
      toast.success(t("✓ Compra acreditada en SPEI y Stellar Testnet"), {
        description: `CEP ${webhookRes.trackingKey} · Tx ${shortHash(webhookRes.sorobanTxHash)}`,
      });
    } catch {
      setState("qr");
      setStepProgress(0);
      toast.error(t("No se pudo verificar el pago en pey.mx"));
    }
  };

  return (
    <>
      <Button
        variant={primary ? "default" : "outline"}
        size={primary ? "default" : "sm"}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Smartphone />{" "}
        {primary ? t("Pagar con CoDi® (pey.mx)") : t("Pagar con CoDi® (0% Comisión)")}
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-h-[92vh] overflow-y-auto text-center sm:max-w-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
              <span>pey.mx CoDi® SPEI</span>
              <span>×</span>
              <span>Stellar Soroban Testnet</span>
            </div>
            <DialogTitle className="font-serif text-2xl">
              {state === "done"
                ? t("Certificado de Compra Acreditada")
                : "CoDi® · pey.mx"}
            </DialogTitle>
            <DialogDescription>
              {piece.id} · {t(piece.title)} · {money(totalMxn)}
            </DialogDescription>
          </DialogHeader>

          {state === "wait" && (
            <div className="space-y-4 rounded-xl border bg-sand/70 p-5 text-left">
              <p className="text-center font-serif text-base font-semibold">
                {t("Procesando notificación de pago y Smart Contract…")}
              </p>
              <ul className="space-y-3 text-xs sm:text-sm">
                {[
                  "1. Recibiendo evento Webhook de pago exitoso (pey.mx · codi.qr.payment_received)",
                  "2. Lanzando Smart Contract en Stellar Testnet (Soroban · record_rights_event)",
                  "3. Consolidando respuestas de cobro SPEI y hash en blockchain",
                ].map((label, idx) => (
                  <li key={label} className="flex items-start gap-2.5">
                    {stepProgress > idx ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
                    ) : stepProgress === idx ? (
                      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border" />
                    )}
                    <span
                      className={
                        stepProgress >= idx
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {t(label)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state === "done" && dualReceipt && (
            <div className="space-y-4 text-left">
              {/* Banner de éxito dual */}
              <div className="rounded-xl border border-jade/30 bg-jade/10 p-4 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-jade" />
                <p className="mt-1.5 font-serif text-lg font-semibold text-jade">
                  {t("✓ Compra Acreditada: Cobro SPEI + Smart Contract Stellar")}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {dualReceipt.pieceId} · {t(dualReceipt.pieceTitle)} ·{" "}
                  {dualReceipt.artisan}
                </p>
              </div>

              {/* Resumen del Cobro */}
              <div className="rounded-xl border bg-card p-3.5 text-xs">
                <p className="mb-2 font-semibold uppercase tracking-wider text-primary">
                  {t("Resumen del Cobro Liquidado")}
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-muted-foreground">
                  <span>{t("Obra artesanal:")}</span>
                  <span className="text-right font-mono text-foreground">
                    {money(dualReceipt.basePriceMxn)}
                  </span>
                  {dualReceipt.certFeeMxn > 0 && (
                    <>
                      <span>{t("Certificado Phygital:")}</span>
                      <span className="text-right font-mono text-foreground">
                        {money(dualReceipt.certFeeMxn)}
                      </span>
                    </>
                  )}
                  {dualReceipt.shippingMxn > 0 && (
                    <>
                      <span>{t("Envío asegurado:")}</span>
                      <span className="text-right font-mono text-foreground">
                        {money(dualReceipt.shippingMxn)}
                      </span>
                    </>
                  )}
                  <span className="border-t pt-1.5 font-semibold text-foreground">
                    {t("Total Cobrado (CoDi® 0% comisión):")}
                  </span>
                  <span className="border-t pt-1.5 text-right font-mono text-sm font-bold text-jade">
                    {money(dualReceipt.amountMxn)}
                  </span>
                  <span className="text-[11px]">
                    {t("Dispersión directa al artesano (95.2%):")}
                  </span>
                  <span className="text-right font-mono text-[11px] font-semibold text-foreground">
                    {money(dualReceipt.netArtisanMxn, 2)} (≈{" "}
                    {toUsdc(dualReceipt.basePriceMxn)} USDC)
                  </span>
                </div>
              </div>

              {/* Evento 1: Notificación Webhook pey.mx (CoDi / SPEI Banxico) */}
              <div className="rounded-xl border bg-sand/70 p-3.5 text-xs">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-semibold uppercase tracking-wider text-primary">
                    {t("1. Evento de Pago (Webhook pey.mx · SPEI)")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-jade/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-jade">
                    <ShieldCheck className="h-3 w-3" /> HMAC-SHA256
                  </span>
                </div>
                <dl className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{t("Evento:")}</dt>
                    <dd className="font-semibold text-foreground">
                      {dualReceipt.eventType}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Webhook ID:</dt>
                    <dd className="truncate">{dualReceipt.webhookId}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">IDC CoDi / Ref:</dt>
                    <dd>
                      {dualReceipt.codiQrId} · Ref {dualReceipt.numRef}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Pey Tx (ULID):</dt>
                    <dd className="flex items-center gap-1 truncate font-semibold">
                      {dualReceipt.transactionId}
                      <button
                        type="button"
                        onClick={() => copyValue(dualReceipt.transactionId)}
                        aria-label={t("Copiar")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {t("Clave de Rastreo Banxico")}:
                    </dt>
                    <dd className="flex items-center gap-1 font-semibold text-jade">
                      {dualReceipt.trackingKey}
                      <button
                        type="button"
                        onClick={() => copyValue(dualReceipt.trackingKey)}
                        aria-label={t("Copiar")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Evento 2: Smart Contract en Stellar Testnet (Soroban) */}
              <div className="rounded-xl border border-indigo/25 bg-indigo p-3.5 text-xs text-indigo-foreground">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-semibold uppercase tracking-wider text-gold">
                    {t("2. Smart Contract Stellar Testnet (Soroban)")}
                  </span>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-gold">
                    {dualReceipt.sorobanFunction}
                  </span>
                </div>
                <dl className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="opacity-70">{t("Contrato Soroban:")}</dt>
                    <dd className="flex items-center gap-1 text-gold">
                      {shortHash(dualReceipt.sorobanContractId, 6)}
                      <button
                        type="button"
                        onClick={() => copyValue(dualReceipt.sorobanContractId)}
                        aria-label={t("Copiar")}
                        className="opacity-75 hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="opacity-70">{t("Evento On-Chain:")}</dt>
                    <dd>
                      {dualReceipt.sorobanEventId} ({dualReceipt.sorobanEventType})
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-70">
                      {t("Hash de Transacción Stellar Testnet:")}
                    </dt>
                    <dd className="mt-0.5 flex items-center justify-between gap-2 break-all text-gold">
                      <span>{dualReceipt.sorobanTxHash}</span>
                      <button
                        type="button"
                        onClick={() => copyValue(dualReceipt.sorobanTxHash)}
                        aria-label={t("Copiar")}
                        className="shrink-0 opacity-75 hover:opacity-100"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt className="opacity-70">
                      {t("Hash SHA-256 de la Pieza / Pasaporte:")}
                    </dt>
                    <dd className="mt-0.5 flex items-center justify-between gap-2 break-all text-indigo-foreground/90">
                      <span>{dualReceipt.pieceSha256Hash || sampleHash}</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyValue(dualReceipt.pieceSha256Hash || sampleHash)
                        }
                        aria-label={t("Copiar")}
                        className="shrink-0 opacity-75 hover:opacity-100"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Acciones de acreditación */}
              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const workObj = {
                      ...pieceToWork(piece),
                      stellarTransactionId: dualReceipt.sorobanTxHash,
                    };
                    downloadPassportCertificate(workObj);
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("Descargar Certificado")}
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={getTxExplorerUrl(dualReceipt.sorobanTxHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Stellar Expert <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button asChild size="sm">
                    <Link
                      to="/verificar"
                      search={{ id: piece.id }}
                      onClick={() => setOpen(false)}
                    >
                      {t("Ver en verificador →")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state === "qr" && (
            <div className="space-y-4">
              <div className="mx-auto w-fit rounded-2xl border-4 border-primary/25 bg-card p-3 shadow-sm">
                {loadingApi ? (
                  <div className="grid h-[170px] w-[170px] place-items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : codiQr?.qrImage ? (
                  <img
                    src={
                      codiQr.qrImage.startsWith("data:")
                        ? codiQr.qrImage
                        : `data:image/png;base64,${codiQr.qrImage}`
                    }
                    alt={t("Código QR del pasaporte")}
                    className="h-[170px] w-[170px] rounded-md object-contain"
                  />
                ) : (
                  <QrCode
                    value={codiQr?.qrString || `${piece.id}:${totalMxn}`}
                    size={170}
                  />
                )}
              </div>

              {codiQr && (
                <div className="rounded-xl border bg-sand/70 p-3 text-left font-mono text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">IDC CoDi (Banxico):</span>
                    <span className="font-semibold text-foreground">{codiQr.id}</span>
                  </div>
                  <div className="mt-1 flex justify-between gap-2">
                    <span className="text-muted-foreground">Ref. Numérica:</span>
                    <span>{codiQr.numRef}</span>
                  </div>
                  <div className="mt-1 flex justify-between gap-2">
                    <span className="text-muted-foreground">Concepto SPEI:</span>
                    <span className="truncate">{codiQr.concept}</span>
                  </div>
                  <div className="mt-1 flex justify-between gap-2 border-t pt-1">
                    <span className="text-muted-foreground">Smart Contract:</span>
                    <a
                      href={getContractExplorerUrl(contractId)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {shortHash(contractId, 6)}
                    </a>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {t("Escanea desde cualquier app bancaria en México (Banxico)")}
              </p>

              <div className="grid gap-2">
                <Button
                  className="w-full"
                  onClick={() => void confirm()}
                  disabled={loadingApi}
                >
                  {t("Simular Confirmación de Pago CoDi")}
                </Button>
                {paymentLink && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={paymentLink.url} target="_blank" rel="noreferrer">
                      {t("Abrir Payment Link en pey.mx")}{" "}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="border-t pt-2 text-left">
                <button
                  type="button"
                  onClick={() => setShowKeyInput((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <KeyRound className="h-3 w-3" />
                  {t("Configurar Bearer API Key de pey.mx (opcional)")}
                </button>
                {showKeyInput && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="password"
                      value={apiKeyOverride}
                      onChange={(e) => setApiKeyOverride(e.target.value)}
                      placeholder="pey_live_... / Bearer token"
                      className="h-8 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => void loadPeySession(apiKeyOverride)}
                    >
                      {t("Conectar")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
