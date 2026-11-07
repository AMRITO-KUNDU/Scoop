-- Items can span more than one day: a school closure, a half-term, a trip that
-- returns the next evening. Without this a range collapses to its first date and
-- the calendar shows a four-day closure on a single square.
alter table plan_items add column if not exists end_date text;
