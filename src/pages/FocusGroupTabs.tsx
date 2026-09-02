import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getLeaderboard,
  getGroupMessages,
  getGroupMembers,
  getGroupStats,
  getMyGroupRole,
  leaveFocusGroup,
  removeMember,
  sendGroupMessage,
  setMemberRole,
  updateFocusGroup,
  regenerateInvite,
  deleteFocusGroup,
  uploadGroupImage,
} from "../features/focus/supabase";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useFocus,
} from "../context/FocusContext";

import {
  BadgePicker,
} from "../components/focus/BadgePicker";

import type {
  GroupBadge,
  GroupMember,
} from "../features/focus/types";

type Range =
  | "week"
  | "month"
  | "all";

function formatSeconds(
  seconds: number
) {
  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  return `${minutes} min`;
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    "fr-FR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
}

export function GroupLeaderboard() {
  const { groupId } =
    useParams();

  const {
    groups,
  } = useFocus();

  const group =
    groups.find(
      (item) =>
        item.id === groupId
    );

  const [range, setRange] =
    useState<Range>("week");

  const [rows, setRows] =
    useState<
      Awaited<
        ReturnType<
          typeof getLeaderboard
        >
      >
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!groupId) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!groupId) {
          return;
        }

        const data =
          await getLeaderboard(
            groupId,
            range
          );

        if (!cancelled) {
          setRows(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger le classement."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [groupId, range]);

  if (!groupId) {
    return (
      <section className="group-live-panel">
        <div className="group-live-error">
          Groupe introuvable.
        </div>
      </section>
    );
  }

  return (
    <section className="group-live-panel">
      <div className="group-panel-header">
        <div>
          <span className="section-eyebrow">
            Classement
          </span>

          <h2>
            Qui a le plus focus ?
          </h2>
        </div>

        <RangeSwitch
          value={range}
          onChange={setRange}
        />
      </div>

      {error && (
        <div className="group-live-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="group-loading">
          Chargement...
        </div>
      ) : rows.length === 0 ? (
        <div className="group-empty-state">
          Aucune session Focus pour cette période.
        </div>
      ) : (
        <div className="leaderboard-list">
          {rows.map((entry) => (
            <div
              key={entry.userId}
              className={`leaderboard-row${
                entry.userId ===
                group?.ownerId
                  ? " creator-row"
                  : ""
              }`}
            >
              <span className="leaderboard-rank">
                #{entry.rank}
              </span>

              <div className="leaderboard-avatar">
                {entry.avatarUrl ? (
                  <img
                    src={entry.avatarUrl}
                    alt=""
                  />
                ) : (
                  entry.displayName
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div className="leaderboard-name">
                <strong>
                  {entry.displayName}
                </strong>

                {entry.userId ===
                  group?.ownerId && (
                  <span className="role-badge creator">
                    Créateur
                  </span>
                )}
              </div>

              <strong className="leaderboard-time">
                {formatSeconds(
                  entry.totalSeconds
                )}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function GroupChat() {
  const { groupId } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [messages, setMessages] =
    useState<
      Awaited<
        ReturnType<
          typeof getGroupMessages
        >
      >
    >([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const selectedMessage =
    messages.find(
      (m) =>
        m.userId === selectedUserId
    );

  async function load() {
    if (!groupId) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getGroupMessages(
          groupId
        );

      setMessages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le chat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    const channel =
      supabase
        .channel(
          `group-chat:${groupId}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "group_messages",
            filter:
              `group_id=eq.${groupId}`,
          },
          () => {
            load();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [groupId]);

  async function send() {
    if (
      !groupId ||
      !text.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      await sendGroupMessage(
        groupId,
        text
      );

      setText("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer le message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="group-chat-panel">
      <div className="group-panel-header">
        <div>
          <span className="section-eyebrow">
            Discussion
          </span>

          <h2>
            Chat du groupe
          </h2>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="group-loading">
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div className="group-empty-state">
            Aucun message. Lance la discussion.
          </div>
        ) : (
          messages.map(
            (message) => (
              <article
                key={message.id}
                className={`chat-message${
                  message.userId ===
                  user?.id
                    ? " own"
                    : ""
                }`}
              >
                <div
                  className="chat-avatar"
                  style={{
                    cursor:
                      message.userId !==
                      user?.id
                        ? "pointer"
                        : undefined,
                  }}
                  onClick={() => {
                    if (
                      message.userId !==
                      user?.id
                    ) {
                      setSelectedUserId(
                        message.userId
                      );
                    }
                  }}
                >
                  {message.avatarUrl ? (
                    <img
                      src={
                        message.avatarUrl
                      }
                      alt=""
                    />
                  ) : (
                    message.displayName
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>

                <div className="chat-message-body">
                  <div className="chat-message-meta">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => {
                        if (
                          message.userId !==
                          user?.id
                        ) {
                          setSelectedUserId(
                            message.userId
                          );
                        }
                      }}
                      style={{
                        cursor:
                          message.userId !==
                          user?.id
                            ? "pointer"
                            : "default",
                        padding: 0,
                        background:
                          "none",
                        border: "none",
                        color:
                          "var(--mm-ink-900)",
                        fontSize: "11px",
                        fontWeight: 600,
                        textAlign: "left",
                      }}
                    >
                      {message.displayName}
                    </button>

                    <span>
                      {formatDate(
                        message.sentAt
                      )}
                    </span>
                  </div>

                  <p>
                    {message.text}
                  </p>
                </div>
              </article>
            )
          )
        )}
      </div>

      {error && (
        <div className="group-live-error">
          {error}
        </div>
      )}

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          className="input"
          value={text}
          onChange={(event) =>
            setText(
              event.target.value
            )
          }
          placeholder="Écrire un message..."
          maxLength={1000}
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            sending ||
            !text.trim()
          }
        >
          Envoyer
        </button>
      </form>

      {selectedMessage && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedUserId(null)
          }
        >
          <div
            className="user-preview-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedUserId(null)
              }
            >
              ×
            </button>

            <div
              className="user-preview-avatar"
              style={{
                backgroundImage:
                  selectedMessage.avatarUrl
                    ? `url(${selectedMessage.avatarUrl})`
                    : undefined,
                backgroundSize:
                  "cover",
                backgroundPosition:
                  "center",
              }}
            >
              {!selectedMessage.avatarUrl &&
                selectedMessage.displayName
                  .slice(0, 2)
                  .toUpperCase()}
            </div>

            <h3>
              {selectedMessage.displayName}
            </h3>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                navigate(
                  `/profil/${selectedMessage.userId}`
                );
                setSelectedUserId(null);
              }}
            >
              Voir profil
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function GroupStats() {
  const { groupId } =
    useParams();

  const [range, setRange] =
    useState<Range>("week");

  const [stats, setStats] =
    useState<
      Awaited<
        ReturnType<
          typeof getGroupStats
        >
      > | null
    >(null);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    getGroupStats(
      groupId,
      range
    ).then(setStats)
      .catch(console.error);
  }, [groupId, range]);

  return (
    <section className="group-live-panel">
      <div className="group-panel-header">
        <div>
          <span className="section-eyebrow">
            Statistiques
          </span>

          <h2>
            Activité du groupe
          </h2>
        </div>

        <RangeSwitch
          value={range}
          onChange={setRange}
        />
      </div>

      {!stats ? (
        <div className="group-loading">
          Chargement...
        </div>
      ) : (
        <>
          <div className="focus-stat-grid">
            <div className="focus-stat-card">
              <span>
                Temps total
              </span>

              <strong>
                {formatSeconds(
                  stats.totalSeconds
                )}
              </strong>
            </div>

            <div className="focus-stat-card">
              <span>
                Sessions
              </span>

              <strong>
                {stats.sessionCount}
              </strong>
            </div>

            <div className="focus-stat-card">
              <span>
                Membres actifs
              </span>

              <strong>
                {stats.members.length}
              </strong>
            </div>
          </div>

          <div className="stats-member-list">
            {stats.members.map(
              (member) => (
                <div
                  key={member.userId}
                  className="stats-member-row"
                >
                  <strong>
                    {member.displayName}
                  </strong>

                  <span>
                    {formatSeconds(
                      member.totalSeconds
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}

export function GroupMembers() {
  const {
    groupId,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const [selectedMemberId, setSelectedMemberId] =
    useState<string | null>(null);

  const {
    groups,
    refresh,
  } = useFocus();

  const group =
    groups.find(
      (item) =>
        item.id === groupId
    );

  const [members, setMembers] =
    useState<GroupMember[]>([]);

  const [error, setError] =
    useState("");

  async function load() {
    if (!groupId) {
      return;
    }

    try {
      setMembers(
        await getGroupMembers(
          groupId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les membres."
      );
    }
  }

  useEffect(() => {
    load();
  }, [groupId]);

  const isCreator =
    group?.ownerId ===
    user?.id;

  async function changeRole(
    member: GroupMember
  ) {
    if (!groupId || !isCreator) {
      return;
    }

    try {
      await setMemberRole(
        groupId,
        member.userId,
        member.role ===
          "admin"
          ? "member"
          : "admin"
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le rôle."
      );
    }
  }

  async function remove(
    member: GroupMember
  ) {
    if (!groupId || !isCreator) {
      return;
    }

    if (
      !window.confirm(
        `Retirer ${member.displayName} du groupe ?`
      )
    ) {
      return;
    }

    try {
      await removeMember(
        groupId,
        member.userId
      );

      await load();
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de retirer le membre."
      );
    }
  }

  return (
    <section className="group-live-panel">
      <div className="group-panel-header">
        <div>
          <span className="section-eyebrow">
            Membres
          </span>

          <h2>
            {members.length} membre
            {members.length !== 1
              ? "s"
              : ""}
          </h2>
        </div>
      </div>

      {error && (
        <div className="group-live-error">
          {error}
        </div>
      )}

      <div className="members-list">
        {members.map(
          (member) => {
            const creator =
              member.userId ===
              group?.ownerId;

            return (
              <div
                key={member.userId}
                className="member-row"
              >
                <div
                  className="member-avatar"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setSelectedMemberId(
                      member.userId
                    )
                  }
                >
                  {member.avatarUrl ? (
                    <img
                      src={
                        member.avatarUrl
                      }
                      alt=""
                    />
                  ) : (
                    member.displayName
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>

                <div className="member-identity">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() =>
                      setSelectedMemberId(
                        member.userId
                      )
                    }
                    style={{
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                      border: "none",
                      color:
                        "var(--mm-ink-900)",
                      fontSize: "11px",
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    {member.displayName}
                  </button>

                  <div className="member-roles">
                    {creator && (
                      <span className="role-badge creator">
                        Créateur
                      </span>
                    )}

                    {!creator &&
                      member.role ===
                        "admin" && (
                        <span className="role-badge admin">
                          Admin
                        </span>
                      )}

                    {!creator &&
                      member.role ===
                        "member" && (
                        <span className="role-badge member">
                          Membre
                        </span>
                      )}
                  </div>
                </div>

                {isCreator &&
                  !creator && (
                    <div className="member-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          void changeRole(
                            member
                          )
                        }
                      >
                        {member.role ===
                        "admin"
                          ? "Retirer admin"
                          : "Promouvoir admin"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          void remove(
                            member
                          )
                        }
                      >
                        Retirer
                      </button>
                    </div>
                  )}
              </div>
            );
          }
        )}
      </div>

      {selectedMemberId && members.find((m) => m.userId === selectedMemberId) && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedMemberId(null)
          }
        >
          <div
            className="user-preview-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedMemberId(null)
              }
            >
              ×
            </button>

            {members.find((m) => m.userId === selectedMemberId) && (() => {
              const member = members.find((m) => m.userId === selectedMemberId)!;
              return (
                <>
                  <div
                    className="user-preview-avatar"
                    style={{
                      backgroundImage:
                        member.avatarUrl
                          ? `url(${member.avatarUrl})`
                          : undefined,
                      backgroundSize:
                        "cover",
                      backgroundPosition:
                        "center",
                    }}
                  >
                    {!member.avatarUrl &&
                      member.displayName
                        .slice(0, 2)
                        .toUpperCase()}
                  </div>

                  <h3>
                    {member.displayName}
                  </h3>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      navigate(
                        `/profil/${member.userId}`
                      );
                      setSelectedMemberId(null);
                    }}
                  >
                    Voir profil
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
}

export function GroupSettings() {
  const {
    groupId,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    groups,
    refresh,
  } = useFocus();

  const {
    user,
  } = useAuth();

  const foundGroup =
    groups.find(
      (item) =>
        item.id === groupId
    );

  if (!foundGroup) {
    return (
      <section className="group-live-panel">
        <div className="group-live-error">
          Groupe introuvable.
        </div>
      </section>
    );
  }

  const group = foundGroup;

  const [role, setRole] =
    useState<
      "owner" | "admin" | "member" | null
    >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        const currentRole =
          await getMyGroupRole(
            group.id
          );

        if (!cancelled) {
          setRole(
            currentRole
          );
        }
      } catch (err) {
        console.error(
          "Failed to load group role:",
          err
        );
      }
    }

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [group.id]);

  const isCreator =
    role === "owner" ||
    group.ownerId ===
      user?.id;

  const isAdmin =
    role === "owner" ||
    role === "admin" ||
    group.ownerId ===
      user?.id;

  const [name, setName] =
    useState(group.name);

  const [badge, setBadge] =
    useState<GroupBadge>(
      group.badge
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setName(group.name);
    setBadge(group.badge);
  }, [
    group.id,
    group.name,
    group.badge,
  ]);

  if (!isAdmin) {
    return (
      <section className="group-live-panel">
        <h2>
          Accès administrateur requis
        </h2>

        <p>
          Seuls le créateur et les administrateurs
          peuvent accéder aux réglages.
        </p>
      </section>
    );
  }

  async function save() {
    try {
      setSaving(true);
      setError("");

      await updateFocusGroup(
        group.id,
        {
          name,
          badge,
        }
      );

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeInvite() {
    try {
      const code =
        await regenerateInvite(
          group.id
        );

      window.alert(
        `Nouveau code : ${code}`
      );

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de régénérer le code."
      );
    }
  }

  async function leave() {
    try {
      await leaveFocusGroup(
        group.id
      );

      navigate("/focus");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de quitter le groupe."
      );
    }
  }

  async function deleteGroup() {
    if (!isCreator) {
      return;
    }

    if (
      !window.confirm(
        "Supprimer définitivement ce groupe ?"
      )
    ) {
      return;
    }

    try {
      await deleteFocusGroup(
        group.id
      );

      navigate("/focus");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le groupe."
      );
    }
  }

  async function changeImage(
    file: File
  ) {
    try {
      setSaving(true);
      setError("");

      const url =
        await uploadGroupImage(
          group.id,
          file
        );

      const nextBadge = {
        ...badge,
        imageUrl: url,
      };

      setBadge(nextBadge);

      await updateFocusGroup(
        group.id,
        {
          name:
            name.trim(),
          badge:
            nextBadge,
        }
      );

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'importer l'image."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="group-live-panel">
      <div className="group-panel-header">
        <div>
          <span className="section-eyebrow">
            Réglages
          </span>

          <h2>
            Paramètres du groupe
          </h2>
        </div>
      </div>

      {error && (
        <div className="group-live-error">
          {error}
        </div>
      )}

      <div className="group-settings-form">
        <label className="field">
          <span className="field__label">
            Nom
          </span>

          <input
            className="input"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
          />
        </label>

        <BadgePicker
          value={badge}
          onChange={setBadge}
        />

        <label className="field">
          <span className="field__label">
            Photo du groupe
          </span>

          <input
            className="input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (file) {
                void changeImage(
                  file
                );
              }
            }}
          />
        </label>

        <button
          type="button"
          className="btn btn-primary"
          disabled={saving}
          onClick={() =>
            void save()
          }
        >
          {saving
            ? "Enregistrement..."
            : "Enregistrer"}
        </button>

        <div className="group-settings-code">
          <div>
            <span>
              Code d'invitation
            </span>

            <strong>
              {group.inviteCode}
            </strong>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              void changeInvite()
            }
          >
            Régénérer
          </button>
        </div>

        {!isCreator && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() =>
              void leave()
            }
          >
            Quitter le groupe
          </button>
        )}

        {isCreator && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() =>
              void deleteGroup()
            }
          >
            Supprimer le groupe
          </button>
        )}
      </div>
    </section>
  );
}

function RangeSwitch({
  value,
  onChange,
}: {
  value: Range;
  onChange: (
    value: Range
  ) => void;
}) {
  return (
    <div className="range-switch">
      <button
        type="button"
        className={
          value === "week"
            ? "active"
            : ""
        }
        onClick={() =>
          onChange("week")
        }
      >
        Cette semaine
      </button>

      <button
        type="button"
        className={
          value === "month"
            ? "active"
            : ""
        }
        onClick={() =>
          onChange("month")
        }
      >
        Ce mois
      </button>

      <button
        type="button"
        className={
          value === "all"
            ? "active"
            : ""
        }
        onClick={() =>
          onChange("all")
        }
      >
        Tout temps
      </button>
    </div>
  );
}
