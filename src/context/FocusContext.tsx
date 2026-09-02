import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

import {
  createFocusGroup,
  getMyGroups,
  joinFocusGroup,
  saveSupabaseFocusSession,
} from "../features/focus/supabase";

import {
  getSessions,
  saveSession,
} from "../features/focus/storage";

import type {
  FocusSession,
  Group,
  GroupBadge,
  GroupMember,
  GroupType,
} from "../features/focus/types";

interface CreateGroupInput {
  name: string;
  type: GroupType;
  badge: GroupBadge;
}

interface FocusContextValue {
  groups: Group[];
  sessions: FocusSession[];
  members: GroupMember[];
  loading: boolean;
  error: string;

  createGroup: (
    input: CreateGroupInput
  ) => Promise<Group>;

  joinGroup: (
    code: string
  ) => Promise<Group>;

  saveFocusSession: (
    session: FocusSession
  ) => void;

  refresh: () => Promise<void>;
}

const FocusContext =
  createContext<
    FocusContextValue | undefined
  >(undefined);

export function FocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [sessions, setSessions] =
    useState<FocusSession[]>(
      getSessions()
    );

  const [members, setMembers] =
    useState<GroupMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const refresh = async () => {
    if (!user) {
      setGroups([]);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const nextGroups =
        await getMyGroups();

      setGroups(nextGroups);

      setMembers([]);
    } catch (err) {
      console.error(
        "Failed to load Focus groups:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les groupes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const groupsChannel =
      supabase
        .channel(
          `focus-groups:${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "study_groups",
          },
          () => {
            refresh();
          }
        )
        .subscribe();

    const membersChannel =
      supabase
        .channel(
          `focus-members:${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "study_group_members",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            refresh();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        groupsChannel
      );

      supabase.removeChannel(
        membersChannel
      );
    };
  }, [user?.id]);

  async function createGroup(
    input: CreateGroupInput
  ) {
    const group =
      await createFocusGroup(
        input
      );

    setGroups((current) => {
      const exists =
        current.some(
          (item) =>
            item.id === group.id
        );

      if (exists) {
        return current;
      }

      return [
        group,
        ...current,
      ];
    });

    await refresh();

    return group;
  }

  async function joinGroup(
    code: string
  ) {
    const group =
      await joinFocusGroup(code);

    await refresh();

    return group;
  }

  async function saveFocusSession(
    session: FocusSession
  ) {
    await saveSupabaseFocusSession({
      groupId:
        session.groupId,
      subject:
        session.subject,
      startedAt:
        session.startedAt,
      endedAt:
        session.endedAt,
      durationSeconds:
        session.durationSeconds,
    });

    saveSession(session);

    setSessions(
      getSessions()
    );
  }

  const value = useMemo(
    () => ({
      groups,
      sessions,
      members,
      loading,
      error,
      createGroup,
      joinGroup,
      saveFocusSession,
      refresh,
    }),
    [
      groups,
      sessions,
      members,
      loading,
      error,
    ]
  );

  return (
    <FocusContext.Provider
      value={value}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context =
    useContext(FocusContext);

  if (!context) {
    throw new Error(
      "useFocus must be used inside FocusProvider"
    );
  }

  return context;
}
