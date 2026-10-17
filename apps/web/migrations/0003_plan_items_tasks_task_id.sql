-- Track which plan items have been pushed to Google Tasks, so a re-sync never
-- creates a duplicate task (GOOGLETASKS_INSERT_TASK is not idempotent).
-- Nullable: most rows are unsynced.
alter table plan_items add column if not exists tasks_task_id text;
