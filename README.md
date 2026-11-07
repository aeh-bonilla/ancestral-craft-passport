# Ancestral Craft Passport

Actúa como un Diseñador de Interfaces UI/UX Principal y Desarrollador Frontend Senior experto en React, Tailwind CSS y Lucide Icons.

Necesito que crees la interfaz de usuario completa (Frontend UI sin integración de backend real, usando estados locales y datos de prueba/mockups) para "Toltek": una plataforma descentralizada de Pasaportes Culturales Físico-Digitales (Phygital), Preservación de Saberes Ancestrales y Comercio Justo respaldada por la red blockchain Stellar para artesanos, artistas y promotores culturales en México y América Latina.

================================================================================
1. GUÍA DE ESTILO Y SISTEMA DE DISEÑO (MEXICANO CONTEMPORÁNEO & SOBRIO)
================================================================================
- Estética General: Un equilibrio entre sofisticación Web3/Fintech y la calidez del arte popular mexicano. Debe sentirse elegante, premium, limpio y auténtico, evitando clichés folclóricos exagerados o estridentes.
- Paleta de Colores:
  * Primario: Terracota / Barro Cálido (#C85A32 o #A64B2A)
  * Secundario: Azul Añil / Índigo Profundo (#1E2B37 o #121A24) para la estructura y fondos oscuros.
  * Fondos Claros: Crema Lino / Arena Suave (#FBF9F5 / #F3EFE6) en lugar de blanco puro frío.
  * Acentos: Dorado Viejo / Cobre (#D4A359) para insignias de autenticidad y sellos blockchain, y Verde Jade sutil para estados "Verificado / Éxito".
- Tipografía:
  * Encabezados: Serif elegante (ej. Playfair Display, Cinzel o Lora) para transmitir tradición y patrimonio cultural.
  * Cuerpo de Texto y UI: Sans-serif limpia y moderna (ej. Inter o Plus Jakarta Sans).
- Motivos Visuales: Bordes sutiles con patrones geométricos mínimos inspirados en textiles zapoteco-oaxaqueños o simetría de la Talavera, tarjetas flotantes con sombras suaves, esquinas ligeramente redondeadas (rounded-xl) y badges/sellos criptográficos con aspecto físico-digital.

================================================================================
2. ESTRUCTURA DE NAVEGACIÓN Y PANTALLAS REQUERIDAS
================================================================================
Crea un sistema de navegación mediante Header/Navbar con pestañas o rutas para cambiar fluidamente entre las siguientes 5 pantallas clave:

--------------------------------------------------------------------------------
PANTALLA 1: LANDING PAGE (PÁGINA PRINCIPAL Y PROPUESTA DE VALOR)
--------------------------------------------------------------------------------
- Navbar: Logo "Toltek" con ícono de sello/escudo, enlaces de navegación, selector de idioma (ES/EN) y botón "Conectar Billetera Stellar (Mock)".
- Hero Section:
  * Título impactante: "Preservamos la Memoria Viva de Nuestro Patrimonio. Certificamos su Origen Genuino."
  * Subtítulo explicativo sobre la unión de la tradición artesanal mexicana con trazabilidad inmutable en Stellar.
  * CTAs principales: "Verificar una Pieza (QR)" y "Panel de Promotor / Artesano".
- Sección de Impacto (Stats):
  * Contadores elegantes (ej. +600 Artesanos Protegidos, 100% Pagos Directos en USDC, +7,000 Pasaportes Emitidos).
- Cómo Funciona (Flujo Phygital en 3 Pasos):
  1. Registro & Hashing (Preservación del Saber).
  2. Pasaporte Cultural QR/NFC (Anclaje Físico-Digital).
  3. Comercio Justo & Regalías en Stellar.
- Galería de Piezas y Creadores Destacados:
  * Tarjetas de piezas artesanales (ej. Alebrije de Arrazola, Barro Negro de San Bartolo Coyotepec, Huipil de Telar de Cinta) con fotos de alta calidad, badge de "Certificado en Stellar", comunidad de origen y precio en MXN y USDC.

--------------------------------------------------------------------------------
PANTALLA 2: VERIFICADOR PÚBLICO UNIVERSAL (ESCANEO DE QR PHYGITAL)
--------------------------------------------------------------------------------
- Esta pantalla simula lo que ve un comprador al escanear el QR físico de una pieza.
- Banner de Estado de Autenticidad:
  * Insignia grande e inconfundible: "✓ PIEZA AUTÉNTICA & CERTIFICADA".
  * Badge de Blockchain: "Registrado en Ledger de Stellar / Soroban Testnet".
- Tarjeta Principal de la Obra:
  * Galería de fotos y video del proceso de elaboración (ej. extracción de tintes naturales, tallado en madera de copal).
  * Título de la obra, Nombre del Maestro Artesano (ej. "Maestro Don Miguel Aguilar"), Taller Familiar y Comunidad (ej. "Oaxaca, México").
- Sección "La Memoria del Oficio":
  * Acordeón o texto narrativo con la técnica ancestral heredada, materiales autóctonos y simbología cultural.
- Panel Técnico Blockchain (Desplegable / Card de Auditoría):
  * Hash SHA-256 del archivo (ej. `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).
  * Dirección del Smart Contract en Soroban (`CAOAFGPATXWJ...`).
  * Timestamp inmutable y enlace simulado al Stellar Expert Explorer.
- Sección de Comercio Justo / Apoyo Directo:
  * Botón para "Comprar Pieza en USDC / Moneda Local" y botón "Enviar Propina / Mecenazgo al Artesano".

--------------------------------------------------------------------------------
PANTALLA 3: PANEL DEL PROMOTOR CULTURAL Y COOPERATIVA (DASHBOARD)
--------------------------------------------------------------------------------
- Sidebar o Pestañas de Gestión:
  * Resumen / Métricas, Catálogo de Artesanos, Registro de Nuevas Obras, Kits Phygital QR.
- Dashboard Principal:
  * Métricas clave: Artesanos Apadrinados (ej. 24), Piezas Catalogadas (ej. 142), Total Recibido para la Comunidad en USDC ($4,850 USDC).
  * Lista / Tabla de Artesanos Asociados con foto, técnica, ubicación y estado de cuenta (con opción de "Agregar Nuevo Artesano").
- Módulo de Descarga e Impresión de Kits QR:
  * Vista previa e impresión masiva de etiquetas / Pasaportes Culturales con QR listos para adjuntar a las piezas físicas del taller.

--------------------------------------------------------------------------------
PANTALLA 4: FORMULARIO DE REGISTRO DE OBRA Y PASAPORTE CULTURAL
--------------------------------------------------------------------------------
- Formulario paso a paso (Stepper):
  * Paso 1: Datos de la Pieza (Título, artesano, categoría, técnica ancestral, materiales autóctonos, precio en MXN/USDC).
  * Paso 2: Archivos y Evidencia del Saber (Subida drag-and-drop de fotos de proceso, audios o documentos de historia).
  * Paso 3: Generación Criptográfica & Minting Simulado.
- Componente Interactivo en Vivo:
  * A medida que el usuario llena el formulario, una tarjeta previa a la derecha calcula y muestra en tiempo real la vista previa del Pasaporte Cultural, la simulación del Hash SHA-256 generado en el navegador y el código QR generado.
- Botón de Acción Principal:
  * "Anclar en Stellar Blockchain & Generar Pasaporte Phygital" (Muestra una animación de procesamiento/minting modal con confetti/éxito al finalizar).

--------------------------------------------------------------------------------
PANTALLA 5: MARKETPLACE ÉTICO Y MÓDULO DE LICENCIAMIENTO B2B
--------------------------------------------------------------------------------
- Vista Conmutable (Toggle Superior): [ Comprar Artesanías Físicas ] | [ Licenciamiento Ético para Marcas ]
- Módulo A (Mercado de Artesanías Físicas):
  * Filtros por región (Oaxaca, Chiapas, Jalisco, Michoacán), por técnica (Textil, Cerámica, Talla en Madera, Filigrana) y precio.
  * Grid de productos con badges de origen comunitario y botón de checkout rápido en USDC/fiat.
- Módulo B (Licenciamiento B2B para Marcas de Moda / Arquitectura):
  * Sección dirigida a diseñadores que quieren usar un patrón o diseño tradicional de forma legal y ética.
  * Catálogo de "Patrones y Expresiones Culturales Tradicionales Registradas".
  * Modal de Solicitud de Licencia: Permite seleccionar tipo de uso (Textil comercial, Arquitectura, Edición limitada), definir porcentaje de regalías automáticas para la comunidad (ej. 12%) y firmar el contrato en Soroban.

================================================================================
3. COMPONENTES Y DETALLES DE INTERACCIÓN REQUERIDOS
================================================================================
- Notificaciones Toast: Implementa avisos emergentes interactivos (ej. "Billetera Stellar conectada correctamente", "Hash SHA-256 verificado en ledger", "Licencia ética aprobada").
- Datos Ficticios (Mock Data) Ricos: Usa nombres reales de artesanos, comunidades auténticas mexicanas (Oaxaca, Chiapas, Olinalá, Tzintzuntzan) y fotos de artesanías reales (vía Unsplash).
- Responsive Design: Garantiza que la interfaz sea totalmente funcional en dispositivos móviles (smartphone del artesano/comprador) y de escritorio.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ancestral-craft-passport.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/330e08cc-2a5b-4acf-a27a-67129e566b10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
