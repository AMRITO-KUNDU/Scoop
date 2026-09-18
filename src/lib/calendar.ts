import type { ExtractedItem } from "./plan";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function compactDate(date: string): string {
  return date.replaceAll("-", "");
}

function compactDateTime(date: string, time: string): string {
  return `${compactDate(date)}T${time.replace(":", "")}00`;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addMinutes(
  date: string,
  time: string,
  minutes: number,
): { date: string; time: string } {
  const [hours, mins] = time.split(":").map(Number);
  const d = new Date(`${date}T${pad(hours)}:${pad(mins)}:00`);
  d.setMinutes(d.getMinutes() + minutes);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "item";
}

function escapeIcs(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function googleCalendarUrl(item: Pick<ExtractedItem, "title" | "date" | "time" | "location" | "notes" | "type">): string | null {
  if (!item.date) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.title,
  });
  if (item.time) {
    const end = addMinutes(item.date, item.time, 60);
    params.set(
      "dates",
      `${compactDateTime(item.date, item.time)}/${compactDateTime(end.date, end.time)}`,
    );
  } else {
    params.set(
      "dates",
      `${compactDate(item.date)}/${compactDate(addDays(item.date, 1))}`,
    );
  }
  if (item.location) params.set("location", item.location);
  const details = [item.notes, `From SCOOP · ${item.type}`]
    .filter(Boolean)
    .join("\n");
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function toIcs(
  item: Pick<ExtractedItem, "title" | "date" | "time" | "location" | "notes">,
  now = new Date(),
): string | null {
  if (!item.date) return null;
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SCOOP//School Life//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:scoop-${compactDate(item.date)}-${slug(item.title)}@scoop.app`,
    `DTSTAMP:${stamp}`,
  ];
  if (item.time) {
    const end = addMinutes(item.date, item.time, 60);
    lines.push(`DTSTART:${compactDateTime(item.date, item.time)}`);
    lines.push(`DTEND:${compactDateTime(end.date, end.time)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(item.date)}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(item.date, 1))}`);
  }
  lines.push(`SUMMARY:${escapeIcs(item.title)}`);
  if (item.location) lines.push(`LOCATION:${escapeIcs(item.location)}`);
  if (item.notes) lines.push(`DESCRIPTION:${escapeIcs(item.notes)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadIcs(
  item: Pick<ExtractedItem, "title" | "date" | "time" | "location" | "notes">,
): boolean {
  const ics = toIcs(item);
  if (!ics || typeof document === "undefined") return false;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(item.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}
