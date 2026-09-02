import type {
  ReactNode,
  SVGProps,
} from "react";

export type IconName =
  | "home"
  | "lessons"
  | "exercise"
  | "tests"
  | "focus"
  | "ai"
  | "profile"
  | "settings"
  | "logout"
  | "search"
  | "chevron"
  | "arrow"
  | "flame"
  | "users"
  | "progress"
  | "practice"
  | "sparkles"
  | "ranking"
  | "close";

const icons: Record<
  IconName,
  ReactNode
> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ),

  lessons: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22Z" />
      <path d="M4 5.5V19" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </>
  ),

  exercise: (
    <>
      <path d="m7 3 10 18" />
      <path d="m17 3-10 18" />
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </>
  ),

  practice: (
    <>
      <path d="M4 5h16" />
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <rect x="4" y="6" width="16" height="15" rx="2" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </>
  ),

  tests: (
    <>
      <path d="M6 3h12v18H6z" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
      <path d="m9 19 1.5 1.5L14 17" />
    </>
  ),

  focus: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
      <path d="M4 4 2 2" />
      <path d="M20 4l2-2" />
    </>
  ),

  ai: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" />
    </>
  ),

  sparkles: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="m5 17 .8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8Z" />
    </>
  ),

  progress: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-4 3 2 5-7" />
    </>
  ),

  ranking: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-6h4v6" />
      <path d="M10 20V8h4v12" />
      <path d="M14 20v-9h4v9" />
    </>
  ),

  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),

  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L8 6.7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),

  logout: (
    <>
      <path d="M10 4H4v16h6" />
      <path d="m15 8 4 4-4 4" />
      <path d="M19 12H9" />
    </>
  ),

  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),

  chevron: (
    <path d="m8 10 4 4 4-4" />
  ),

  arrow: (
    <>
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),

  flame: (
    <path d="M12 21c4 0 7-2.8 7-6.5 0-3.1-1.8-5.3-4.3-7.8.1 2.2-.9 3.7-2 4.5.2-3-1.1-5.7-3.9-8.2.2 3-1.2 4.9-2.3 6.6C5.4 11.2 5 12.7 5 14.5 5 18.2 8 21 12 21Z" />
  ),

  users: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 7a3 3 0 0 1 0 6" />
      <path d="M18 14.5a5.5 5.5 0 0 1 2.5 4.5" />
    </>
  ),

  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {icons[name]}
    </svg>
  );
}
