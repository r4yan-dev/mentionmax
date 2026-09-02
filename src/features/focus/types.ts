export type GroupType =
  | "school"
  | "class"
  | "private";

export type GroupRole =
  | "owner"
  | "admin"
  | "member";

export interface GroupBadge {
  emoji?: string;
  imageUrl?: string;
  color: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  groupId?: string;
  subject?: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  badge: GroupBadge;
  inviteCode: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: GroupRole;
  joinedAt: string;
  displayName: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  text: string;
  sentAt: string;
  displayName: string;
  avatarUrl?: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalSeconds: number;
  rank: number;
}

export interface FocusStore {
  sessions: FocusSession[];
  groups: Group[];
  members: GroupMember[];
  messages: ChatMessage[];
}
