create table if not exists plan_items (
  id serial primary key,
  user_id text not null,
  type text not null,
  title text not null,
  date text,
  time text,
  location text,
  notes text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists plan_items_user_id_idx on plan_items (user_id);
create index if not exists plan_items_user_date_idx on plan_items (user_id, date);
