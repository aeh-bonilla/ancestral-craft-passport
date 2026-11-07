import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const profileOptions = (userId: string) => queryOptions({
  queryKey: ['promoter-profile', userId],
  queryFn: async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    let photo: string | null = null;
    if (data.avatar_path) {
      const result = await supabase.storage.from('promoter-photos').createSignedUrl(data.avatar_path, 3600);
      if (result.error) throw result.error;
      photo = result.data.signedUrl;
    }
    return { profile: data, photo };
  },
  staleTime: 60_000,
});