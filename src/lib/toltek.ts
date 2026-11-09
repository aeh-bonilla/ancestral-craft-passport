import alebrije from "@/assets/alebrije.jpg";
import barroNegro from "@/assets/barro-negro.jpg";
import huipil from "@/assets/huipil.jpg";
import olinala from "@/assets/olinala.jpg";
import cobre from "@/assets/cobre.jpg";
import talavera from "@/assets/talavera.jpg";
import hero from "@/assets/hero.jpg";
import tecuani from "@/assets/tecuani-tk0512.jpg";
import type { BankingHashes } from "./artisan-banking";

export const images = { alebrije, barroNegro, huipil, olinala, cobre, talavera, hero, tecuani };

export const USDC_RATE = 17.2; // MXN por USDC (mock)

export type Piece = {
  id: string;
  title: string;
  artisan: string;
  community: string;
  region: "Oaxaca" | "Chiapas" | "Jalisco" | "Michoacán" | "Guerrero" | "Puebla";
  technique: "Textil" | "Cerámica" | "Talla en Madera" | "Filigrana" | "Laca";
  priceMxn: number;
  image: string;
  unesco?: string;
  /** Campos extendidos para piezas destacadas con pasaporte completo. */
  featured?: boolean;
  badge?: string;
  category?: string;
  location?: string;
  techniqueDetail?: string;
  dimensions?: string;
  priceUsd?: number;
  certFeeMxn?: number;
  shippingMxn?: number;
  status?: "available" | "sold" | "reserved";
  stellarTxHash?: string;
  ledgerStatus?: string;
  story?: string;
};

export const pieces: Piece[] = [
  {
    id: "TK-0512",
    title: "El Guardián del Monte: Tecuani de Acatlán",
    artisan: "Miriam Nava",
    community: "Acatlán de Osorio",
    region: "Puebla",
    technique: "Talla en Madera",
    priceMxn: 1,
    image: tecuani,
    featured: true,
    badge: "Puebla · Mixteca · Cuenta CoDi Activa $1 MXN",
    category: "Figuras de Danza / Madera & Textil",
    location: "Acatlán de Osorio, Puebla, México",
    techniqueDetail: "Tallado en madera de copal/pino, confección textil pintada a mano y ensamble de ixtle natural",
    dimensions: "18cm x 10cm x 8cm (180g)",
    priceUsd: 1,
    certFeeMxn: 0,
    shippingMxn: 0,
    status: "available",
    stellarTxHash: "725e126cc7998b795f328f99e9ba60d863202d06aa1166016d0cd573eadd48cf",
    ledgerStatus: "Verified on Soroban Testnet",
    story: "En las entrañas de la Mixteca, el sonido del teponaztli y la flauta de carrizo anuncian la llegada del Tecuani. Esta pieza rinde homenaje a la danza ancestral de petición de lluvias y protección de las cosechas. Modelado y ensamblado a mano por la maestra artesana Miriam Nava, viste el tradicional mazo amarillo salpicado con las rosetas del felino sagrado y una máscara decorada con cerdas naturales e hilos de ixtle trenzado.",
  },
  { id: "TK-0388", title: "Plato de Talavera Poblana", artisan: "Uriarte Talavera", community: "Puebla de Zaragoza", region: "Puebla", technique: "Cerámica", priceMxn: 2650, image: talavera, unesco: "Patrimonio Cultural Inmaterial (UNESCO) · Puebla" },
  { id: "TK-0042", title: "Alebrije Jaguar Nahual", artisan: "Jacobo y María Ángeles", community: "San Martín Tilcajete", region: "Oaxaca", technique: "Talla en Madera", priceMxn: 8900, image: alebrije },
  { id: "TK-0117", title: "Cántaro Calado de Barro Negro", artisan: "Familia Doña Rosa", community: "San Bartolo Coyotepec", region: "Oaxaca", technique: "Cerámica", priceMxn: 3450, image: barroNegro },
  { id: "TK-0203", title: "Huipil de Telar de Cintura", artisan: "Cooperativa Sna Jolobil", community: "San Juan Chamula", region: "Chiapas", technique: "Textil", priceMxn: 6200, image: huipil },
  { id: "TK-0251", title: "Baúl de Laca Rayada", artisan: "Maestro Francisco Coronel", community: "Olinalá", region: "Guerrero", technique: "Laca", priceMxn: 5800, image: olinala },
  { id: "TK-0310", title: "Cazo Martillado y Arracadas", artisan: "Taller Punzo Hermanos", community: "Santa Clara del Cobre", region: "Michoacán", technique: "Filigrana", priceMxn: 4100, image: cobre },
];

