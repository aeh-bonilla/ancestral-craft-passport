import { Link } from "@tanstack/react-router";
import { Menu, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./ui";
import { useWallet } from "./wallet";

const links = [
  { to: "/", es: "Inicio", en: "Home" },
  { to: "/verificar", es: "Verificar", en: "Verify" },
  { to: "/panel", es: "Panel Promotor", en: "Dashboard" },
  { to: "/mercado", es: "Mercado Ético", en: "Marketplace" },
] as const;

export function Navbar() {
  const { address, connect, disconnect, lang, toggleLang } = useWallet();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-sand text-foreground" }}>
              {lang === "ES" ? l.es : l.en}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold">
            {lang === "ES" ? "ES · en" : "EN · es"}
          </button>
          <Button size="sm" onClick={address ? disconnect : connect} className="hidden sm:inline-flex" variant={address ? "outline" : "default"}>
            <Wallet className="h-4 w-4" />
            {address ? address : "Conectar Billetera Stellar"}
          </Button>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: l.to === "/" }}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium" activeProps={{ className: "bg-sand" }}>
              {lang === "ES" ? l.es : l.en}
            </Link>
          ))}
          <Button className="mt-2 w-full" onClick={address ? disconnect : connect}>
            <Wallet className="h-4 w-4" /> {address ?? "Conectar Billetera Stellar"}
          </Button>
        </nav>
      )}
      <div className="greca" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-indigo text-indigo-foreground">
      <div className="greca" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm opacity-70">Pasaportes Culturales Phygital, preservación de saberes y comercio justo sobre Stellar.</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="font-semibold">Red</p>
          <p className="mt-2">Stellar · Soroban Testnet</p>
          <p>Pagos en USDC</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="font-semibold">Comunidades</p>
          <p className="mt-2">Oaxaca · Chiapas · Guerrero · Michoacán · Puebla · Jalisco</p>
        </div>
      </div>
      <p className="mx-auto max-w-3xl px-4 pb-3 text-center text-xs opacity-60">
        Inclusión financiera real: Las comunidades rurales reciben sus pagos directamente en moneda nacional ($MXN) a su tarjeta de débito habitual vía SPEI/CoDi, respaldados de forma inmutable en la red Stellar.
      </p>
      <p className="pb-6 text-center text-xs opacity-50">Interfaz demostrativa · Datos simulados</p>
    </footer>
  );
}
