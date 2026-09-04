import type { CSSProperties, ReactNode } from "react";
import studentHero from "../../assets/people/student-hero.webp";
import studentMaths from "../../assets/people/student-maths.webp";
import studentPhysics from "../../assets/people/student-physics.webp";
import studentBooks from "../../assets/people/student-books.webp";
import studentWriting from "../../assets/people/student-writing.webp";
import studentEnglish from "../../assets/people/student-english.webp";
import studentSvt from "../../assets/people/student-svt.webp";
import studentPhilosophy from "../../assets/people/student-philosophy.webp";
import teacherExplaining from "../../assets/people/teacher-explaining.webp";
import studentsCollaborating from "../../assets/people/students-collaborating.webp";
import "./PeopleFeature.css";

export type PeopleFeatureVariant =
  | "hero"
  | "maths"
  | "physics"
  | "books"
  | "writing"
  | "english"
  | "svt"
  | "philosophy"
  | "teacher"
  | "collaboration";

const people: Record<PeopleFeatureVariant, string> = {
  hero: studentHero,
  maths: studentMaths,
  physics: studentPhysics,
  books: studentBooks,
  writing: studentWriting,
  english: studentEnglish,
  svt: studentSvt,
  philosophy: studentPhilosophy,
  teacher: teacherExplaining,
  collaboration: studentsCollaborating,
};

const labels: Record<PeopleFeatureVariant, string> = {
  hero: "Préparation 2BAC",
  maths: "Mathématiques",
  physics: "Physique-Chimie",
  books: "Révision",
  writing: "Pratique",
  english: "Anglais",
  svt: "SVT",
  philosophy: "Philosophie",
  teacher: "Accompagnement",
  collaboration: "Focus Group",
};

export default function PeopleFeature({
  variant = "hero",
  eyebrow,
  title,
  text,
  action,
  compact = false,
  className = "",
}: {
  variant?: PeopleFeatureVariant;
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const style = {
    "--people-image": `url(${people[variant]})`,
  } as CSSProperties;

  return (
    <section
      className={`people-feature ${compact ? "people-feature--compact" : ""} people-feature--${variant} ${className}`.trim()}
      style={style}
    >
      <div className="people-feature__glow" aria-hidden="true" />
      <div className="people-feature__content">
        <span className="people-feature__eyebrow">{eyebrow ?? labels[variant]}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {action && <div className="people-feature__action">{action}</div>}
      </div>
      <div className="people-feature__person" aria-hidden="true">
        <img src={people[variant]} alt="" />
      </div>
    </section>
  );
}
