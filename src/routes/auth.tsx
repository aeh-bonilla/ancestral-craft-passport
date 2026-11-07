import { useI18n } from "@/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/toltek/ui";
import { useAccount } from "@/components/toltek/AuthProvider";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { protectedDestination } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ next: protectedDestination(search['next']) }),
  head: () => ({ meta: [
    { title: "Acceso de Promotores — Tlamatik" },
    { name: "description", content: "Accede con Google a tu perfil profesional y al registro de obras de Tlamatik." },
    { property: "og:title", content: "Acceso de Promotores — Tlamatik" },
    { property: "og:description", content: "Ingreso seguro al Panel del Promotor Cultural." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { next } = Route.useSearch();
  const { user, loading } = useAccount();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    const destination = protectedDestination(sessionStorage.getItem('tlamatik-auth-next') ?? next);
    sessionStorage.removeItem('tlamatik-auth-next');
    void navigate({ to: destination, replace: true });
  }, [user, next, navigate]);
  const signIn = async () => {
    setBusy(true); setError("");
    sessionStorage.setItem('tlamatik-auth-next', next);
    try {
      const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth`, extraParams: { prompt: 'select_account' } });
      if (result.error) throw result.error;
      if (result.redirected) return;
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw authError ?? new Error('No se pudo confirmar la sesión.');
      await navigate({ to: next, replace: true });
    } catch { setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  };
  return <section className="mx-auto flex min-h-[65vh] max-w-md flex-col items-center justify-center px-5 py-14 text-center">
    <Logo />
    <ShieldCheck className="mt-8 h-8 w-8 text-gold" />
    <h1 className="mt-4 text-3xl font-semibold">{t("Acceso del Promotor")}</h1>
    <p className="mt-3 text-sm text-muted-foreground">{t("Inicia sesión o crea tu cuenta con Google.")}</p>
    <Button onClick={signIn} disabled={busy || loading || Boolean(user)} className="google-sign-in mt-7 w-full">
      {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <svg aria-hidden="true" className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>}{" "}{t("Continuar con Google")}</Button>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{t(error)}</p>}
    <Button asChild variant="link" className="mt-5"><Link to="/">{t("Volver a Inicio")}</Link></Button>
  </section>;
}