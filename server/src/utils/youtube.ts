const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (YOUTUBE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const queryId = url.searchParams.get("v");
      if (queryId && YOUTUBE_ID_PATTERN.test(queryId)) {
        return queryId;
      }

      const segments = url.pathname.split("/").filter(Boolean);
      const pathId =
        segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live"
          ? segments[1]
          : null;
      if (pathId && YOUTUBE_ID_PATTERN.test(pathId)) {
        return pathId;
      }

      const nestedUrl = url.searchParams.get("u");
      if (nestedUrl) {
        return extractVideoId(nestedUrl);
      }
    }
  } catch {
    const match = trimmed.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
    return match?.[1] ?? null;
  }

  const fallback = trimmed.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
  return fallback?.[1] ?? null;
}
