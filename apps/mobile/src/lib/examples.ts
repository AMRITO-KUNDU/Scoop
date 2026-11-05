/**
 * Sample messages for the capture screen — the same worked examples the web app
 * offers, so a new user has something to try without hunting for a school email.
 * Country-neutral by design: no currency symbols, no grade names, no jargon that
 * only makes sense in one school system.
 */

export type ExampleChip = { id: string; label: string; text: string };

export const EXAMPLE_CHIPS: ExampleChip[] = [
  {
    id: 'trip',
    label: 'School trip',
    text: `Science Museum Trip — Friday 3 October

Coach leaves at 8:45am sharp from the main gate. Return approx 3:30pm.

Please sign and return the consent form by Wednesday 24 September.
Children need a packed lunch (no nuts) and a waterproof coat.

Thank you,
Ms. Okonkwo`,
  },
  {
    id: 'party',
    label: 'Party invite',
    text: `Hi everyone! You're invited to Maya's 8th birthday party this Saturday, 3pm at Bounce House Fun Park, 42 Oak Street.

Please RSVP by Thursday so we can get the cake count right. Bring socks! No gifts needed — Maya would love a book for the class library instead.

Hope you can make it,
Priya`,
  },
  {
    id: 'notice',
    label: 'School notice',
    text: `Dear families, welcome back. Meet the teacher is Wednesday 24 September, 3:30–4:15pm in the classroom. School closed Friday 26 September for a staff training day. Please return the data collection form by Friday 26 September. Uniform: labelled jumpers, black shoes, no jewellery.

Ms. Okonkwo`,
  },
];
