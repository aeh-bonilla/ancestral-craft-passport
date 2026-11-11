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
  BookOpen,
  Pencil,
  Lock,
  Anchor,
  Search,
  ShieldCheck,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { QrCode, StellarBadge } from "@/components/toltek/ui";
import {
  artisans as seed,
  contractId,
  pieces as seedPieces,
  sampleHash,
  toUsdc,
  type Artisan,
  type Piece,
} from "@/lib/toltek";
import { cn } from "@/lib/utils";
import { PromoterRegistration } from "@/components/toltek/PromoterRegistration";
import { useAccount } from "@/components/toltek/AuthProvider";
import { profileOptions } from "@/lib/promoter-profile";
import { hashArtisanBanking } from "@/lib/artisan-banking";
import {
  listAllCatalogPieces,
  listAllRegisteredWorks,
  saveWorkAndInitialEvents,
  updateUnanchoredWork,
  type RegisteredWorkSummary,
} from "@/lib/authory-service";
import { computeDossierSha256 } from "@/lib/stellar/client-crypto";
import { registerWorkServerFn } from "@/lib/stellar/soroban.functions";
import { getContractExplorerUrl, getTxExplorerUrl } from "@/lib/stellar/config";
import {
  dispatchSignedPeyWebhookServerFn,
  readSpeiSettlements,
  saveSpeiSettlement,
  type SpeiSettlementItem,
} from "@/lib/pey/pey.functions";

