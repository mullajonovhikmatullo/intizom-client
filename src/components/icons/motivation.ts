import { createLucideIcon } from "lucide-react";

/** A figure pushing a boulder uphill: the daily effort behind a habit. */
export const Sisyphus = createLucideIcon("Sisyphus", [
  ["path", { d: "M2 21 22 13", key: "slope" }],
  ["circle", { cx: "17.2", cy: "11", r: "3.6", key: "boulder" }],
  ["circle", { cx: "8.6", cy: "5.6", r: "1.6", key: "head" }],
  ["path", { d: "M8 8.6 6 14", key: "body" }],
  ["path", { d: "M6 14l-2.8 5.6", key: "back-leg" }],
  ["path", { d: "M6 14l2.6 1.6-.4 2.6", key: "front-leg" }],
  ["path", { d: "M7.6 9.8l5.6 1", key: "arms" }],
]);

/** A flag planted on a summit: a plan carried through to the top. */
export const Summit = createLucideIcon("Summit", [
  ["path", { d: "m2 21 7-11 4 6 2.5-3.5L22 21Z", key: "mountain" }],
  ["path", { d: "M9 10V2.5", key: "pole" }],
  ["path", { d: "M9 2.5h5.5L13 4.25 14.5 6H9", key: "flag" }],
]);

/** Rising bars with an arrow breaking out: the discip.uz mark. */
export const DisciplineMark = createLucideIcon("DisciplineMark", [
  ["path", { d: "M4 20v-4", key: "bar1" }],
  ["path", { d: "M9 20v-7", key: "bar2" }],
  ["path", { d: "M14 20v-5", key: "bar3" }],
  ["path", { d: "M19 20v-9", key: "bar4" }],
  ["path", { d: "m3 11 5-5 4 3 8-6", key: "trend" }],
  ["path", { d: "M15 3h5v5", key: "arrow" }],
]);
