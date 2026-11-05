export type ExampleChip = {
  id: string;
  label: string;
  text: string;
};

/**
 * Worked examples behind the landing-page preview. Deliberately country-neutral:
 * no currency symbols, no grade or year names, no school-specific jargon that
 * only makes sense in one country's system.
 */
export const EXAMPLE_CHIPS: ExampleChip[] = [
  {
    id: "party",
    label: "Party invite",
    text: `Hi everyone! You're invited to Maya's 8th birthday party this Saturday, 3pm at Bounce House Fun Park, 42 Oak Street.

Please RSVP by Thursday so we can get the cake count right. Bring socks! No gifts needed — Maya would love a book for the class library instead.

Hope you can make it,
Priya`,
  },
  {
    id: "trip",
    label: "School trip",
    text: `Science Museum Trip — Friday 3 October

Coach leaves at 8:45am sharp from the main gate. Return approx 3:30pm.

Please sign and return the consent form by Wednesday 24 September.
Children need a packed lunch (no nuts) and a waterproof coat.

Thank you,
Ms. Okonkwo`,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    text: `Riverside School Weekly Newsletter

• Parents' evening: 22–24 September. Book your slot by Friday.
• Book fair in the hall Monday–Wednesday next week, 8:30–9:15am.
• Bake sale Friday after school — volunteers needed.
• Reminder: school photos Thursday 18 September. Full uniform please.

Have a good week,
Mr. Ellis, Principal`,
  },
  {
    id: "permission",
    label: "Consent form",
    text: `CONSENT FORM — Swimming

Swimming lessons start Monday 22 September at Riverside Leisure Centre.
Sessions 1:15–2:30pm. Please sign and return by Friday 19 September.

Your child will need a swimsuit, towel and goggles. Hair tied back.

Contact: Ms. Patel, sports@riversideschool.edu`,
  },
  {
    id: "dentist",
    label: "Dentist",
    text: `Hi, just confirming Leo's dentist appointment is Tuesday 23 September at 4:20pm with Dr. Chen at Smile Kids Dental, 18 High Street.

Please arrive 10 minutes early for new patient forms. Reply yes if that still works.

Thanks,
Smile Kids Dental`,
  },
  {
    id: "welcome",
    label: "Welcome letter",
    text: `Dear families,

Welcome back.

Meet the teacher is Wednesday 24 September, 3:30–4:15pm in the classroom.
School closed Friday 26 September for a staff training day.
Please return the data collection form by Friday 26 September.
Uniform: labelled jumpers, black shoes, no jewellery.

Ms. Okonkwo`,
  },
  {
    id: "club",
    label: "After-school club",
    text: `Coding Club starts Thursday 25 September, 3:20–4:30pm in the computer room.

Places are limited. Reply yes by Monday 22 September to reserve a spot.
Please bring a water bottle.
Payment is due weekly after the first free session.

Mr. Shah, Computing`,
  },
  {
    id: "bus",
    label: "Bus times",
    text: `School bus — Route 7

First morning run is Monday 22 September. Pickup at the Oak Street stop at 8:10am. Drop-off 3:25pm at the same stop.

Please be 5 minutes early. Reply if you still need a seat this term.

Transport office`,
  },
  {
    id: "supplies",
    label: "Supply list",
    text: `Supply list — please have these by Friday 26 September.

Bring a named water bottle and a pencil case (pencils, rubber, sharpener).
Sports kit: white t-shirt, navy shorts, trainers — labelled please.
A raincoat for outdoor days.

The parents' association will sell packs at the welcome evening on Tuesday 23 September, 5pm in the hall.`,
  },
];

const LANDING_IDS = ["welcome", "club", "bus", "supplies"] as const;

export const LANDING_CHIPS: ExampleChip[] = LANDING_IDS.map((id) => {
  const chip = EXAMPLE_CHIPS.find((c) => c.id === id);
  if (!chip) throw new Error(`Missing landing chip: ${id}`);
  return chip;
});
