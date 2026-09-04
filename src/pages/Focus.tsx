import { useEffect, useState } from "react";


import {
  Link,
} from "react-router-dom";

import {
  FocusTimer,
} from "../components/focus/FocusTimer";

import collaboratingPerson from "../assets/people/students-collaborating.webp";
import collaboratingBg from "../assets/people-bg/students-collaborating-bg.webp";

import {
  getLeaderboard,
} from "../features/focus/supabase";

import {
  useFocus,
} from "../context/FocusContext";

import mentionmaxMark from "../assets/brand/mentionmax-mark.svg";
import "../styles/focus-people.css";

function getInitials(
  name: string
) {
  return name
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Focus() {
  const {
    groups,
  } = useFocus();

  const [groupRankings, setGroupRankings] =
    useState<Record<string, Awaited<ReturnType<typeof getLeaderboard>>>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadRankings() {
      if (groups.length === 0) {
        setGroupRankings({});
        return;
      }

      const entries = await Promise.all(
        groups.map(async (group) => {
          try {
            const rows = await getLeaderboard(group.id, "week");
            return [group.id, rows] as const;
          } catch (error) {
            console.error(
              `Impossible de charger le classement du groupe ${group.id}:`,
              error
            );
            return [group.id, []] as const;
          }
        })
      );

      if (!cancelled) {
        setGroupRankings(
          Object.fromEntries(entries)
        );
      }
    }

    void loadRankings();

    return () => {
      cancelled = true;
    };
  }, [groups]);

  function memberInitials(name: string) {
    const initials = getInitials(name);
    return initials || "É";
  }

  return (
    <div className="app-page">
      <header className="page-header">
        <span className="section-eyebrow">
          Focus
        </span>

        <h1 className="page-title">
          Ton espace de concentration.
        </h1>

        <p className="page-lead">
          Travaille seul ou avec ton groupe,
          garde ton temps visible et transforme
          tes sessions en progression.
        </p>
      </header>



      <FocusTimer />

      <section
        className="focus-group-feature"
        style={{
          backgroundImage: `url(${collaboratingBg})`,
        }}
      >
        <div className="focus-group-feature__content">
          <span className="focus-group-feature__eyebrow">
            Focus Group
          </span>

          <h2>
            Travaille à plusieurs.
          </h2>

          <p>
            Crée un groupe, retrouve tes amis et
            transforme vos sessions de focus en
            progression commune.
          </p>

          <div className="focus-group-feature__actions">
            <Link
              to="/focus/groups/new"
              className="btn btn-primary"
            >
              Créer un groupe
            </Link>

            <Link
              to="/focus/groups/join"
              className="btn btn-ghost"
            >
              Rejoindre un groupe
            </Link>
          </div>
        </div>

        <div className="focus-group-feature__person">
          <img
            src={collaboratingPerson}
            alt=""
            aria-hidden="true"
          />
        </div>
      </section>



      <section className="focus-groups-section">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">
              Social
            </span>

            <h2 className="section-title">
              Mes groupes
            </h2>
          </div>

        </div>

        {groups.length === 0 ? (
          <div className="card focus-empty-groups">
            <div className="focus-empty-groups__icon">
              👥
            </div>

            <h2>
              Aucun groupe pour le moment.
            </h2>

            <p>
              Crée ton premier groupe ou rejoins
              celui de ta classe avec un code.
            </p>

            <div>
              <Link
                to="/focus/groups/new"
                className="btn btn-primary"
              >
                Créer mon groupe
              </Link>
            </div>
          </div>
        ) : (
          <div className="focus-group-grid">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/focus/groups/${group.id}`}
                className="focus-group-card"
              >
                
                {group.badge?.imageUrl ? (
                  <img
                  src={group.badge.imageUrl}
                  alt=""
                  className="focus-group-card__badge-image"
                  style={{
                    width: "45px",
                    height: "45px",
                    minWidth: "45px",
                    minHeight: "45px",
                    maxWidth: "45px",
                    maxHeight: "45px",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: "10px",
                    flexShrink: 0,
                  }}
                />
                ) : group.badge?.emoji ? (
                  <span>{group.badge.emoji}</span>
                ) : (
                  <img
                    src={mentionmaxMark}
                    alt="MentionMax"
                    className="focus-group-card__brand-mark"
                  />
                )}
              

                <div className="focus-group-card__body">
                  <div className="focus-group-card__top">
                    <div>
                      <span className="focus-group-card__type">
                        {group.type ===
                        "school"
                          ? "École"
                          : group.type ===
                            "class"
                            ? "Classe"
                            : "Privé"}
                      </span>

                      <h3>
                        {group.name}
                      </h3>
                    </div>

                    <span className="focus-group-card__arrow">
                      ↗
                    </span>
                  </div>

                  <div className="focus-group-card__meta">
                    <span>
                      👥 {group.memberIds.length} membre
                      {group.memberIds.length !== 1
                        ? "s"
                        : ""}
                    </span>

                    {(() => {
                      const ranking =
                        groupRankings[group.id] ?? [];

                      const topThree =
                        ranking.slice(0, 3);

                      const topAverage =
                        topThree.length > 0
                          ? Math.round(
                              topThree.reduce(
                                (sum, entry) =>
                                  sum +
                                  entry.totalSeconds,
                                0
                              ) /
                                topThree.length
                            )
                          : 0;

                      const averageMinutes =
                        Math.floor(topAverage / 60);

                      return topThree.length > 0 ? (
                        <span>
                          Top {topThree.length} cette semaine
                          {averageMinutes > 0
                            ? ` · moy. ${averageMinutes} min`
                            : ""}
                        </span>
                      ) : (
                        <span>
                          Aucun focus cette semaine
                        </span>
                      );
                    })()}
                  </div>

                  <div className="focus-group-card__members">
                    {(groupRankings[group.id] ?? [])
                      .slice(0, 4)
                      .map((member) => (
                        <span
                          key={member.userId}
                          className="mini-avatar focus-group-card__member-preview"
                          title={member.displayName}
                        >
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.displayName}
                              className="focus-group-card__member-preview-image"
                            />
                          ) : (
                            memberInitials(
                              member.displayName
                            )
                          )}
                        </span>
                      ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
