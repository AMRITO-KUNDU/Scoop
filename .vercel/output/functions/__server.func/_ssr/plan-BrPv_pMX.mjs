import { a as format, i as isThisWeek, o as isValid, r as isToday, t as parseISO } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-BrPv_pMX.js
var ITEM_TYPES = [
	"event",
	"deadline",
	"task",
	"rsvp"
];
var TYPE_META = {
	event: {
		label: "Event",
		tone: "grape"
	},
	deadline: {
		label: "Deadline",
		tone: "hot"
	},
	task: {
		label: "Task",
		tone: "yolk"
	},
	rsvp: {
		label: "RSVP",
		tone: "cyan"
	}
};
function isItemType(value) {
	return ITEM_TYPES.includes(value);
}
function parseDate(value) {
	if (!value) return null;
	const d = parseISO(value);
	return isValid(d) ? d : null;
}
function formatDate(value) {
	const d = parseDate(value);
	if (!d) return "No date";
	return format(d, "EEE d MMM");
}
function formatTime(value) {
	if (!value) return "";
	const match = /^(\d{1,2}):(\d{2})/.exec(value);
	if (!match) return value;
	const hours = Number(match[1]);
	const minutes = match[2];
	const suffix = hours >= 12 ? "pm" : "am";
	const h12 = hours % 12 || 12;
	return minutes === "00" ? `${h12}${suffix}` : `${h12}:${minutes}${suffix}`;
}
function formatWhen(item) {
	const date = formatDate(item.date);
	const time = formatTime(item.time);
	if (date === "No date" && !time) return "No date set";
	if (date === "No date") return time;
	return time ? `${date} · ${time}` : date;
}
function matchesFilter(item, filter) {
	if (filter === "all") return true;
	const d = parseDate(item.date);
	if (!d) return false;
	if (filter === "today") return isToday(d);
	return isThisWeek(d, { weekStartsOn: 1 });
}
//#endregion
export { matchesFilter as a, isItemType as i, TYPE_META as n, formatWhen as r, ITEM_TYPES as t };
