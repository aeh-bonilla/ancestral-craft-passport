import { useI18n } from "@/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Fingerprint, QrCode as QrIcon, ScanLine, LayoutDashboard, Users, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieceCard, SectionTitle } from "@/components/toltek/ui";
import { images, pieces, type Piece } from "@/lib/toltek";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Arte & Origen — Tlamatik · Memoria viva del patrimonio" },
      { name: "description", content: "Pasaportes culturales físico-digitales, registro inmutable en Stellar Soroban y comercio justo para artesanos de México." },
      { property: "og:title", content: "Arte & Origen — Tlamatik" },
      { property: "og:description", content: "Certificamos el origen genuino de cada pieza artesanal en la red Stellar con liquidaciones directas en $MXN." },
    ],
  }),
  component: Index,
});

type RegionStory = {
  id: string;
  name: string;
  sub: string;
  desc: string;
  image: string;
  pieceIds: string[];
};

const regionsData: RegionStory[] = [
  {
    id: "cuetzalan",
    name: "Cuetzalan del Progreso",
    sub: "Sierra Norte de Puebla",
    desc: "Comunidad de origen Nahua que habita entre la niebla y el verdor de la Sierra Norte. Sus familias entrelazan la vida cotidiana entre el cultivo de café y el ritmo ancestral del telar de cintura, preservando saberes que dan forma a su identidad.",
    image: images.cuetzalanCourtyard,
    pieceIds: ["TK-0701", "TK-0702", "TK-0703"],
  },
  {
    id: "acatlan",
    name: "Acatlán de Osorio",
    sub: "Mixteca Poblana",
    desc: "Cuna de la danza del Tecuani y el barro bruñido rojo. Entre cerros secos y cantos de carrizo, los maestros mixtecos tallan máscaras de felino y modelan figuras ceremoniales que preservan el rito de la lluvia.",
    image: images.tecuani,
    pieceIds: ["TK-0512", "TK-0388", "TK-0701"],
  },
  {
    id: "arrazola",
    name: "San Martín Tilcajete y Arrazola",
    sub: "Valles Centrales de Oaxaca",
    desc: "Tierras zapotecas donde la madera de copal cobra vida en nahuales y alebrijes. Cada pieza es tallada con machete siguiendo la veta viva del árbol y decorada a mano con pigmentos minerales.",
    image: images.alebrije,
    pieceIds: ["TK-0042", "TK-0117", "TK-0512"],
  },
  {
    id: "santaclara",
    name: "Santa Clara del Cobre",
    sub: "Meseta Purépecha, Michoacán",
    desc: "Antigua tradición purépecha de forja y martillado a fuego vivo. Bloques de cobre fundido son transformados en cazos y joyas sin un solo punto de soldadura.",
    image: images.cobre,
    pieceIds: ["TK-0310", "TK-0251", "TK-0203"],
  },
];

const stats = [
  { value: "+600", label: "Artesanos protegidos", icon: Users },
  { value: "100%", label: "Liquidación bancaria en $MXN (SPEI)", icon: Coins },
  { value: "+7,000", label: "Pasaportes emitidos", icon: ShieldCheck },
  { value: "38", label: "Comunidades de origen", icon: Fingerprint },
];

const steps = [
  { n: "01", title: "Registro & Hashing", sub: "Preservación del saber", text: "Documentamos técnica, materiales y relato del maestro. Cada evidencia se sella con un hash SHA-256 inmutable.", icon: Fingerprint },
  { n: "02", title: "Pasaporte Cultural QR/NFC", sub: "Anclaje físico-digital", text: "Una etiqueta física vincula la pieza con su registro en Soroban. Cualquiera puede verificarla desde su teléfono.", icon: QrIcon },
  { n: "03", title: "Comercio Justo & Regalías", sub: "Sesión de derechos en Stellar", text: "Ventas y licencias se liquidan directamente en moneda nacional ($MXN) a la cuenta bancaria del taller, registrando la sesión de derechos en contratos Soroban.", icon: Coins },
];

