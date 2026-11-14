import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import type { CulturalRegion } from '@/lib/regions';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MapInstance = { fitBounds: (bounds: unknown, padding?: number) => void };
type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  Marker: new (options: Record<string, unknown>) => { setMap: (map: null) => void; addListener: (event: string, callback: () => void) => { remove: () => void } };
  LatLngBounds: new () => { extend: (point: { lat: number; lng: number }) => void };
  importLibrary?: (name: 'maps') => Promise<{ Map: MapsApi['Map'] }>;
};
declare global { interface Window { google?: { maps: MapsApi }; initTlamatikRegionsMap?: () => void; gm_authFailure?: () => void } }
let mapsPromise: Promise<MapsApi> | undefined;
function loadMaps(language: string): Promise<MapsApi> {
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    if (!key) { reject(new Error('Google Maps no está configurado.')); return; }
    const timeout = window.setTimeout(() => reject(new Error('No se pudo cargar Google Maps.')), 15000);
    const ready = async () => {
      try {
        const maps = window.google?.maps;
        if (!maps) throw new Error('No se pudo cargar Google Maps.');
        // A namespace may exist before loading=async has initialized its constructors.
        if (maps.importLibrary) await maps.importLibrary('maps');
        if (typeof maps.Map !== 'function') throw new Error('No se pudo cargar Google Maps.');
        resolve(maps);
      } catch (error) { reject(error); }
      finally { window.clearTimeout(timeout); }
    };
    window.initTlamatikRegionsMap = () => { void ready(); };
    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      window.clearTimeout(timeout);
      reject(new Error('No se pudo cargar Google Maps.'));
      window.dispatchEvent(new Event('tlamatik:maps-auth-failure'));
      previousAuthFailure?.();
    };
    if (typeof window.google?.maps?.Map === 'function') { void ready(); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initTlamatikRegionsMap&channel=${encodeURIComponent(import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? '')}&language=${language}&region=MX`;
    script.async = true;
    script.onerror = () => { window.clearTimeout(timeout); reject(new Error('No se pudo cargar Google Maps.')); };
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
  const initialLanguage = useRef(language);
  useEffect(() => {
    let active = true;
    const element = container.current;
    const fail = () => { if (active) setError('No se pudo cargar Google Maps.'); };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      // Only handle the reported Google Maps failure, never unrelated app errors.
      if (reason instanceof Error && /IntersectionObserver.*observe|observe.*IntersectionObserver/.test(reason.message) && /maps\.googleapis\.com/.test(reason.stack ?? '')) {
        event.preventDefault();
        fail();
      }
    };
    window.addEventListener('tlamatik:maps-auth-failure', fail);
    window.addEventListener('unhandledrejection', onRejection);
    // Sandbox Maps rendering is not supported; preserve the real integration on deployed origins.
    if (window.location.hostname === 'localhost') fail();
    else void loadMaps(initialLanguage.current).then(maps => {
      if (!active) return;
      if (!(element instanceof HTMLElement) || !element.isConnected || container.current !== element) { fail(); return; }
      map.current = new maps.Map(element, {
        center: { lat: 23.5, lng: -102.5 }, zoom: 5, clickableIcons: false,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
        gestureHandling: 'cooperative', internalUsageAttributionIds: ['gmp_lovable_agentskills_v1'],
      });
      setApi(maps);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar Google Maps.'); });
    return () => {
      active = false;
      map.current = null;
      window.removeEventListener('tlamatik:maps-auth-failure', fail);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  useEffect(() => {
    if (!api || !map.current || error) return;
    const markers: Array<{ marker: InstanceType<MapsApi['Marker']>; listener: { remove: () => void } }> = [];
    try {
    regions.forEach(region => {
      const marker = new api.Marker({ map: map.current, position: region.position, title: region.name });
      const listener = marker.addListener('click', () => onSelect(region.id));
      markers.push({ marker, listener });
    });
    const bounds = new api.LatLngBounds();
    // Keep the entire republic visible while craft filters change the community markers.
    bounds.extend({ lat: 32.7, lng: -117.1 });
    bounds.extend({ lat: 14.5, lng: -86.7 });
    map.current.fitBounds(bounds, 20);
    } catch { setError('No se pudo cargar Google Maps.'); }
    return () => markers.forEach(({ marker, listener }) => { listener.remove(); marker.setMap(null); });
  }, [api, regions, onSelect, error]);
  if (error) return <section className="border-y border-border py-6" aria-label={t('Comunidades')}>
    <p role="status" className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-primary" />{t(error)}</p>
    <ul className="divide-y divide-border">{regions.map(region => <li key={region.id}>
      <Button variant="ghost" className="h-auto w-full justify-start whitespace-normal py-4 text-left" onClick={() => onSelect(region.id)}>
        <MapPin className="shrink-0" /><span className="min-w-0"><span className="block font-medium">{region.name}</span><span className="block text-xs text-muted-foreground">{region.state} · {region.communities.join(', ')}</span><span className="mt-1 block text-xs text-muted-foreground">{region.techniques.map(technique => t(technique)).join(' · ')}</span></span>
      </Button>
    </li>)}</ul>
    {regions.length === 0 && <p className="text-sm text-muted-foreground">{t('No hay comunidades con estos filtros.')}</p>}
  </section>;
  return <div className="relative h-[420px] overflow-hidden rounded-lg border border-border bg-muted sm:h-[580px]">
    <div ref={container} className="h-full w-full" aria-label={t('Mapa de regiones de México')} />
    {!api && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground" role="status"><MapPin className="h-8 w-8 text-primary" /><p className="text-sm">{t(error || 'Cargando mapa…')}</p></div>}
  </div>;
}