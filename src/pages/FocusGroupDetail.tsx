import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useFocus,
} from "../context/FocusContext";

import {
  getGroupById,
  getMyGroupRole,
  leaveFocusGroup,
} from "../features/focus/supabase";

import type {
  Group,
} from "../features/focus/types";

export default function FocusGroupDetail() {
  const {
    groupId,
  } = useParams();

  const {
    user,
  } = useAuth();

  const {
    groups,
    refresh,
  } = useFocus();

  const navigate =
    useNavigate();

  const localGroup =
    groups.find(
      (item) =>
        item.id === groupId
    );

  const [
    remoteGroup,
    setRemoteGroup,
  ] = useState<Group | null>(
    null
  );

  const [
    role,
    setRole,
  ] = useState<
    "owner" | "admin" | "member" | null
  >(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          fetchedGroup,
          fetchedRole,
        ] = await Promise.all([
          getGroupById(
            groupId
          ),
          getMyGroupRole(
            groupId
          ),
        ]);

        if (!cancelled) {
          setRemoteGroup(
            fetchedGroup
          );

          setRole(
            fetchedRole
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger le groupe."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const group =
    remoteGroup ??
    localGroup;

  if (loading && !group) {
    return (
      <div className="app-page">
        <div className="card group-placeholder">
          <span className="section-eyebrow">
            Focus
          </span>

          <h2>
            Chargement du groupe...
          </h2>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="app-page">
        <div className="card group-placeholder">
          <span className="section-eyebrow">
            Focus
          </span>

          <h1>
            Groupe introuvable
          </h1>

          <p>
            {error ||
              "Ce groupe n'existe pas ou n'est plus accessible."}
          </p>

          <Link
            to="/focus"
            className="btn btn-primary"
          >
            Retour à Focus
          </Link>
        </div>
      </div>
    );
  }

  const isCreator =
    role === "owner" ||
    group.ownerId ===
      user?.id;

  const canManage =
    role === "owner" ||
    role === "admin" ||
    group.ownerId ===
      user?.id;

  async function leave() {
    if (!groupId) {
      return;
    }

    try {
      setError("");

      await leaveFocusGroup(
        groupId
      );

      await refresh();

      navigate("/focus");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de quitter le groupe."
      );
    }
  }

  const tabs: [
    string,
    string
  ][] = [
    [
      "",
      "Classement",
    ],
    [
      "/chat",
      "Chat",
    ],
    [
      "/stats",
      "Stats",
    ],
    [
      "/members",
      "Membres",
    ],
  ];

  if (canManage) {
    tabs.push([
      "/settings",
      "Réglages",
    ]);
  }

  return (
    <div className="app-page">
      <header className="group-detail-header">
        <div className="group-detail-topline">
          <Link
            to="/focus"
            className="text-link"
          >
            ← Focus
          </Link>

          {!isCreator && (
            <button
              type="button"
              className="btn-danger btn-sm"
              onClick={() =>
                void leave()
              }
            >
              Quitter le groupe
            </button>
          )}
        </div>

        <div className="group-detail-identity">
          <div
            className="group-detail-badge"
            style={{
              backgroundColor:
                group.badge
                  .color,
              backgroundImage:
                group.badge
                  .imageUrl
                  ? `url(${group.badge.imageUrl})`
                  : undefined,
              backgroundSize:
                "cover",
              backgroundPosition:
                "center",
            }}
          >
            {!group.badge
              .imageUrl &&
              (
                group.badge
                  .emoji ??
                "📚"
              )}
          </div>

          <div>
            <span className="section-eyebrow">
              {group.type ===
              "school"
                ? "École"
                : group.type ===
                  "class"
                  ? "Classe"
                  : "Privé"}
            </span>

            <h1>
              {group.name}
            </h1>

            <p>
              {group.memberIds.length}{" "}
              membre
              {group.memberIds.length !==
              1
                ? "s"
                : ""}{" "}
              · Code{" "}
              <strong>
                {group.inviteCode}
              </strong>
            </p>

            <div className="group-current-role">
              {isCreator && (
                <span className="role-badge creator">
                  Créateur
                </span>
              )}

              {!isCreator &&
                role === "admin" && (
                  <span className="role-badge admin">
                    Admin
                  </span>
                )}

              {!isCreator &&
                role === "member" && (
                  <span className="role-badge member">
                    Membre
                  </span>
                )}
            </div>
          </div>
        </div>

        {error && (
          <div className="group-live-error">
            {error}
          </div>
        )}
      </header>

      <nav className="group-tab-nav">
        {tabs.map(
          ([suffix, label]) => (
            <NavLink
              key={label}
              to={
                `/focus/groups/${group.id}${suffix}`
              }
              end={
                suffix === ""
              }
              className={({
                isActive,
              }) =>
                isActive
                  ? "group-tab active"
                  : "group-tab"
              }
            >
              {label}
            </NavLink>
          )
        )}
      </nav>

      <Outlet />
    </div>
  );
}
