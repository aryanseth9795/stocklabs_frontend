/**
 * Single source of truth for the API base URL.
 *
 * The fallback is port 5000 — the API server's port. It previously defaulted to
 * 3000, which is the Next.js dev server itself, so with NEXT_PUBLIC_API_URL
 * unset every request was made against this app and 404'd (review F-11).
 *
 * `lib/ContextApi.tsx` and `lib/socket.ts` import from here rather than reading
 * process.env independently, so there is exactly one resolution path.
 */
const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

//Apis Server Url for fetching
const serverApiUrl: string = `${serverUrl}/api/v1`;

export { serverUrl, serverApiUrl };
