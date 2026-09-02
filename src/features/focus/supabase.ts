import { supabase } from "../../lib/supabase";

import type {
  Group,
  GroupBadge,
  GroupMember,
  GroupType,
  ChatMessage,
  LeaderboardEntry,
} from "./types";

export interface FocusStats {
  totalSeconds: number;
  sessionCount: number;
  members: {
    userId: string;
    displayName: string;
    totalSeconds: number;
  }[];
  days: {
    date: string;
    seconds: number;
  }[];
}

type GroupRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  invite_code: string;
  avatar_url: string | null;
  is_private: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
  group_type: GroupType;
  badge_emoji: string | null;
  badge_color: string | null;
};

function mapGroup(
  row: GroupRow,
  memberIds: string[]
): Group {
  return {
    id: row.id,
    name: row.name,
    type: row.group_type,
    badge: {
      emoji:
        row.badge_emoji ??
        "📚",
      imageUrl:
        row.avatar_url ??
        undefined,
      color:
        row.badge_color ??
        "#0FA3A3",
    },
    inviteCode:
      row.invite_code,
    ownerId:
      row.owner_id,
    memberIds,
    createdAt:
      row.created_at,
  };
}

async function requireUser() {
  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  return user;
}

export async function getMyGroups(): Promise<
  Group[]
> {
  const user =
    await requireUser();

  const {
    data: memberships,
    error,
  } =
    await supabase
      .from("study_group_members")
      .select("group_id")
      .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  const groupIds =
    (memberships ?? []).map(
      (item) =>
        item.group_id
    );

  if (groupIds.length === 0) {
    return [];
  }

  const {
    data: rows,
    error: groupError,
  } =
    await supabase
      .from("study_groups")
      .select(
        "id, owner_id, name, description, invite_code, avatar_url, is_private, max_members, created_at, updated_at, group_type, badge_emoji, badge_color"
      )
      .in("id", groupIds)
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (groupError) {
    throw groupError;
  }

  const result: Group[] = [];

  for (const row of (rows ??
    []) as GroupRow[]) {
    const {
      data: groupMembers,
      error: memberError,
    } =
      await supabase
        .from(
          "study_group_members"
        )
        .select("user_id")
        .eq(
          "group_id",
          row.id
        );

    if (memberError) {
      throw memberError;
    }

    result.push(
      mapGroup(
        row,
        (groupMembers ?? []).map(
          (member) =>
            member.user_id
        )
      )
    );
  }

  return result;
}

export async function getGroupById(
  groupId: string
): Promise<Group | null> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_focus_group",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw error;
  }

  if (!data?.found) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    type:
      data.groupType as GroupType,
    badge: {
      emoji:
        data.badgeEmoji ??
        "📚",
      color:
        data.badgeColor ??
        "#0FA3A3",
      imageUrl:
        data.avatarUrl ??
        undefined,
    },
    inviteCode:
      data.inviteCode,
    ownerId:
      data.ownerId,
    memberIds:
      (data.memberIds ?? []) as string[],
    createdAt:
      data.createdAt,
  };
}

export async function getMyGroupRole(
  groupId: string
): Promise<
  "owner" | "admin" | "member" | null
> {
  const { data, error } =
    await supabase.rpc(
      "get_focus_member_role",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw error;
  }

  return (
    (data as
      | "owner"
      | "admin"
      | "member"
      | null) ??
    null
  );
}

