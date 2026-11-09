import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const profileOptions = (userId: string) => queryOptions({
  queryKey: ['promoter-profile', userId],
  queryFn: async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      if (error.code === 'PGRST116') {
        return {
          profile: {
            id: userId,
            avatar_path: null,
            bio: "",
            communities: "",
            credential: "",
            display_name: "",
            ethics_accepted: false,
            experience_years: 0,
            official_id: "",
            organization: "",
            professional_email: "",
            professional_title: "",
            region: "Oaxaca",
            specialties: [] as string[],
            submitted_at: null,
            updated_at: new Date().toISOString(),
          },
          photo: null,
        };
      }
      throw error;
    }
    let photo: string | null = null;
    if (data.avatar_path) {
      const result = await supabase.storage.from('promoter-photos').createSignedUrl(data.avatar_path, 3600);
      if (!result.error) {
        photo = result.data.signedUrl;
      }
    }
    return { profile: data, photo };
  },
  staleTime: 60_000,
});