import { useI18n } from "@/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FilePlus2,
  Printer,
  QrCode as QrIcon,
  UserPlus,
  Users,
  Package,
  Coins,
  Download,
  Landmark,
  CheckCircle2,
  BadgeCheck,
  ExternalLink,
  Webhook,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { QrCode, StellarBadge } from "@/components/toltek/ui";
import {
  artisans as seed,
  contractId,
  pieces as seedPieces,
  sampleHash,
  type Artisan,
  type Piece,
} from "@/lib/toltek";
import { cn } from "@/lib/utils";
import { PromoterRegistration } from "@/components/toltek/PromoterRegistration";
import { profileOptions } from "@/lib/promoter-profile";
import { hashArtisanBanking } from "@/lib/artisan-banking";
import { listAllCatalogPieces } from "@/lib/authory-service";
import { getContractExplorerUrl } from "@/lib/stellar/config";
import {
  dispatchSignedPeyWebhookServerFn,
  readSpeiSettlements,
  saveSpeiSettlement,
  type SpeiSettlementItem,
} from "@/lib/pey/pey.functions";

export const Route = createFileRoute("/_authenticated/panel")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(profileOptions(context.user.id)),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Panel del Promotor Cultural — Tlamatik" },
      {
        name: "description",
        content:
          "Gestiona artesanos, obras catalogadas y kits QR de tu cooperativa.",
      },
      { property: "og:title", content: "Panel del Promotor y Cooperativa — Tlamatik" },
      {
        property: "og:description",
        content:
          "Métricas, catálogo de artesanos e impresión de Pasaportes Culturales.",
      },
    ],
  }),
  component: Panel,
});

type Tab = "registro" | "resumen" | "artesanos" | "kits" | "liquidaciones";

const seedLiquidaciones: SpeiSettlementItem[] = [
  {
    artisan: "Miriam Nava",
    piece: "TK-0512 · El Guardián del Monte: Tecuani de Acatlán",
    amount: "$1.00 MXN",
    date: "08 nov 2026",
    clave: "2026110840012000000000512",
    codiQrId: "35a13c0512",
  },
  {
    artisan: "Don Miguel Aguilar",
    piece: "TK-0042 · Alebrije Jaguar Nahual",
    amount: "$8,472.80 MXN",
    date: "07 nov 2026",
    clave: "2026110740014000009876543",
  },
  {
    artisan: "Doña Rosa Real",
    piece: "TK-0117 · Cántaro de Barro Negro",
    amount: "$3,284.40 MXN",
    date: "02 nov 2026",
    clave: "2026110240014000008765432",
  },
  {
    artisan: "Petrona Gómez",
    piece: "TK-0203 · Huipil de Telar de Cintura",
    amount: "$5,902.40 MXN",
    date: "28 oct 2026",
    clave: "2026102840014000007654321",
  },
];

