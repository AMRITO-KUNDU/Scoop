-- Fixed-window counters for endpoints that cost money per call (AI extraction).
-- One row per bucket per window; the window is a truncated timestamp, so the
-- reset happens on its own and no cron job is needed.
create table if not exists rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (bucket, window_start)
);

create index if not exists rate_limits_window_idx on rate_limits (window_start);
