-- Track which plan items have already been pushed to a connected calendar, so a
-- re-sync never creates a duplicate event. Nullable: most rows are unsynced.
alter table plan_items add column if not exists calendar_event_id text;