function Index() {
  const { t } = useI18n();
  const [selectedRegionId, setSelectedRegionId] = useState("cuetzalan");

  const currentRegion = regionsData.find((r) => r.id === selectedRegionId) || regionsData[0]!;

  const featuredPieces = currentRegion.pieceIds
    .map((id) => pieces.find((p) => p.id === id))
    .filter((p): p is Piece => Boolean(p));

  return (
    <div className="space-y-16 py-6 sm:py-8">
      {/* 1. SECTOR DESTACADO: Banner Editorial de Región (Cuetzalan del Progreso) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#2B231D] text-[#F4EFE6] shadow-xl">
          <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-12 md:gap-12 md:p-14 items-center">
            {/* Columna Izquierda: Información Editorial */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <h1 className="font-serif text-3xl font-normal tracking-tight text-[#F4EFE6] sm:text-4xl md:text-5xl leading-[1.15]">
                  {t(currentRegion.name)}
                </h1>
                <p className="text-base font-normal text-[#D6CCA8] sm:text-lg">
                  {t(currentRegion.sub)}
                </p>
              </div>

              <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-[#C5B9A8]">
                {t(currentRegion.desc)}
              </p>

              {/* Selector interactivo de regiones */}
              <div id="regiones" className="pt-4 flex flex-wrap gap-2">
                {regionsData.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setSelectedRegionId(reg.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedRegionId === reg.id
                        ? "bg-[#F4EFE6] text-[#2B231D] shadow-xs"
                        : "bg-white/10 text-[#D6CCA8] hover:bg-white/20"
                    }`}
                  >
                    {reg.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Fotografía de Taller / Comunidad */}
            <div className="md:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                <img
                  src={currentRegion.image}
                  alt={currentRegion.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÁLOGO DESTACADO: 3 Piezas Certificadas (Rebozo, Huipil, Canasta) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPieces.map((piece, idx) => (
            <PieceCard key={piece.id} piece={piece} index={idx} />
          ))}
        </div>

        {/* Capturas de identidad editorial en esquinas inferiores */}
        <div className="mt-8 flex items-center justify-between px-2 text-xs font-serif tracking-wider text-muted-foreground/80 uppercase">
          <span>{t("Comunidad & Tradición")}</span>
          <span>{t("Comercio Justo Transparente")}</span>
        </div>
      </section>

      {/* 3. GALERÍA EXTENDIDA: Colección de Obras Certificadas */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 border-t border-border/60">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t("Colecciones")}</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground">{t("Obras con Pasaporte Activo")}</h2>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/mercado">
              {t("Explorar todo el catálogo")} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pieces.slice(3, 7).map((p, idx) => (
            <PieceCard key={p.id} piece={p} index={idx + 3} />
          ))}
        </div>
      </section>

      {/* 4. CÓMO FUNCIONA: Protocolo Phygital en 3 Pasos */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <SectionTitle
          center
          eyebrow={t("Trazabilidad Phygital")}
          title={t("Memoria viva, protegida en blockchain")}
          sub={t("De las manos del maestro a tu hogar: una etiqueta física y un pasaporte digital que aseguran origen genuino y liquidación bancaria directa.")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border/80 bg-card p-7 shadow-xs">
              <span className="absolute right-6 top-5 font-serif text-5xl font-normal text-primary/10 select-none">
                {s.n}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-sand text-foreground">
                <s.icon className="h-5 w-5 text-primary" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary">{t(s.sub)}</p>
              <h3 className="mt-1.5 font-serif text-lg font-semibold text-foreground">{t(s.title)}</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{t(s.text)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CIFRAS DE IMPACTO COMUNITARIO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-[#2B231D] text-[#F4EFE6] px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="mx-auto h-5 w-5 text-gold" />
                <p className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-gold">{s.value}</p>
                <p className="mt-1 text-xs text-[#C5B9A8]">{t(s.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LLAMADO A LA ACCIÓN: Verificación en Vivo y Panel */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 text-center py-8">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
            {t("¿Tienes una pieza en tus manos?")}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed">
            {t("Escanea el código QR del Pasaporte Cultural con tu celular para consultar la técnica, el rostro del maestro creador y el certificado inmutable emitido en Stellar Soroban.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/verificar">
                <ScanLine className="mr-2 h-4 w-4" />
                {t("Escanear Pasaporte (Cámara)")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/panel">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t("Ingreso a Panel Promotor")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
