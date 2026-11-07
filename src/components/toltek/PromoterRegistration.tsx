import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { profileOptions } from "@/lib/promoter-profile";
import { supabase } from "@/integrations/supabase/client";
import { BadgeCheck, Camera, MapPin, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const roles = ["Antropólogo(a) / Etnólogo(a)", "Curador(a) de Arte Popular", "Gestor(a) Cultural", "Maestro(a) Artesano(a) Certificador(a)", "Representante de Cooperativa"];
const specialties = ["Alfarería y Barro", "Textil y Telar", "Madera y Tallado", "Laca y Maque", "Metalistería", "Talavera y Cerámica", "Fibras Naturales", "Máscaras y Danza"];
const states = ["Oaxaca", "Chiapas", "Guerrero", "Michoacán", "Puebla", "Jalisco", "Estado de México", "Yucatán", "Otro (Latinoamérica)"];

const sel = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function PromoterRegistration() {
  const { user } = getRouteApi('/_authenticated').useRouteContext();
  const { data: { profile, photo: savedPhoto } } = useSuspenseQuery(profileOptions(user.id));
  const queryClient = useQueryClient();
  const [photo, setPhoto] = useState<string | null>(savedPhoto);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [picked, setPicked] = useState<string[]>(profile.specialties);
  const [accept, setAccept] = useState(profile.ethics_accepted);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(Boolean(profile.submitted_at));
  const [f, setF] = useState({ name: profile.display_name, curp: profile.official_id, email: profile.professional_email, role: profile.professional_title, org: profile.organization, cedula: profile.credential, years: String(profile.experience_years), state: profile.region, communities: profile.communities, bio: profile.bio });
  useEffect(() => () => { if (photo?.startsWith('blob:')) URL.revokeObjectURL(photo); }, [photo]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("La foto debe pesar menos de 5 MB"); return; }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { toast.error("Selecciona una foto JPG o PNG"); return; }
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
  };
  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = async () => {
    if (!f.name || !f.email || !f.role || !f.state || picked.length === 0) { toast.error("Completa nombre, correo, perfil, región y al menos una especialidad"); return; }
    if (!photo) { toast.error("Agrega una foto del promotor"); return; }
    if (!accept) { toast.error("Acepta el código de ética de certificación"); return; }
    if (!Number.isInteger(Number(f.years)) || Number(f.years) < 0) { toast.error("Revisa los años de experiencia"); return; }
    setBusy(true);
    try {
      let avatarPath = profile.avatar_path;
      if (photoFile) {
        avatarPath = `${user.id}/${crypto.randomUUID()}.${photoFile.type === 'image/png' ? 'png' : 'jpg'}`;
        const upload = await supabase.storage.from('promoter-photos').upload(avatarPath, photoFile);
        if (upload.error) throw upload.error;
      }
      const result = await supabase.from('profiles').update({ display_name: f.name.trim(), official_id: f.curp, professional_email: f.email.trim(), professional_title: f.role, organization: f.org, credential: f.cedula, experience_years: Number(f.years), region: f.state, communities: f.communities, bio: f.bio, specialties: picked, ethics_accepted: accept, avatar_path: avatarPath, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', user.id).select('id').single();
      if (result.error) throw result.error;
      await queryClient.invalidateQueries({ queryKey: ['promoter-profile', user.id] });
      setPhotoFile(null);
      setDone(true);
      toast.success("Perfil guardado");
    } catch { toast.error("No se pudo guardar el perfil. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  };

  if (done) return (
    <div className="rounded-2xl border bg-card p-8 text-center shadow-float">
      {photo && <img src={photo} alt={f.name} className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-gold/60" />}
      <BadgeCheck className="mx-auto mt-4 h-8 w-8 text-jade" />
      <h2 className="mt-2 font-display text-2xl">{f.name}</h2>
      <p className="text-sm text-muted-foreground">{f.role} · {f.state}</p>
      <p className="mx-auto mt-3 max-w-md text-sm">Perfil profesional guardado · <b>{picked.join(", ")}</b></p>
      <Button variant="outline" className="mt-5" onClick={() => setDone(false)}>Editar registro</Button>
    </div>
  );

  return (
    <div className="rounded-2xl border bg-card shadow-float">
      <div className="border-b p-6">
        <h2 className="font-display text-2xl">Registro del Promotor Certificador</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tu perfil respalda la originalidad, la técnica y la procedencia de cada pieza que certifiques.</p>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-[180px_1fr]">
        <label className="flex cursor-pointer flex-col items-center gap-2 self-start">
          <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-secondary">
            {photo ? <img src={photo} alt="Foto del promotor" className="h-full w-full object-cover" /> : <Camera className="h-8 w-8 text-primary/60" />}
          </div>
          <span className="text-sm font-medium text-primary">{photo ? "Cambiar foto" : "Subir foto"}</span>
          <span className="text-center text-xs text-muted-foreground">Rostro visible · JPG/PNG · máx. 5 MB</span>
          <input aria-label="Foto del promotor" type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
        </label>

        <div className="space-y-5">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identidad</legend>
            <div className="space-y-1.5"><Label>Nombre completo *</Label><Input value={f.name} onChange={set("name")} placeholder="Mtra. Elena Ruiz Matus" /></div>
            <div className="space-y-1.5"><Label>CURP / ID oficial</Label><Input value={f.curp} onChange={set("curp")} placeholder="RUME850312MOCZTL09" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Correo profesional *</Label><Input type="email" value={f.email} onChange={set("email")} placeholder="elena@cooperativa.mx" /></div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Perfil profesional</legend>
            <div className="space-y-1.5"><Label>Perfil *</Label><select className={sel} value={f.role} onChange={set("role")}><option value="">Selecciona…</option>{roles.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Institución / Cooperativa</Label><Input value={f.org} onChange={set("org")} placeholder="Cooperativa Guelaguetza" /></div>
            <div className="space-y-1.5"><Label>Cédula o certificación</Label><Input value={f.cedula} onChange={set("cedula")} placeholder="Cédula 12345678 / FONART" /></div>
            <div className="space-y-1.5"><Label>Años de experiencia</Label><Input type="number" min={0} value={f.years} onChange={set("years")} placeholder="12" /></div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Técnicas que puede autenticar *</legend>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <Button type="button" key={s} variant={picked.includes(s) ? 'default' : 'outline'} size="sm" aria-pressed={picked.includes(s)} onClick={() => toggle(s)} className="rounded-full text-xs">{s}</Button>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Región de procedencia</legend>
            <div className="space-y-1.5"><Label>Estado / región *</Label><select className={sel} value={f.state} onChange={set("state")}><option value="">Selecciona…</option>{states.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div className="space-y-1.5"><Label>Comunidades que acompaña</Label><Input value={f.communities} onChange={set("communities")} placeholder="Tilcajete, Coyotepec, Arrazola" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Trayectoria breve</Label><Textarea rows={3} value={f.bio} onChange={set("bio")} placeholder="Investigación de campo, curadurías, vínculo con talleres…" /></div>
          </fieldset>

          <label className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
            <Checkbox checked={accept} onCheckedChange={(v) => setAccept(v === true)} className="mt-0.5" />
            <span>Me comprometo con el código de ética Tlamatik: certificar solo piezas cuya autoría, técnica y origen haya verificado, respetando el consentimiento de cada comunidad.</span>
          </label>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-jade" /> Tu firma quedará vinculada a cada pasaporte en Stellar.</p>
            <Button onClick={submit} disabled={busy}>{busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : "Enviar registro"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