export const Route = createFileRoute("/_authenticated/panel")({
  ssr: false,
  loader: ({ context }) => {
    if (!context?.user?.id) return null;
    return context.queryClient
      .ensureQueryData(profileOptions(context.user.id))
      .catch(() => null);
  },
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

type Tab =
  | "registro"
  | "obras"
  | "resumen"
  | "artesanos"
  | "kits"
  | "liquidaciones";

type WorkFilter = "all" | "editable" | "anchored" | "sold";

const REGION_OPTIONS: Piece["region"][] = [
  "Oaxaca",
  "Chiapas",
  "Jalisco",
  "Michoacán",
  "Guerrero",
  "Puebla",
];

const TECHNIQUE_OPTIONS: Piece["technique"][] = [
  "Textil",
  "Cerámica",
  "Talla en Madera",
  "Filigrana",
  "Laca",
];

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
  const { t, money } = useI18n();
  const { user } = useAccount();
  const [tab, setTab] = useState<Tab>("registro");
  const [list, setList] = useState<Artisan[]>(seed);
  const [catalogPieces, setCatalogPieces] = useState<Piece[]>(seedPieces);
  const [registeredWorks, setRegisteredWorks] = useState<RegisteredWorkSummary[]>([]);
  const [workFilter, setWorkFilter] = useState<WorkFilter>("all");
  const [workSearch, setWorkSearch] = useState("");
  const [editingWork, setEditingWork] = useState<RegisteredWorkSummary | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    artisan: "",
    promoterName: "",
    community: "",
    region: "Oaxaca" as Piece["region"],
    technique: "Talla en Madera" as Piece["technique"],
    materials: "",
    dimensions: "",
    priceMxn: "",
    description: "",
  });
  const [savingWork, setSavingWork] = useState(false);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
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

  const refreshWorks = async () => {
    const [catalog, registered] = await Promise.all([
      listAllCatalogPieces(),
      listAllRegisteredWorks(),
    ]);
    if (catalog.length > 0) setCatalogPieces(catalog);
    setRegisteredWorks(registered);
  };

  useEffect(() => {
    let active = true;
    setLiquidaciones(readSpeiSettlements(seedLiquidaciones));
    Promise.all([listAllCatalogPieces(), listAllRegisteredWorks()]).then(
      ([allCatalog, allRegistered]) => {
        if (!active) return;
        if (allCatalog.length > 0) setCatalogPieces(allCatalog);
        setRegisteredWorks(allRegistered);
      },
    );
    return () => {
      active = false;
    };
  }, [tab]);

  const openEditWork = (item: RegisteredWorkSummary) => {
    if (item.anchoredOnChain) {
      toast.error(t("Obra inmutable en blockchain"), {
        description: t(
          "Esta pieza ya fue anclada en Stellar Soroban y no puede modificarse.",
        ),
      });
      return;
    }
    setEditingWork(item);
    setEditForm({
      title: item.work.title,
      artisan: item.work.artisan,
      promoterName:
        item.work.promoterName || user?.displayName || user?.username || "",
      community: item.work.community,
      region: item.work.region,
      technique: item.work.technique,
      materials: item.work.materials,
      dimensions: item.work.dimensions ?? "",
      priceMxn: String(item.work.priceMxn || ""),
      description: item.work.description,
    });
  };

  const saveWorkEdits = async () => {
    if (!editingWork) return;
    if (!editForm.title.trim() || !editForm.artisan.trim()) {
      toast.error(t("Completa al menos el título y el artesano de la obra"));
      return;
    }
    setSavingWork(true);
    try {
      const updatedHash = await computeDossierSha256(
        {
          title: editForm.title.trim(),
          artisan: editForm.artisan.trim(),
          category: editForm.technique,
          technique: editForm.description.trim(),
          materials: editForm.materials.trim(),
          priceMxn: editForm.priceMxn.trim(),
        },
        [],
      );
      await updateUnanchoredWork(editingWork.work.id, {
        title: editForm.title,
        artisan: editForm.artisan,
        promoterName: editForm.promoterName,
        community: editForm.community,
        region: editForm.region,
        technique: editForm.technique,
        materials: editForm.materials,
        dimensions: editForm.dimensions,
        priceMxn: Number(editForm.priceMxn) || editingWork.work.priceMxn,
        description: editForm.description,
        hash: updatedHash,
      });
      await refreshWorks();
      setEditingWork(null);
      toast.success(t("Obra actualizada correctamente"));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? t(err.message)
          : t("No se pudo actualizar la obra"),
      );
    } finally {
      setSavingWork(false);
    }
  };

  const anchorWorkNow = async (item: RegisteredWorkSummary) => {
    if (item.anchoredOnChain) return;
    setAnchoringId(item.work.id);
    try {
      const sorobanRes = await registerWorkServerFn({
        data: {
          workId: item.work.id,
          hash: item.work.hash,
          author: item.work.artisan || item.work.author,
        },
      });
      await saveWorkAndInitialEvents({
        ...item.work,
        status: "verified",
        stellarTransactionId: sorobanRes.txHash,
        registeredAt: sorobanRes.timestampIso || new Date().toISOString(),
      });
      await refreshWorks();
      toast.success(t("Obra anclada en Stellar Soroban"), {
        description: `${item.work.id} · Tx ${sorobanRes.txHash.slice(0, 10)}…`,
      });
    } catch {
      toast.error(t("No se pudo completar el anclaje en Stellar Testnet"));
    } finally {
      setAnchoringId(null);
    }
  };

  const nav = [
    { id: "registro" as const, label: "Registro del Promotor", icon: BadgeCheck },
    { id: "obras" as const, label: "Obras Registradas", icon: BookOpen },
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
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="flex gap-2 overflow-x-auto rounded-xl bg-sidebar p-3 text-sidebar-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:self-start">
        <p className="hidden px-3 pb-2 pt-1 text-xs uppercase tracking-wider opacity-60 lg:block">
          Cooperativa Guelaguetza
        </p>
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={cn(
              "flex shrink-0 items-center justify-start gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full",
              tab === n.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "hover:bg-sidebar-accent",
            )}
          >
            <n.icon className="h-4 w-4 shrink-0" />
            <span>{t(n.label)}</span>
          </button>
        ))}
        <div className="hidden h-px shrink-0 bg-sidebar-border lg:mt-2 lg:block" />
        <Link
          to="/registrar"
          className="flex shrink-0 items-center justify-start gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-sidebar-accent lg:w-full lg:pt-3"
        >
          <FilePlus2 className="h-4 w-4 shrink-0" />
          <span>{t("Registro de Obras")}</span>
        </Link>
      </aside>

      <section className="min-w-0 space-y-6">
        {tab === "registro" && <PromoterRegistration />}
        {tab === "obras" && (() => {
          const totalCount = registeredWorks.length;
          const editableCount = registeredWorks.filter((w) => !w.anchoredOnChain).length;
          const anchoredCount = registeredWorks.filter((w) => w.anchoredOnChain).length;
          const commercialCount = registeredWorks.filter(
            (w) => w.saleStatus === "sold" || w.saleStatus === "licensed",
          ).length;

          const q = workSearch.trim().toLowerCase();
          const filteredWorks = registeredWorks.filter((item) => {
            if (workFilter === "editable" && item.anchoredOnChain) return false;
            if (workFilter === "anchored" && !item.anchoredOnChain) return false;
            if (
              workFilter === "sold" &&
              item.saleStatus !== "sold" &&
              item.saleStatus !== "licensed"
            ) {
              return false;
            }
            if (!q) return true;
            return (
              item.work.id.toLowerCase().includes(q) ||
              item.work.title.toLowerCase().includes(q) ||
              item.work.artisan.toLowerCase().includes(q) ||
              item.work.community.toLowerCase().includes(q) ||
              item.work.region.toLowerCase().includes(q) ||
              item.work.technique.toLowerCase().includes(q)
            );
          });

          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Obras registradas",
                    value: String(totalCount),
                    icon: BookOpen,
                    tone: "text-primary",
                  },
                  {
                    label: "Pendientes de anclaje (Editables)",
                    value: String(editableCount),
                    icon: Clock,
                    tone: "text-amber-700",
                  },
                  {
                    label: "Ancladas en Stellar Soroban",
                    value: String(anchoredCount),
                    icon: ShieldCheck,
                    tone: "text-jade",
                  },
                  {
                    label: "Vendidas o licenciadas",
                    value: String(commercialCount),
                    icon: ShoppingBag,
                    tone: "text-indigo",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border bg-card p-5 shadow-float"
                  >
                    <stat.icon className={cn("h-5 w-5", stat.tone)} />
                    <p className="mt-3 font-serif text-3xl font-semibold">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(stat.label)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-float">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t("Catálogo de Obras Registradas")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(
                        "Consulta el estado de registro, anclaje en Stellar Soroban y venta. Las piezas sin anclar pueden editarse antes de quedar inmutables en blockchain.",
                      )}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/registrar">
                      <FilePlus2 />
                      {t("Registrar nueva obra")}
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: "all", label: "Todas" },
                        { id: "editable", label: "Sin anclar (Editables)" },
                        { id: "anchored", label: "Ancladas en Blockchain" },
                        { id: "sold", label: "Vendidas / Licenciadas" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setWorkFilter(f.id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          workFilter === f.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background hover:bg-sand",
                        )}
                      >
                        {t(f.label)}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={workSearch}
                      onChange={(e) => setWorkSearch(e.target.value)}
                      placeholder={t("Buscar por ID, título o artesano…")}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {filteredWorks.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-sand/40 p-10 text-center">
                      <p className="font-medium">
                        {t("No hay obras que coincidan con el filtro seleccionado")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("Prueba otro filtro o registra una nueva pieza en la plataforma.")}
                      </p>
                    </div>
                  ) : (
                    filteredWorks.map((item) => {
                      const w = item.work;
                      const isAnchoring = anchoringId === w.id;
                      const saleMeta = {
                        draft: {
                          label: "En preparación (No publicada)",
                          className:
                            "border-amber-500/30 bg-amber-500/10 text-amber-800",
                        },
                        available: {
                          label: "Disponible en Mercado Ético",
                          className: "border-primary/25 bg-primary/10 text-primary",
                        },
                        licensed: {
                          label: "Licenciada B2B",
                          className: "border-indigo/30 bg-indigo/10 text-indigo",
                        },
                        sold: {
                          label: "Vendida · Liquidada SPEI",
                          className: "border-jade/30 bg-jade/15 text-jade",
                        },
                      }[item.saleStatus];

                      return (
                        <article
                          key={w.id}
                          className="rounded-xl border bg-background p-4 transition-shadow hover:shadow-sm sm:p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-4">
                              <img
                                src={item.image}
                                alt={w.title}
                                className="h-24 w-24 shrink-0 rounded-xl border object-cover"
                              />
                              <div className="min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-sand px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                                    {w.id}
                                  </span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                                      item.anchoredOnChain
                                        ? "border-jade/30 bg-jade/15 text-jade"
                                        : "border-amber-500/30 bg-amber-500/10 text-amber-800",
                                    )}
                                  >
                                    {item.anchoredOnChain ? (
                                      <>
                                        <ShieldCheck className="h-3 w-3" />
                                        {t("Anclada en Blockchain")}
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3 w-3" />
                                        {t("Registrada · Sin anclar en blockchain")}
                                      </>
                                    )}
                                  </span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                                      saleMeta.className,
                                    )}
                                  >
                                    {t(saleMeta.label)}
                                  </span>
                                </div>

                                <h3 className="font-serif text-lg font-semibold leading-snug">
                                  {w.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  <strong className="font-medium text-foreground">
                                    {w.artisan}
                                  </strong>{" "}
                                  · {w.community}, {t(w.region)} · {t(w.technique)}
                                </p>
                                {w.promoterName && (
                                  <p className="text-xs text-muted-foreground">
                                    {t("Promotor responsable")}:{" "}
                                    <span className="font-medium text-foreground">
                                      {w.promoterName}
                                    </span>
                                  </p>
                                )}
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                  {w.materials ? `${t("Materiales")}: ${w.materials}` : w.description}
                                  {w.dimensions ? ` · ${w.dimensions}` : ""}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">
                                    {money(w.priceMxn)} ({toUsdc(w.priceMxn)} USDC)
                                  </span>
                                  <span className="font-mono">
                                    SHA-256: {w.hash.slice(0, 12)}…{w.hash.slice(-6)}
                                  </span>
                                  {item.anchoredOnChain && w.stellarTransactionId && (
                                    <a
                                      href={getTxExplorerUrl(w.stellarTransactionId)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                                    >
                                      Tx {w.stellarTransactionId.slice(0, 8)}…
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  {item.settlementTrackingKey && (
                                    <span className="font-mono text-jade">
                                      CEP {item.settlementTrackingKey}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                              {!item.anchoredOnChain ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditWork(item)}
                                    disabled={isAnchoring}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    {t("Editar información")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => void anchorWorkNow(item)}
                                    disabled={isAnchoring}
                                  >
                                    {isAnchoring ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        {t("Anclando…")}
                                      </>
                                    ) : (
                                      <>
                                        <Anchor className="h-3.5 w-3.5" />
                                        {t("Anclar en Blockchain")}
                                      </>
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span
                                    title={t(
                                      "Esta pieza ya fue anclada en Stellar Soroban y es inmutable.",
                                    )}
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-sand/70 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                                  >
                                    <Lock className="h-3.5 w-3.5" />
                                    {t("Edición bloqueada (Inmutable)")}
                                  </span>
                                  <Button asChild size="sm" variant="outline">
                                    <Link to="/verificar" search={{ id: w.id }}>
                                      {t("Ver pasaporte →")}
                                    </Link>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })()}
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

      <Dialog
        open={Boolean(editingWork)}
        onOpenChange={(isOpen) => {
          if (savingWork) return;
          if (!isOpen) setEditingWork(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {t("Editar información de la obra")} · {editingWork?.work.id}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Esta obra aún no ha sido anclada en Stellar Soroban. Al guardar los cambios se recalculará su huella SHA-256.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-work-title">{t("Título de la obra *")}</Label>
              <Input
                id="edit-work-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-artisan">{t("Maestro Artesano *")}</Label>
              <Input
                id="edit-work-artisan"
                value={editForm.artisan}
                onChange={(e) =>
                  setEditForm({ ...editForm, artisan: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-promoter">
                {t("Promotor responsable")}
              </Label>
              <Input
                id="edit-work-promoter"
                value={editForm.promoterName}
                onChange={(e) =>
                  setEditForm({ ...editForm, promoterName: e.target.value })
                }
                placeholder={t("Ej. Alain Bonilla · Cooperativa Guelaguetza")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-community">{t("Comunidad")}</Label>
              <Input
                id="edit-work-community"
                value={editForm.community}
                onChange={(e) =>
                  setEditForm({ ...editForm, community: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-region">{t("Región")}</Label>
              <select
                id="edit-work-region"
                value={editForm.region}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    region: e.target.value as Piece["region"],
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {t(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-technique">{t("Técnica")}</Label>
              <select
                id="edit-work-technique"
                value={editForm.technique}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    technique: e.target.value as Piece["technique"],
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {TECHNIQUE_OPTIONS.map((tech) => (
                  <option key={tech} value={tech}>
                    {t(tech)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-price">{t("Precio (MXN)")}</Label>
              <Input
                id="edit-work-price"
                type="number"
                min={1}
                value={editForm.priceMxn}
                onChange={(e) =>
                  setEditForm({ ...editForm, priceMxn: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-work-dimensions">{t("Dimensiones")}</Label>
              <Input
                id="edit-work-dimensions"
                value={editForm.dimensions}
                onChange={(e) =>
                  setEditForm({ ...editForm, dimensions: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-work-materials">{t("Materiales")}</Label>
              <Input
                id="edit-work-materials"
                value={editForm.materials}
                onChange={(e) =>
                  setEditForm({ ...editForm, materials: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-work-description">
                {t("Descripción / Historia de la pieza")}
              </Label>
              <Textarea
                id="edit-work-description"
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={savingWork}
              onClick={() => setEditingWork(null)}
            >
              {t("Cancelar")}
            </Button>
            <Button
              type="button"
              disabled={savingWork}
              onClick={() => void saveWorkEdits()}
            >
              {savingWork ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("Guardando…")}
                </>
              ) : (
                t("Guardar cambios")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