export async function createFocusGroup(
  input: {
    name: string;
    type: GroupType;
    badge: GroupBadge;
  }
): Promise<Group> {
  const user =
    await requireUser();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_focus_group",
      {
        p_name:
          input.name.trim(),
        p_group_type:
          input.type,
        p_badge_emoji:
          input.badge.emoji ??
          "📚",
        p_badge_color:
          input.badge.color ??
          "#0FA3A3",
        p_avatar_url:
          input.badge.imageUrl ??
          null,
      }
    );

  if (error) {
    throw new Error(
      `Création du groupe: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Création du groupe: réponse vide."
    );
  }

  return {
    id: data.id,
    name: data.name,
    type:
      data.groupType as GroupType,
    badge: {
      emoji:
        data.badgeEmoji ??
        "📚",
      color:
        data.badgeColor ??
        "#0FA3A3",
      imageUrl:
        data.avatarUrl ??
        undefined,
    },
    inviteCode:
      data.inviteCode,
    ownerId:
      data.ownerId,
    memberIds: [
      user.id,
    ],
    createdAt:
      data.createdAt,
  };
}

export async function previewFocusGroup(
  code: string
) {
  await requireUser();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "preview_focus_group",
      {
        p_invite_code:
          code.trim().toUpperCase(),
      }
    );

  if (error) {
    throw error;
  }

  if (!data?.found) {
    return null;
  }

  return {
    id: data.id as string,
    name: data.name as string,
    type:
      data.groupType as GroupType,
    badge: {
      emoji:
        data.badgeEmoji ??
        "📚",
      color:
        data.badgeColor ??
        "#0FA3A3",
      imageUrl:
        data.avatarUrl ??
        undefined,
    },
    inviteCode:
      data.inviteCode as string,
    ownerId:
      data.ownerId as string,
    memberCount:
      Number(
        data.memberCount ?? 0
      ),
  };
}

export async function joinFocusGroup(
  code: string
): Promise<Group> {
  const user =
    await requireUser();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "join_focus_group",
      {
        p_invite_code:
          code.trim().toUpperCase(),
      }
    );

  if (error) {
    throw new Error(
      `Rejoindre le groupe: ${error.message}`
    );
  }

  return {
    id: data.id,
    name: data.name,
    type:
      data.groupType as GroupType,
    badge: {
      emoji:
        data.badgeEmoji ??
        "📚",
      color:
        data.badgeColor ??
        "#0FA3A3",
      imageUrl:
        data.avatarUrl ??
        undefined,
    },
    inviteCode:
      data.inviteCode,
    ownerId:
      data.ownerId,
    memberIds: [
      user.id,
    ],
    createdAt:
      data.createdAt ??
      new Date().toISOString(),
  };
}

export async function leaveFocusGroup(
  groupId: string
) {
  const {
    error,
  } =
    await supabase.rpc(
      "leave_focus_group",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw new Error(
      `Quitter le groupe: ${error.message}`
    );
  }
}

export async function getGroupMembers(
  groupId: string
): Promise<GroupMember[]> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_focus_group_members",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw new Error(
      `Membres: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as GroupMember[];
}

export async function setMemberRole(
  groupId: string,
  userId: string,
  role: "admin" | "member"
) {
  const {
    error,
  } =
    await supabase.rpc(
      "set_focus_member_role",
      {
        p_group_id:
          groupId,
        p_user_id:
          userId,
        p_role:
          role,
      }
    );

  if (error) {
    throw new Error(
      `Rôle: ${error.message}`
    );
  }
}

export async function removeMember(
  groupId: string,
  userId: string
) {
  const {
    error,
  } =
    await supabase.rpc(
      "remove_focus_member",
      {
        p_group_id:
          groupId,
        p_user_id:
          userId,
      }
    );

  if (error) {
    throw new Error(
      `Retrait: ${error.message}`
    );
  }
}

export async function updateFocusGroup(
  groupId: string,
  input: {
    name: string;
    badge: GroupBadge;
  }
) {
  const {
    error,
  } =
    await supabase.rpc(
      "update_focus_group",
      {
        p_group_id:
          groupId,
        p_name:
          input.name.trim(),
        p_badge_emoji:
          input.badge.emoji ??
          "📚",
        p_badge_color:
          input.badge.color ??
          "#0FA3A3",
        p_avatar_url:
          input.badge.imageUrl ??
          null,
      }
    );

  if (error) {
    throw new Error(
      `Réglages: ${error.message}`
    );
  }
}

export async function regenerateInvite(
  groupId: string
): Promise<string> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "regenerate_focus_invite",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw new Error(
      `Code: ${error.message}`
    );
  }

  return data.inviteCode as string;
}

export async function deleteFocusGroup(
  groupId: string
) {
  const {
    error,
  } =
    await supabase.rpc(
      "delete_focus_group",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw new Error(
      `Suppression: ${error.message}`
    );
  }
}

