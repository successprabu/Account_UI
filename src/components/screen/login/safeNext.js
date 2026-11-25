/** Where to go after sign-in: only a path on this site (e.g. back to the plan the visitor chose). */
export const safeNext = (n) => (n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/dashboard");
