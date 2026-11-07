import { useI18n } from "@/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Fingerprint, QrCode as QrIcon, ScanLine, LayoutDashboard, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieceCard, SectionTitle, StellarBadge } from "@/components/toltek/ui";
import { images, pieces } from "@/lib/toltek";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Tlamatik — Memoria viva del patrimonio, certificada en Stellar" },
      { name: "description", content: "Pasaportes culturales físico-digitales y comercio justo para artesanos de México y América Latina." },
      { property: "og:title", content: "Tlamatik — Memoria viva del patrimonio" },
      { property: "og:description", content: "Certificamos el origen genuino de cada pieza artesanal en la red Stellar." },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "+600", label: "Artesanos protegidos", icon: Users },
  { value: "100%", label: "Pagos directos en USDC", icon: Coins },
  { value: "+7,000", label: "Pasaportes emitidos", icon: ShieldCheck },
  { value: "38", label: "Comunidades de origen", icon: Fingerprint },
];

const steps = [
  { n: "01", title: "Registro & Hashing", sub: "Preservación del saber", text: "Documentamos técnica, materiales y relato del maestro. Cada evidencia se sella con un hash SHA-256 inmutable.", icon: Fingerprint },
  { n: "02", title: "Pasaporte Cultural QR/NFC", sub: "Anclaje físico-digital", text: "Una etiqueta física vincula la pieza con su registro en Soroban. Cualquiera puede verificarla desde su teléfono.", icon: QrIcon },
  { n: "03", title: "Comercio Justo & Regalías", sub: "Liquidación en Stellar", text: "Ventas y licencias se pagan en USDC directo a la billetera del taller, con regalías automáticas para la comunidad.", icon: Coins },
];

function Index() {
  const { t } = useI18n();
  return (
    <>
      <section className="relative overflow-hidden talavera-bg">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <StellarBadge label={t("Respaldado por Stellar · Soroban")} />
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] md:text-6xl">{t("Preservamos la Memoria Viva de Nuestro Patrimonio.")}{" "}
              <span className="italic text-primary">{t("Certificamos su Origen Genuino.")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("Tlamatik une la tradición artesanal mexicana con trazabilidad inmutable en la red Stellar: cada pieza lleva un Pasaporte Cultural que honra a quien la creó y garantiza que el pago llegue a sus manos.")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/verificar"><ScanLine />{t("Verificar una Pieza (QR)")}</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/panel"><LayoutDashboard />{t("Panel de Promotor / Artesano")}</Link></Button>
            </div>
          </div>
          <div className="relative">
            <img src={images.hero} alt={t("Manos de artesano tallando madera de copal")} width={1280} height={960} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-float" />
            <div className="absolute -bottom-6 -left-4 rounded-xl border bg-card p-4 shadow-float md:-left-8">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("Pasaporte TK-0042")}</p>
              <p className="font-serif text-lg font-semibold">{t("Talla en copal · Arrazola")}</p>
              <p className="mt-1 font-mono text-xs text-jade">{t("✓ Hash verificado en ledger")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-indigo text-indigo-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-2 font-serif text-4xl font-semibold text-gold">{s.value}</p>
              <p className="mt-1 text-sm opacity-75">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionTitle center eyebrow={t("Flujo Phygital")} title={t("Cómo funciona en tres pasos")} sub={t("De las manos del maestro a la billetera del comprador, sin intermediarios opacos.")} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-xl border bg-card p-6 shadow-float">
              <span className="absolute right-5 top-4 font-serif text-5xl font-semibold text-primary/15">{s.n}</span>
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary"><s.icon /></span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">{t(s.sub)}</p>
              <h3 className="mt-1 text-xl font-semibold">{t(s.title)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(s.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow={t("Galería")} title={t("Piezas y creadores destacados")} />
          <Button asChild variant="outline"><Link to="/mercado">{t("Ver mercado ético")}</Link></Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.slice(0, 6).map((p) => <PieceCard key={p.id} piece={p} />)}
        </div>
      </section>
    </>
  );
}