export async function getGroupMessages(
  groupId: string
): Promise<ChatMessage[]> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_focus_group_messages",
      {
        p_group_id:
          groupId,
      }
    );

  if (error) {
    throw new Error(
      `Chat: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as ChatMessage[];
}

export async function sendGroupMessage(
  groupId: string,
  text: string
) {
  const user =
    await requireUser();

  const clean =
    text.trim();

  if (!clean) {
    return;
  }

  const {
    error,
  } =
    await supabase
      .from("group_messages")
      .insert({
        group_id:
          groupId,
        user_id:
          user.id,
        message:
          clean,
      });

  if (error) {
    throw new Error(
      `Message: ${error.message}`
    );
  }
}

export async function getLeaderboard(
  groupId: string,
  range: "week" | "month" | "all"
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc(
    "get_focus_leaderboard",
    {
      p_group_id: groupId,
      p_range: range,
    }
  );

  if (error) {
    throw new Error(`Classement: ${error.message}`);
  }

  return (data ?? []) as LeaderboardEntry[];
}

export async function getGroupStats(
  groupId: string,
  range:
    | "week"
    | "month"
    | "all"
): Promise<FocusStats> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_focus_group_stats",
      {
        p_group_id:
          groupId,
        p_range:
          range,
      }
    );

  if (error) {
    throw new Error(
      `Stats: ${error.message}`
    );
  }

  return data as FocusStats;
}

export async function saveSupabaseFocusSession(
  input: {
    groupId?: string;
    subject?: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
  }
) {
  const user =
    await requireUser();

  const {
    error,
  } =
    await supabase
      .from("focus_sessions")
      .insert({
        user_id:
          user.id,
        group_id:
          input.groupId ??
          null,
        subject:
          input.subject ??
          null,
        started_at:
          input.startedAt,
        ended_at:
          input.endedAt,
        planned_minutes:
          Math.ceil(
            input.durationSeconds /
              60
          ),
        actual_seconds:
          input.durationSeconds,
        status:
          "completed",
      });

  if (error) {
    throw new Error(
      `Session Focus: ${error.message}`
    );
  }
}

export async function uploadGroupImage(
  groupId: string,
  file: File
): Promise<string> {
  await requireUser();

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];

  if (
    !allowed.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format accepté : JPG, JPEG, PNG, WebP ou SVG."
    );
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    throw new Error(
      "L'image doit faire moins de 5 Mo."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ??
    "png";

  const path =
    `groups/${groupId}/${crypto.randomUUID()}.${extension}`;

  const {
    error,
  } =
    await supabase.storage
      .from(
        "mentionmax-images"
      )
      .upload(
        path,
        file,
        {
          upsert: false,
          contentType:
            file.type,
        }
      );

  if (error) {
    throw new Error(
      `Image du groupe: ${error.message}`
    );
  }

  const {
    data,
  } =
    supabase.storage
      .from(
        "mentionmax-images"
      )
      .getPublicUrl(path);

  return data.publicUrl;
}

export async function uploadProfileImage(
  file: File
): Promise<string> {
  const user =
    await requireUser();

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];

  if (
    !allowed.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format accepté : JPG, JPEG, PNG, WebP ou SVG."
    );
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    throw new Error(
      "L'image doit faire moins de 5 Mo."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ??
    "png";

  const path =
    `${user.id}/profile/${crypto.randomUUID()}.${extension}`;

  const {
    error,
  } =
    await supabase.storage
      .from(
        "mentionmax-images"
      )
      .upload(
        path,
        file,
        {
          upsert: false,
          contentType:
            file.type,
        }
      );

  if (error) {
    throw new Error(
      `Photo de profil: ${error.message}`
    );
  }

  const {
    data,
  } =
    supabase.storage
      .from(
        "mentionmax-images"
      )
      .getPublicUrl(path);

  const avatarUrl =
    data.publicUrl;

  const {
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .update({
        avatar_url:
          avatarUrl,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        user.id
      );

  if (profileError) {
    throw new Error(
      `Profil: ${profileError.message}`
    );
  }

  return avatarUrl;
}

export async function getUserProfile(
  userId: string
): Promise<{
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
} | null> {
  console.log("🔍 getUserProfile - fetching for:", userId);
  
  const { data, error } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

  console.log("📦 getUserProfile - data:", data);
  console.log("⚠️ getUserProfile - error:", error);

  if (error) {
    console.error("❌ getUserProfile error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(
      `Profil utilisateur: ${error.message}`
    );
  }

  if (!data) {
    console.warn("⚠️ getUserProfile - No data returned for user:", userId);
  }

  return data;
}
