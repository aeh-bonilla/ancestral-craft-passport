import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import type { CulturalRegion } from '@/lib/regions';
import { MapPin } from 'lucide-react';

type MapInstance = { fitBounds: (bounds: unknown, padding?: number) => void };
type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  Marker: new (options: Record<string, unknown>) => { setMap: (map: null) => void; addListener: (event: string, callback: () => void) => { remove: () => void } };
  LatLngBounds: new () => { extend: (point: { lat: number; lng: number }) => void };
};
declare global { interface Window { google?: { maps: MapsApi }; initTlamatikRegionsMap?: () => void } }
let mapsPromise: Promise<MapsApi> | undefined;
function loadMaps(language: string): Promise<MapsApi> {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    if (!key) { reject(new Error('Google Maps no está configurado.')); return; }
    window.initTlamatikRegionsMap = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('No se pudo cargar Google Maps.'));
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initTlamatikRegionsMap&channel=${encodeURIComponent(import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? '')}&language=${language}&region=MX`;
    script.async = true;
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps.'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export function RegionsMap({ regions, onSelect }: { regions: CulturalRegion[]; onSelect: (id: string) => void }) {
  const { t, language } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const [api, setApi] = useState<MapsApi | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    // Sandbox Maps rendering is not supported; preserve the real integration on deployed origins.
    if (window.location.hostname === 'localhost') { setError('El mapa estará disponible en el sitio publicado.'); return; }
    void loadMaps(language).then(maps => {
      if (!active || !container.current) return;
      map.current = new maps.Map(container.current, {
        center: { lat: 23.5, lng: -102.5 }, zoom: 5, clickableIcons: false,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
        gestureHandling: 'cooperative', internalUsageAttributionIds: ['gmp_lovable_agentskills_v1'],
      });
      setApi(maps);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar Google Maps.'); });
    return () => { active = false; };
  }, [language]);
  useEffect(() => {
    if (!api || !map.current) return;
    const markers = regions.map(region => {
      const marker = new api.Marker({ map: map.current, position: region.position, title: region.name });
      const listener = marker.addListener('click', () => onSelect(region.id));
      return { marker, listener };
    });
    const bounds = new api.LatLngBounds();
    // Keep the entire republic visible while craft filters change the community markers.
    bounds.extend({ lat: 32.7, lng: -117.1 });
    bounds.extend({ lat: 14.5, lng: -86.7 });
    map.current.fitBounds(bounds, 20);
    return () => markers.forEach(({ marker, listener }) => { listener.remove(); marker.setMap(null); });
  }, [api, regions, onSelect]);
  return <div className="relative h-[420px] overflow-hidden rounded-lg border border-border bg-muted sm:h-[580px]">
    <div ref={container} className="h-full w-full" aria-label={t('Mapa de regiones de México')} />
    {!api && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground" role="status"><MapPin className="h-8 w-8 text-primary" /><p className="text-sm">{t(error || 'Cargando mapa…')}</p></div>}
  </div>;
}