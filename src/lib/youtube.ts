const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function isYouTubeVideoId(input: string) {
  return YOUTUBE_ID_PATTERN.test(input);
}

export function extractYouTubeVideoId(input: string) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  if (YOUTUBE_ID_PATTERN.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
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
        return extractYouTubeVideoId(nestedUrl);
      }
    }
  } catch {
    const match = value.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
    return match?.[1] ?? null;
  }

  const fallback = value.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
  return fallback?.[1] ?? null;
}

export function buildYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
