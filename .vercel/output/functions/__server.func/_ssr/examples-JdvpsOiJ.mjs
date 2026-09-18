import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./logo-ZkcmHUEu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/examples-JdvpsOiJ.js
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("field resize-y", className),
		...props
	});
}
var EXAMPLE_CHIPS = [
	{
		id: "party",
		label: "Party invite",
		text: `Hi parents! You're invited to Maya's 8th birthday party this Saturday, 3pm at Bounce House Fun Park, 42 Oak Street.

Please RSVP by Thursday so we can get the cake count right. Bring socks! No gifts needed — Maya would love a book donation to the class library instead.

Hope you can make it,
Priya`
	},
	{
		id: "trip",
		label: "School trip",
		text: `Year 4 Science Museum Trip — Friday 3 October

Coach leaves at 8:45am sharp from the main gate. Return approx 3:30pm.

Please return the permission slip and £12.50 by Wednesday 24 September.
Children need a packed lunch (no nuts) and a waterproof coat.

Ms. Okonkwo, Year 4`
	},
	{
		id: "newsletter",
		label: "Newsletter",
		text: `St. Helen's Weekly Newsletter

• Parent-teacher conferences: 22–24 September. Book your slot by Friday.
• Book fair in the hall Monday–Wednesday next week, 8:30–9:15am.
• PTA bake sale Friday after school — volunteers needed.
• Reminder: school photos Thursday 18 September. Uniform please!

Have a good week,
Mr. Ellis, Headteacher`
	},
	{
		id: "permission",
		label: "Permission slip",
		text: `PERMISSION SLIP — Swimming Term

Term swimming starts Monday 21 September at Riverside Leisure Centre.
Sessions 1:15–2:30pm. Please sign and return by Friday 19 September.

Your child will need a swimsuit, towel, and goggles. Hair tied back.

Contact: Ms. Patel, pe@sthelens.sch.uk`
	},
	{
		id: "dentist",
		label: "Dentist",
		text: `Hi, just confirming Leo's dentist appointment is Tuesday 23 September at 4:20pm with Dr. Chen at Smile Kids Dental, 18 High Street.

Please arrive 10 minutes early for new patient forms. Reply yes if that still works.

Thanks,
Smile Kids Dental`
	},
	{
		id: "welcome",
		label: "Welcome letter",
		text: `Dear families,

Welcome back to St. Helen's, Year 3.

Meet the teacher is Wednesday 24 September, 3:30–4:15pm in the Year 3 classroom.
INSET day Friday 26 September — school closed.
Please return the data collection form by Friday 26 September.
Uniform: labelled jumpers, black shoes, no jewellery.

Ms. Okonkwo, Year 3`
	},
	{
		id: "club",
		label: "After-school club",
		text: `Year 3 & 4 Coding Club starts Thursday 25 September, 3:20–4:30pm in the ICT suite.

Places limited. Reply yes by Monday 22 September to reserve a spot.
Please bring a water bottle.
Pay £4 per week via ParentPay after the first free session.

Mr. Shah, Computing`
	},
	{
		id: "bus",
		label: "Bus times",
		text: `School bus — Route 7

First morning run is Monday 22 September. Pickup at Oak Street stop at 8:10am. Drop-off 3:25pm at the same stop.

Please be 5 minutes early. Reply if you still need a seat this term.

Transport office`
	},
	{
		id: "supplies",
		label: "Supply list",
		text: `Year 4 supply list — please have these by Friday 26 September.

Bring a named water bottle and a pencil case (HB pencils, rubber, sharpener).
PE kit: white t-shirt, navy shorts, trainers — labelled please.
Wellies needed for forest Friday.

PTA will sell packs at the welcome evening on Tuesday 23 September, 5pm in the hall.`
	}
];
var LANDING_CHIPS = [
	"welcome",
	"club",
	"bus",
	"supplies"
].map((id) => {
	const chip = EXAMPLE_CHIPS.find((c) => c.id === id);
	if (!chip) throw new Error(`Missing landing chip: ${id}`);
	return chip;
});
//#endregion
export { LANDING_CHIPS as n, Textarea as r, EXAMPLE_CHIPS as t };
