import alebrije from "@/assets/alebrije.jpg";
import barroNegro from "@/assets/barro-negro.jpg";
import huipil from "@/assets/huipil.jpg";
import olinala from "@/assets/olinala.jpg";
import cobre from "@/assets/cobre.jpg";
import talavera from "@/assets/talavera.jpg";
import hero from "@/assets/hero.jpg";

export const images = { alebrije, barroNegro, huipil, olinala, cobre, talavera, hero };

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
};

export const pieces: Piece[] = [
  { id: "TK-0042", title: "Alebrije Jaguar Nahual", artisan: "Jacobo y María Ángeles", community: "San Martín Tilcajete", region: "Oaxaca", technique: "Talla en Madera", priceMxn: 8900, image: alebrije },
  { id: "TK-0117", title: "Cántaro Calado de Barro Negro", artisan: "Familia Doña Rosa", community: "San Bartolo Coyotepec", region: "Oaxaca", technique: "Cerámica", priceMxn: 3450, image: barroNegro },
  { id: "TK-0203", title: "Huipil de Telar de Cintura", artisan: "Cooperativa Sna Jolobil", community: "San Juan Chamula", region: "Chiapas", technique: "Textil", priceMxn: 6200, image: huipil },
  { id: "TK-0251", title: "Baúl de Laca Rayada", artisan: "Maestro Francisco Coronel", community: "Olinalá", region: "Guerrero", technique: "Laca", priceMxn: 5800, image: olinala },
  { id: "TK-0310", title: "Cazo Martillado y Arracadas", artisan: "Taller Punzo Hermanos", community: "Santa Clara del Cobre", region: "Michoacán", technique: "Filigrana", priceMxn: 4100, image: cobre },
  { id: "TK-0388", title: "Plato de Talavera Poblana", artisan: "Uriarte Talavera", community: "Puebla de Zaragoza", region: "Puebla", technique: "Cerámica", priceMxn: 2650, image: talavera },
];

export const toUsdc = (mxn: number) => (mxn / USDC_RATE).toFixed(2);
export const fmtMxn = (n: number) => "$" + n.toLocaleString("es-MX") + " MXN";

export type Artisan = {
  name: string;
  technique: string;
  location: string;
  status: "Activa" | "Pendiente KYC" | "Verificada";
  pieces: number;
  usdc: number;
  initials: string;
};

export const artisans: Artisan[] = [
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

export const sampleHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
export const contractId = "CAOAFGPATXWJ7Q4R2NHLM3YEVZK5D6TSUB8PXCWQ2LJ9TOLTEK";

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function shortHash(h: string, n = 8) {
  return h.length > n * 2 ? `${h.slice(0, n)}…${h.slice(-n)}` : h;
}
