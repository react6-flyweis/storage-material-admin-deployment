import type { Meeting } from "./meetings.api";

/** The API stores `"offline"`; older records / requests may say `"in-person"`. */
export function isOnlineMeeting(mode?: string | null) {
  return mode === "online";
}

/** Join/host actions only make sense for a scheduled online meeting with a link. */
export function isMeetingJoinable(
  meeting: Pick<Meeting, "mode" | "status" | "meetingLink">,
) {
  return (
    isOnlineMeeting(meeting.mode) &&
    meeting.status === "scheduled" &&
    Boolean(meeting.meetingLink?.trim())
  );
}

/** A link that Zoom generated for this meeting (vs. a manually pasted one). */
export function hasZoomLink(meeting: Pick<Meeting, "zoomMeetingId">) {
  return Boolean(meeting.zoomMeetingId);
}

/**
 * Build the ISO 8601 `meetingTime` sent to the API from the picked date
 * (yyyy-mm-dd) and time (HH:mm). The picked values are in the user's local
 * timezone, so e.g. 15:00 in IST is sent as 09:30Z — matching what the edit
 * form and lists display (they read meetingTime back in local time) and what
 * Zoom shows in the invite.
 */
export function toMeetingTimeIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidUrl(value: string) {
  try {
    new URL(normalizeUrl(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * The `meetingLink` to send on create/edit:
 * - online + Zoom (default) → undefined, backend creates the Zoom meeting
 * - online + own link → the pasted link
 * - in person → optional pasted link
 */
export function resolveMeetingLink(
  mode: string,
  useOwnLink: boolean,
  link: string,
) {
  const typed = normalizeUrl(link);
  if (isOnlineMeeting(mode)) return useOwnLink ? typed : undefined;
  return typed || undefined;
}

/** Validation message for the link field, or undefined if it's fine. */
export function getMeetingLinkError(
  mode: string,
  useOwnLink: boolean,
  link: string,
) {
  const trimmed = link.trim();
  if (isOnlineMeeting(mode) && useOwnLink && !trimmed) {
    return 'Paste your meeting link, or untick "Use my own link"';
  }
  if (trimmed && !isValidUrl(trimmed)) {
    return "Please enter a valid meeting URL (e.g., https://zoom.us/j/...)";
  }
  return undefined;
}

/** Zoom accepts 15–1440 minutes for auto-created meetings. */
export function getZoomDurationError(
  mode: string,
  useOwnLink: boolean,
  duration: number,
) {
  if (!isOnlineMeeting(mode) || useOwnLink || !Number.isFinite(duration)) {
    return undefined;
  }
  return duration < 15 || duration > 1440
    ? "Zoom meetings must be between 15 and 1440 minutes"
    : undefined;
}