function Panel() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("registro");
  const [list, setList] = useState<Artisan[]>(seed);
  const [catalogPieces, setCatalogPieces] = useState<Piece[]>(seedPieces);
  const [liquidaciones, setLiquidaciones] = useState<SpeiSettlementItem[]>(seedLiquidaciones);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    technique: "",
    location: "",
    bank: "",
    account: "",
    clabe: "",
  });
  const [adding, setAdding] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const triggerTestWebhook = async () => {
    setTestingWebhook(true);
    try {
      const tecuani = seedPieces[0]!;
      const totalMxn =
        tecuani.priceMxn +
        (tecuani.certFeeMxn ?? 0) +
        (tecuani.shippingMxn ?? 0);
      const res = await dispatchSignedPeyWebhookServerFn({
        data: {
          eventType: "codi.qr.payment_received",
          pieceId: tecuani.id,
          title: tecuani.title,
          artisan: tecuani.artisan,
          amountMxn: totalMxn,
          numRef: "0512",
        },
      });
      const netMxn = res.netArtisanMxn.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      saveSpeiSettlement({
        artisan: res.artisan,
        piece: `${res.pieceId} · ${res.pieceTitle}`,
        amount: `$${netMxn} MXN`,
        date: "08 nov 2026",
        clave: res.trackingKey,
        codiQrId: res.codiQrId,
        peyTransactionId: res.transactionId,
        stellarTxHash: res.sorobanTxHash,
        webhookEventType: res.eventType,
      });
      setLiquidaciones(readSpeiSettlements(seedLiquidaciones));
      toast.success(t("Webhook de pey.mx procesado"), {
        description: `${res.eventType} · ${res.pieceId} · CEP ${res.trackingKey}`,
      });
    } catch {
      toast.error(t("No se pudo procesar el webhook de prueba"));
    } finally {
      setTestingWebhook(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLiquidaciones(readSpeiSettlements(seedLiquidaciones));
    listAllCatalogPieces().then((all) => {
      if (active && all.length > 0) setCatalogPieces(all);
    });
    return () => {
      active = false;
    };
  }, [tab]);

  const nav = [
    { id: "registro" as const, label: "Registro del Promotor", icon: BadgeCheck },
    { id: "resumen" as const, label: "Resumen / Métricas", icon: BarChart3 },
    { id: "artesanos" as const, label: "Catálogo de Artesanos", icon: Users },
    { id: "kits" as const, label: "Kits Phygital QR", icon: QrIcon },
    { id: "liquidaciones" as const, label: "Liquidaciones SPEI", icon: Landmark },
  ];

  const add = async () => {
    if (!form.name.trim()) {
      toast.error(t("Escribe el nombre del artesano"));
      return;
    }
    setAdding(true);
    try {
      const bankingHashes = await hashArtisanBanking({
        bank: form.bank,
        account: form.account,
        clabe: form.clabe,
      });
      const initials = form.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      setList((previous) => [
        {
          name: form.name,
          technique: form.technique,
          location: form.location,
          bankingHashes,
          status: "Pendiente KYC",
          pieces: 0,
          usdc: 0,
          initials,
        },
        ...previous,
      ]);
      setOpen(false);
      setForm({
        name: "",
        technique: "",
        location: "",
        bank: "",
        account: "",
        clabe: "",
      });
      toast.success(t("Artesano agregado"), {
        description: t("Se generó su billetera Stellar custodiada."),
      });
    } catch {
      toast.error(
        t("No se pudo proteger la información bancaria. Inténtalo de nuevo."),
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="flex gap-2 overflow-x-auto rounded-xl bg-sidebar p-3 text-sidebar-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:self-start">
        <p className="hidden px-3 pb-2 pt-1 text-xs uppercase tracking-wider opacity-60 lg:block">
          Cooperativa Guelaguetza
        </p>
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
              tab === n.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "hover:bg-sidebar-accent",
            )}
          >
            <n.icon className="h-4 w-4" /> {t(n.label)}
          </button>
        ))}
        <div className="hidden h-px shrink-0 bg-sidebar-border lg:mt-2 lg:block" />
        <Link
          to="/registrar"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent lg:pt-3"
        >
          <FilePlus2 className="h-4 w-4 shrink-0" />
          {t("Registro de Obras")}
        </Link>
      </aside>

      <section className="min-w-0 space-y-6">
        {tab === "registro" && <PromoterRegistration />}
        {(tab === "resumen" || tab === "artesanos") && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Artesanos apadrinados",
                  value: String(list.length + 18),
                  icon: Users,
                },
                {
                  label: "Piezas catalogadas",
                  value: String(136 + catalogPieces.length),
                  icon: Package,
                },
                {
                  label: "Recibido para la comunidad",
                  value: "$4,850 USDC",
                  icon: Coins,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border bg-card p-5 shadow-float"
                >
                  <m.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-serif text-3xl font-semibold">{m.value}</p>
                  <p className="text-sm text-muted-foreground">{t(m.label)}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-card shadow-float">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <h2 className="text-xl font-semibold">{t("Artesanos asociados")}</h2>
                <Button size="sm" onClick={() => setOpen(true)}>
                  <UserPlus />
                  {t("Agregar Nuevo Artesano")}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-sand text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">{t("Artesano")}</th>
                      <th className="p-3">{t("Técnica")}</th>
                      <th className="p-3">{t("Ubicación")}</th>
                      <th className="p-3">{t("Piezas")}</th>
                      <th className="p-3">USDC</th>
                      <th className="p-3">{t("Estado")}</th>
                      {["Banco", "Cuenta", "CLABE interbancaria"].map((label) => (
                        <th key={label} className="p-3">
                          {t(label)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a) => (
                      <tr key={a.name} className="border-t">
                        <td className="p-3">
                          <span className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                              {a.initials}
                            </span>
                            <span className="font-medium">{a.name}</span>
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {t(a.technique)}
                        </td>
                        <td className="p-3 text-muted-foreground">{a.location}</td>
                        <td className="p-3">{a.pieces}</td>
                        <td className="p-3 font-mono">{a.usdc}</td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              a.status === "Verificada" && "bg-jade/15 text-jade",
                              a.status === "Activa" &&
                                "bg-gold/20 text-gold-foreground",
                              a.status === "Pendiente KYC" &&
                                "bg-primary/10 text-primary",
                            )}
                          >
                            {t(a.status)}
                          </span>
                        </td>
                        {(["bank", "account", "clabe"] as const).map((field) => (
                          <td
                            key={field}
                            className="p-3 font-mono text-xs text-muted-foreground"
                          >
                            <span
                              className="block max-w-32 truncate"
                              title={a.bankingHashes?.[field]}
                            >
                              {a.bankingHashes?.[field] ?? "—"}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "kits" && (
          <div className="rounded-xl border bg-card p-5 shadow-float">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{t("Kits Phygital QR")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("Etiquetas listas para adjuntar a cada pieza física del taller.")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success(
                      t("PDF de {{count}} etiquetas generado", {
                        count: catalogPieces.length,
                      }),
                    )
                  }
                >
                  <Download /> PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast(t("Enviando a impresión masiva…"));
                    setTimeout(() => window.print(), 300);
                  }}
                >
                  <Printer />
                  {t("Imprimir lote")}
                </Button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalogPieces.map((p, i) => (
                <div
                  key={p.id}
                  className="rounded-xl border-2 border-dashed border-primary/30 bg-background p-4"
                >
                  <div className="greca mb-3" />
                  <div className="flex gap-3">
                    <QrCode
                      value={`https://tlamatik.vercel.app/verificar?id=${p.id}`}
                      size={88}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {t("PASAPORTE CULTURAL ·")} {p.id}
                      </p>
                      <p className="truncate font-serif font-semibold">
                        {t(p.title)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.artisan}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.community}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StellarBadge label={t("Escanea · Verifica en Stellar")} />
                    <Link
                      to="/verificar"
                      search={{ id: p.id }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t("Abrir →")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "liquidaciones" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 shadow-float">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-jade/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-jade">
                    <Webhook className="h-3.5 w-3.5" /> Standard Webhooks (HMAC-SHA256) · Activo
                  </div>
                  <h3 className="font-serif text-lg font-semibold">
                    {t("Webhook Listener pey.mx (CoDi & Payment Links)")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Endpoint: <code className="rounded bg-card px-1.5 py-0.5 font-mono">POST /api/webhooks/pey</code> · Eventos:{" "}
                    <code className="font-mono">codi.qr.payment_received</code>,{" "}
                    <code className="font-mono">codi.pn.payment_received</code>,{" "}
                    <code className="font-mono">payment_link.payment_received</code>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={testingWebhook}
                  onClick={() => void triggerTestWebhook()}
                >
                  {testingWebhook ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Webhook className="h-4 w-4" />
                  )}
                  {t("Simular Webhook Tecuani (TK-0512)")}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-float">
              <h2 className="text-xl font-semibold">
                {t("Histórico de Liquidaciones Bancarias (SPEI)")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Comprobantes Electrónicos de Pago (CEP de Banxico) emitidos a las tarjetas de débito de los artesanos.",
                )}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {liquidaciones.map((l) => (
                  <article
                    key={l.clave}
                    className="rounded-xl border bg-background p-4"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-jade/15 px-2.5 py-1 text-xs font-semibold text-jade">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("Transferido a Tarjeta de Débito (SPEI)")}
                    </span>
                    <p className="mt-3 font-semibold">{l.artisan}</p>
                    <p className="text-xs text-muted-foreground">{l.piece}</p>
                    <p className="mt-2 font-serif text-2xl font-semibold">
                      {l.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(l.date)} · CEP Banxico
                      {l.webhookEventType ? ` · ${l.webhookEventType}` : ""}
                    </p>
                    <div className="mt-3 rounded-lg bg-sand p-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("Clave de Rastreo Banxico")}
                      </p>
                      <p className="break-all font-mono text-xs">{l.clave}</p>
                    </div>
                    <Button
                      asChild
                      variant="link"
                      size="sm"
                      className="mt-2 h-auto px-0"
                    >
                      <a
                        href={getContractExplorerUrl(contractId)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Ver auditoría en Stellar Explorer ↗")}{" "}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (adding) return;
          setOpen(value);
          if (!value)
            setForm({
              name: "",
              technique: "",
              location: "",
              bank: "",
              account: "",
              clabe: "",
            });
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{t("Nuevo artesano")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(
              ["name", "technique", "location", "bank", "account", "clabe"] as const
            ).map((k) => (
              <div key={k} className="space-y-1">
                <Label htmlFor={`artisan-${k}`}>
                  {t(
                    {
                      name: "Nombre completo",
                      technique: "Técnica",
                      location: "Comunidad / Estado",
                      bank: "Banco",
                      account: "Cuenta",
                      clabe: "CLABE interbancaria",
                    }[k],
                  )}
                </Label>
                <Input
                  id={`artisan-${k}`}
                  autoComplete="off"
                  inputMode={
                    k === "account" || k === "clabe" ? "numeric" : "text"
                  }
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button disabled={adding} onClick={() => void add()}>
              {adding ? t("Enviando…") : t("Agregar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
