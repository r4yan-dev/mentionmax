import type {
  FocusSession,
  Group,
  GroupMember,
  ChatMessage,
} from "./types";

const SESSIONS_KEY =
  "mentionmax:focus:sessions:v1";

const GROUPS_KEY =
  "mentionmax:focus:groups:v1";

const MEMBERS_KEY =
  "mentionmax:focus:members:v1";

const MESSAGES_KEY =
  "mentionmax:focus:messages:v1";

function read<T>(
  key: string,
  fallback: T
): T {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(
  key: string,
  value: T
) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}

export function getSessions(): FocusSession[] {
  return read(SESSIONS_KEY, []);
}

export function saveSession(
  session: FocusSession
) {
  const sessions = getSessions();

  write(
    SESSIONS_KEY,
    [
      session,
      ...sessions.filter(
        (item) =>
          item.id !== session.id
      ),
    ]
  );
}

export function getGroups(): Group[] {
  return read(GROUPS_KEY, []);
}

export function saveGroups(
  groups: Group[]
) {
  write(GROUPS_KEY, groups);
}

export function getMembers(): GroupMember[] {
  return read(MEMBERS_KEY, []);
}

export function saveMembers(
  members: GroupMember[]
) {
  write(MEMBERS_KEY, members);
}

export function getMessages(): ChatMessage[] {
  return read(MESSAGES_KEY, []);
}

export function saveMessages(
  messages: ChatMessage[]
) {
  write(MESSAGES_KEY, messages);
}

export function addGroup(
  group: Group
) {
  saveGroups([
    group,
    ...getGroups().filter(
      (item) =>
        item.id !== group.id
    ),
  ]);
}

export function addMember(
  member: GroupMember
) {
  saveMembers([
    member,
    ...getMembers().filter(
      (item) =>
        !(
          item.groupId === member.groupId &&
          item.userId === member.userId
        )
    ),
  ]);
}

export function getUserGroups(
  userId: string
) {
  const groups = getGroups();

  return groups.filter(
    (group) =>
      group.memberIds.includes(userId)
  );
}

export function getGroup(
  groupId: string
) {
  return getGroups().find(
    (group) =>
      group.id === groupId
  );
}

export function getGroupMembers(
  groupId: string
) {
  return getMembers().filter(
    (member) =>
      member.groupId === groupId
  );
}
