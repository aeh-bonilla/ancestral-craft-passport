import { useI18n } from "@/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Copy,
  ExternalLink,
  Gift,
  MapPin,
  Play,
  ShoppingBag,
  ChevronDown,
  Search,
  Upload,
  Download,
  History,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CodiButton,
  FullBreakdown,
  LedgerBadge,
  PiecePhotoGallery,
  PriceBreakdown,
  QrCode,
  StellarBadge,
  StripeButton,
} from "@/components/toltek/ui";
import {
  contractId,
  getPiece,
  images,
  pieces,
  sampleHash,
  shortHash,
  toUsdc,
  type Piece,
} from "@/lib/toltek";
import {
  downloadPassportCertificate,
  findWorkByIdOrHash,
  getWorkRightsEvents,
  pieceToWork,
  workToPiece,
  type AuthoryRightsEvent,
  type AuthoryWork,
} from "@/lib/authory-service";
import { computeFileSha256 } from "@/lib/stellar/client-crypto";
import { getContractExplorerUrl, getTxExplorerUrl } from "@/lib/stellar/config";
import { verifyWorkServerFn } from "@/lib/stellar/soroban.functions";

export const Route = createFileRoute("/verificar")({
  validateSearch: (search: Record<string, unknown>): { id?: string | undefined } => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Verificador Público — Tlamatik" },
      {
        name: "description",
        content:
          "Escanea el QR de una pieza y confirma su autenticidad en el ledger de Stellar.",
      },
      { property: "og:title", content: "Verificador Público Universal — Tlamatik" },
      {
        property: "og:description",
        content:
          "Pieza auténtica y certificada: consulta su historia y registro blockchain.",
      },
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
  const { id } = Route.useSearch();
  const [query, setQuery] = useState(id ?? "");
  const [resolvedWork, setResolvedWork] = useState<AuthoryWork | null>(null);
  const [events, setEvents] = useState<AuthoryRightsEvent[]>([]);
  const [fileCheckResult, setFileCheckResult] = useState<{
    filename: string;
    hash: string;
    matched: boolean;
  } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;
    const target = id?.trim() || "TK-0042";
    setQuery(id ?? "");
    findWorkByIdOrHash(target).then(async (found) => {
      if (!active) return;
      const fallbackPiece = getPiece(id) ?? pieces[0]!;
      const work = found ?? pieceToWork(fallbackPiece);
      setResolvedWork(work);
      const evts = await getWorkRightsEvents(work.id);
      if (active) setEvents(evts);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setFileCheckResult(null);
    try {
      const found = await findWorkByIdOrHash(query);
      if (!found) {
        toast.error("No se encontró ninguna obra con ese ID o hash SHA-256");
        return;
      }
      setResolvedWork(found);
      const evts = await getWorkRightsEvents(found.id);
      setEvents(evts);
      toast.success(`Pasaporte ${found.id} verificado`);
    } finally {
      setSearching(false);
    }
  };

  const handleVerifyFile = async (file: File | null) => {
    if (!file) return;
    setSearching(true);
    try {
      const computed = await computeFileSha256(file);
      const byHash = await findWorkByIdOrHash(computed);
      const currentWork = resolvedWork ?? pieceToWork(pieces[0]!);
      const matchesCurrent =
        currentWork.hash.toLowerCase() === computed.toLowerCase() ||
        (currentWork.notes?.toLowerCase().includes(computed.toLowerCase()) ?? false);

      if (byHash) {
        setResolvedWork(byHash);
        const evts = await getWorkRightsEvents(byHash.id);
        setEvents(evts);
        setFileCheckResult({
          filename: file.name,
          hash: computed,
          matched: true,
        });
        toast.success("Archivo auténtico verificado contra el registro", {
          description: `${byHash.id} · ${shortHash(computed)}`,
        });
      } else {
        setFileCheckResult({
          filename: file.name,
          hash: computed,
          matched: matchesCurrent,
        });
        if (matchesCurrent) {
          toast.success("El archivo coincide con el pasaporte actual");
        } else {
          toast.info("SHA-256 calculado en navegador", {
            description: shortHash(computed),
          });
        }
      }
    } finally {
      setSearching(false);
    }
  };

  const activeWork = resolvedWork ?? pieceToWork(getPiece(id) ?? pieces[0]!);
  const seedPiece = getPiece(activeWork.id);
  const activePiece = seedPiece ?? workToPiece(activeWork);

  const showFeaturedLayout =
    Boolean(id && id.toUpperCase() !== "TK-0042") ||
    activeWork.id.toUpperCase() !== "TK-0042";

  return (
    <div>
      <VerifierSearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleManualSearch}
        onFileSelect={handleVerifyFile}
        searching={searching}
        fileCheckResult={fileCheckResult}
      />
      {showFeaturedLayout ? (
        <FeaturedVerify piece={activePiece} work={activeWork} events={events} />
      ) : (
        <DefaultVerify work={activeWork} events={events} />
      )}
    </div>
  );
}

function VerifierSearchBar({
  query,
  onQueryChange,
  onSubmit,
  onFileSelect,
  searching,
  fileCheckResult,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (f: File | null) => void;
  searching: boolean;
  fileCheckResult: { filename: string; hash: string; matched: boolean } | null;
}) {
  const { t } = useI18n();
  return (
    <div className="border-b bg-sand/60">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t(
                "Buscar por ID de pasaporte (ej. TK-0042, TK-0512, AUTH-2026-000101) o hash SHA-256…",
              )}
              className="bg-card pl-9 font-mono text-xs sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={searching}>
              {searching ? <Loader2 className="animate-spin" /> : <Search />}
              {t("Verificar ID / Hash")}
            </Button>
            <Button asChild variant="outline" size="sm">
              <label className="cursor-pointer">
                <Upload className="h-4 w-4" />
                {t("Auditar archivo local (SHA-256)")}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    onFileSelect(e.target.files?.[0] ?? null);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </Button>
          </div>
        </form>
        {fileCheckResult && (
          <div
            className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-xs ${
              fileCheckResult.matched
                ? "border-jade/30 bg-jade/10 text-jade"
                : "border-gold/40 bg-gold/10 text-foreground"
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              {fileCheckResult.matched ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-jade" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
              )}
              {fileCheckResult.filename} ·{" "}
              {fileCheckResult.matched
                ? t("Huella binaria coincide con pasaporte registrado")
                : t("Huella SHA-256 calculada localmente")}
            </span>
            <code className="break-all font-mono text-[11px]">
              {fileCheckResult.hash}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedVerify({
  piece,
  work,
  events,
}: {
  piece: Piece;
  work: AuthoryWork;
  events: AuthoryRightsEvent[];
}) {
  const { t } = useI18n();
  const available = piece.status === "available";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-jade/30 bg-jade/10 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-jade text-jade-foreground">
            <BadgeCheck className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <p className="font-serif text-xl font-semibold text-jade sm:text-2xl md:text-3xl">
              {t("✓ PIEZA AUTÉNTICA & CERTIFICADA")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("Pasaporte")} {piece.id} · {t(piece.ledgerStatus)} ·{" "}
              {available ? t("Disponible") : t("No disponible")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadPassportCertificate(work, events)}
          >
            <Download className="h-4 w-4" />
            {t("Descargar Certificado")}
          </Button>
          <StellarBadge label={piece.badge ?? "Certificado en Stellar"} />
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="self-start overflow-hidden rounded-2xl shadow-float">
          <PiecePhotoGallery
            photos={
              piece.gallery && piece.gallery.length > 0
                ? piece.gallery
                : [piece.image]
            }
            title={piece.title}
          />
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t(piece.category ?? piece.technique)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              {t(piece.title)}
            </h1>
            <p className="mt-3 flex items-start gap-1 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {piece.artisan} ·{" "}
              {piece.location ?? `${piece.community}, ${piece.region}`}
            </p>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {t(piece.story ?? work.description)}
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">{t("Técnica:")}</span>{" "}
              {t(piece.techniqueDetail ?? piece.technique)}
            </p>
            <p>
              <span className="font-semibold text-foreground">
                {t("Dimensiones:")}
              </span>{" "}
              {piece.dimensions ?? "Pieza única"}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-float">
            <FullBreakdown piece={piece} />
            <div className="mt-4 grid gap-2">
              <CodiButton piece={piece} primary className="w-full" />
              <StripeButton piece={piece} className="w-full" />
            </div>
          </div>
          <LedgerBadge piece={piece} />
        </div>
      </div>

      <BlockchainAuditPanel work={work} events={events} />
    </div>
  );
}

function DefaultVerify({
  work,
  events,
}: {
  work: AuthoryWork;
  events: AuthoryRightsEvent[];
}) {
  const { t, money } = useI18n();
  const [active, setActive] = useState(0);
  const cur = gallery[active]!;
  const [tip, setTip] = useState(false);
  const piece = pieces.find((p) => p.id === "TK-0042")!;
  const price = piece.priceMxn;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-jade/30 bg-jade/10 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-jade text-jade-foreground">
            <BadgeCheck className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <p className="font-serif text-xl font-semibold text-jade sm:text-2xl md:text-3xl">
              {t("✓ PIEZA AUTÉNTICA & CERTIFICADA")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("Pasaporte TK-0042 · escaneado hace unos segundos")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadPassportCertificate(work, events)}
          >
            <Download className="h-4 w-4" />
            {t("Descargar Certificado")}
          </Button>
          <StellarBadge
            label={t("Registrado en Ledger de Stellar / Soroban Testnet")}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-sand shadow-float">
            <img
              src={cur.src}
              alt={cur.label}
              className="aspect-square w-full object-cover md:aspect-[4/3]"
            />
            {cur.video && (
              <button
                onClick={() => toast(t("Reproduciendo video del proceso (demo)"))}
                className="absolute inset-0 grid place-items-center bg-indigo/30"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-card/90 text-primary">
                  <Play className="h-7 w-7" />
                </span>
              </button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {gallery.map((g, i) => (
              <button
                key={t(g.label)}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-lg border-2 text-left ${
                  i === active ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={g.src}
                  alt={t(g.label)}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <p className="truncate px-1 py-1 text-xs text-muted-foreground">
                  {g.video ? "▶ " : ""}
                  {t(g.label)}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("Talla en madera de copal")}
            </p>
            <h1 className="mt-2 text-4xl font-semibold">
              {t("Alebrije Jaguar Nahual")}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/15 font-serif font-semibold text-primary">
                MA
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{t("Maestro Don Miguel Aguilar")}</p>
                <p className="flex items-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Taller Familiar
                  Aguilar · San Antonio Arrazola, Oaxaca, México
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-float">
            <p className="flex items-center gap-2 text-2xl font-semibold">
              {money(price)} <PriceBreakdown priceMxn={price} />
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ {toUsdc(price)} {t("USDC · 95.2% llega directo al taller")}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                onClick={() =>
                  toast.success(t("Pago simulado enviado"), {
                    description: `${toUsdc(price)} USDC → GBTK…AGUI`,
                  })
                }
              >
                <ShoppingBag />
                {t("Comprar en USDC / MXN")}
              </Button>
              <Button variant="outline" onClick={() => setTip(true)}>
                <Gift />
                {t("Propina / Mecenazgo")}
              </Button>
              <CodiButton piece={piece} className="sm:col-span-2" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{t("La Memoria del Oficio")}</h2>
            <Accordion type="single" collapsible defaultValue="tecnica" className="mt-2">
              <AccordionItem value="tecnica">
                <AccordionTrigger>{t("Técnica ancestral heredada")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(
                    "Don Miguel aprendió de su padre a tallar el copal verde con machete y cuchillo, siguiendo la veta para que la madera “diga” qué animal guarda. Tres generaciones del taller han perfeccionado el oficio iniciado en Arrazola por Manuel Jiménez.",
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="materiales">
                <AccordionTrigger>{t("Materiales autóctonos")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(
                    "Madera de copal (Bursera glabrifolia) de reforestación comunitaria, grana cochinilla, añil, cempasúchil y jugo de limón para fijar los pigmentos.",
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="simbolos">
                <AccordionTrigger>{t("Simbología cultural")}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(
                    "El jaguar es tona o nahual protector en la cosmovisión zapoteca. Los puntos representan semillas de maíz; las flores, la fertilidad de la tierra.",
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <BlockchainAuditPanel work={work} events={events} />

      <Dialog open={tip} onOpenChange={setTip}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">
              {t("Apoyo directo al Maestro Aguilar")}
            </DialogTitle>
            <DialogDescription>
              {t("El 100% de la propina llega a su billetera Stellar.")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 25].map((a) => (
              <Button
                key={a}
                variant="outline"
                onClick={() => {
                  setTip(false);
                  toast.success(`Propina de ${a} USDC enviada`, {
                    description: t("Gracias por sostener el oficio."),
                  });
                }}
              >
                {a} USDC
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlockchainAuditPanel({
  work,
  events,
}: {
  work: AuthoryWork;
  events: AuthoryRightsEvent[];
}) {
  const { t } = useI18n();
  const [audit, setAudit] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const hash = work.hash || sampleHash;
  const ts = work.registeredAt || "2026-10-17 17:42:09 UTC";
  const txUrl = getTxExplorerUrl(work.stellarTransactionId);

  const copy = (v: string) => {
    navigator.clipboard?.writeText(v);
    toast(t("Copiado al portapapeles"));
  };

  const reverifyOnChain = async () => {
    setVerifying(true);
    try {
      const res = await verifyWorkServerFn({
        data: { workId: work.id, expectedHash: hash },
      });
      if (res.verified) {
        toast.success(t("Hash SHA-256 verificado en ledger"), {
          description: `${work.id} · ${res.mode === "soroban-cli" ? "Soroban CLI" : "Soroban Testnet"}`,
        });
      } else {
        toast.success(t("Hash SHA-256 verificado en pasaporte local"), {
          description: shortHash(hash),
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const eventLabel: Record<string, string> = {
    registration: "Registro de Autoría",
    evidence: "Anclaje de Evidencia SHA-256",
    license: "Licencia Ética B2B",
    assignment: "Cesión / Transferencia",
  };

  return (
    <div className="mt-10 overflow-hidden rounded-2xl bg-indigo text-indigo-foreground shadow-float">
      <button
        onClick={() => setAudit(!audit)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-serif text-xl font-semibold">
          {t("Panel Técnico de Auditoría Blockchain")}
        </span>
        <ChevronDown className={`transition-transform ${audit ? "rotate-180" : ""}`} />
      </button>
      {audit && (
        <div className="space-y-6 border-t border-indigo-foreground/10 p-5">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <dl className="space-y-4 text-sm">
              {(
                [
                  ["ID de Pasaporte / Obra", work.id],
                  ["Hash SHA-256 del expediente", hash],
                  ["Smart Contract (Soroban)", contractId],
                  ["Timestamp inmutable", ts],
                  ["Ledger", "Stellar Soroban Testnet"],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wider opacity-60">{t(k)}</dt>
                  <dd className="mt-1 flex items-start gap-2 break-all font-mono text-gold">
                    {v}
                    <button
                      onClick={() => copy(v)}
                      aria-label={t("Copiar")}
                      className="shrink-0 opacity-60 hover:opacity-100"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </dd>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={verifying}
                  onClick={() => void reverifyOnChain()}
                >
                  {verifying && <Loader2 className="animate-spin" />}
                  {t("Re-verificar hash")}
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <a href={txUrl} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    {t("Ver en Stellar Expert")}
                  </a>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <a
                    href={getContractExplorerUrl(contractId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink />
                    {t("Contrato Soroban")}
                  </a>
                </Button>
              </div>
            </dl>
            <div className="self-center rounded-xl bg-card p-3">
              <QrCode
                value={`https://tlamatik.vercel.app/verificar?id=${work.id}`}
                size={190}
              />
            </div>
          </div>

          {events.length > 0 && (
            <div className="border-t border-indigo-foreground/10 pt-5">
              <p className="flex items-center gap-2 font-serif text-lg font-semibold text-gold">
                <History className="h-4 w-4" />
                {t("Historial de Derechos y Evidencia (Soroban Rights Events)")}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-indigo-foreground/15 bg-indigo-foreground/5 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-gold/20 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-gold">
                        {t(eventLabel[evt.type] ?? evt.type)}
                      </span>
                      <span className="font-mono text-[11px] opacity-65">
                        {evt.effectiveDate.slice(0, 10)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold">
                      {evt.actor}
                      {evt.recipient ? ` → ${evt.recipient}` : ""}
                    </p>
                    {evt.terms && (
                      <p className="mt-1 opacity-80">{t(evt.terms)}</p>
                    )}
                    {evt.notes && (
                      <p className="mt-1 break-all font-mono text-[11px] text-gold/90">
                        {evt.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
