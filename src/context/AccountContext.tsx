import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../lib/supabase";
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

    setProfile((data as Profile | null) ?? null);
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
      .update({ display_name: cleanName, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Nom: ${error.message}`);
    }

    setProfile(data as Profile);
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
