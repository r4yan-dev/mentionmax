import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { mentiSupabase, supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolPreferences {
  user_id: string;
  track: "SPC" | "SM";
  section: "A" | "B" | null;
  created_at: string;
  updated_at: string;
}

interface AccountContextValue {
  profile: Profile | null;
  schoolPreferences: SchoolPreferences | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshSchoolPreferences: () => Promise<void>;
  updateProfileName: (displayName: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

function fallbackDisplayName(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const metadataName = typeof user.user_metadata?.display_name === "string"
    ? user.user_metadata.display_name.trim()
    : "";
  return metadataName || user.email?.split("@")[0] || "Élève";
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schoolPreferences, setSchoolPreferences] = useState<SchoolPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile:", error);
      return;
    }

    if (data) {
      setProfile(data as Profile);
      return;
    }

    const now = new Date().toISOString();
    const defaultProfile = {
      id: user.id,
      display_name: fallbackDisplayName(user),
      avatar_url: typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null,
      created_at: now,
      updated_at: now,
    };

    const { data: created, error: createError } = await supabase
      .from("profiles")
      .upsert(defaultProfile, { onConflict: "id" })
      .select("*")
      .single();

    if (createError) {
      console.error("Failed to create profile:", createError);
      return;
    }

    setProfile(created as Profile);
  }

  async function refreshSchoolPreferences() {
    if (!user) {
      setSchoolPreferences(null);
      return;
    }

    const { data, error } = await supabase
      .from("school_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load school preferences:", error);
      return;
    }

    setSchoolPreferences((data as SchoolPreferences | null) ?? null);
  }

  async function updateProfileName(displayName: string) {
    if (!user) throw new Error("Utilisateur non connecté.");
    const cleanName = displayName.trim();
    if (!cleanName) throw new Error("Le nom ne peut pas être vide.");
    if (cleanName.length > 40) throw new Error("Le nom doit contenir au maximum 40 caractères.");

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: cleanName,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Nom: ${error.message}`);
    }

    setProfile(data as Profile);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      throw new Error("Session introuvable pour synchroniser le classement.");
    }

    const { data: syncData, error: syncError } = await mentiSupabase.functions.invoke("sync-leaderboard-name", {
      body: { display_name: cleanName },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (syncError) {
      throw new Error(`Classement: ${syncError.message}`);
    }

    if (syncData?.synced === false && syncData?.reason !== "no_identity_link") {
      throw new Error("Impossible de synchroniser le nom dans le classement.");
    }
  }

  useEffect(() => {
    let mounted = true;
    async function loadAccount() {
      if (!user) {
        setProfile(null);
        setSchoolPreferences(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      await Promise.all([refreshProfile(), refreshSchoolPreferences()]);
      if (mounted) setLoading(false);
    }
    void loadAccount();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel(`profile:${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "DELETE") {
          setProfile(null);
          return;
        }
        setProfile(payload.new as Profile);
      })
      .subscribe();

    const preferencesChannel = supabase
      .channel(`school-preferences:${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "school_preferences",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "DELETE") {
          setSchoolPreferences(null);
          return;
        }
        setSchoolPreferences(payload.new as SchoolPreferences);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(preferencesChannel);
    };
  }, [user?.id]);

  return (
    <AccountContext.Provider value={{
      profile,
      schoolPreferences,
      loading,
      refreshProfile,
      refreshSchoolPreferences,
      updateProfileName,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount must be used inside AccountProvider");
  return context;
}