export const toUsdc = (mxn: number) => (mxn / USDC_RATE).toFixed(2);
export const fmtMxn = (n: number) => "$" + n.toLocaleString("es-MX") + " MXN";

export type Artisan = {
  bankingHashes?: BankingHashes | undefined;
  name: string;
  technique: string;
  location: string;
  status: "Activa" | "Pendiente KYC" | "Verificada";
  pieces: number;
  usdc: number;
  initials: string;
};

export const artisans: Artisan[] = [
  { name: "Miriam Nava", technique: "Talla en madera & textil", location: "Acatlán de Osorio, Pue.", status: "Verificada", pieces: 1, usdc: 1, initials: "MN" },
  { name: "Alain Bonilla", technique: "Promotor Comunitario", location: "Acatlán de Osorio, Pue.", status: "Verificada", pieces: 0, usdc: 0, initials: "AB" },
  { name: "Don Miguel Aguilar", technique: "Talla en copal", location: "San Antonio Arrazola, Oax.", status: "Verificada", pieces: 18, usdc: 920, initials: "MA" },
  { name: "Doña Rosa Real", technique: "Barro negro bruñido", location: "San Bartolo Coyotepec, Oax.", status: "Verificada", pieces: 26, usdc: 1140, initials: "RR" },
  { name: "Petrona Gómez", technique: "Telar de cintura", location: "Zinacantán, Chis.", status: "Activa", pieces: 12, usdc: 610, initials: "PG" },
  { name: "Francisco Coronel", technique: "Laca rayada", location: "Olinalá, Gro.", status: "Verificada", pieces: 9, usdc: 780, initials: "FC" },
  { name: "Juana Morales", technique: "Alfarería de alta temperatura", location: "Tzintzuntzan, Mich.", status: "Pendiente KYC", pieces: 4, usdc: 0, initials: "JM" },
  { name: "Abelardo Punzo", technique: "Cobre martillado", location: "Santa Clara del Cobre, Mich.", status: "Activa", pieces: 15, usdc: 540, initials: "AP" },
];

export type Pattern = {
  id: string;
  name: string;
  community: string;
  description: string;
  image: string;
  royalty: number;
};

export const patterns: Pattern[] = [
  { id: "PCT-01", name: "Rombo del Universo Maya", community: "Tsotsiles de Zinacantán, Chis.", description: "Cosmograma tejido que representa los cuatro rumbos y el centro del mundo.", image: huipil, royalty: 12 },
  { id: "PCT-02", name: "Greca Escalonada Mitla", community: "Zapotecos de Mitla, Oax.", description: "Xicalcoliuhqui: el movimiento del agua y la serpiente, tallado en piedra hace siglos.", image: barroNegro, royalty: 10 },
  { id: "PCT-03", name: "Flor de Rayado Olinalteco", community: "Nahuas de Olinalá, Gro.", description: "Motivo floral esgrafiado sobre laca de linaza y tierras minerales.", image: olinala, royalty: 12 },
  { id: "PCT-04", name: "Rosetón de Talavera", community: "Gremio Alfarero de Puebla", description: "Simetría radial en azul cobalto con Denominación de Origen.", image: talavera, royalty: 8 },
];

export const sampleHash = "c0ffee112233445566778899aabbccddeeff00112233445566778899aabbccdd";
export const contractId = "CAOAFGPATXWJ6KKGXFYHY42Q4N75NOWSR3NH3K2DT7QR3YSMDGT5P2HO";

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function shortHash(h: string, n = 8) {
  return h.length > n * 2 ? `${h.slice(0, n)}…${h.slice(-n)}` : h;
}

export const getPiece = (id?: string) => (id ? pieces.find((p) => p.id === id.toUpperCase()) : undefined);
