create table if not exists join_requests (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  name text not null,
  status text not null default 'PENDING',
  player_id uuid references players (id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint join_requests_status_check
    check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  constraint join_requests_name_length check (char_length(btrim(name)) between 1 and 24)
);

create index if not exists join_requests_room_idx on join_requests (room_id, status);

create table if not exists join_request_secrets (
  request_id uuid primary key references join_requests (id) on delete cascade,
  request_token text not null unique,
  granted_access_token text
);

alter table join_requests enable row level security;
alter table join_request_secrets enable row level security;

drop policy if exists join_requests_public_read on join_requests;
create policy join_requests_public_read on join_requests
  for select to anon, authenticated using (true);

alter publication supabase_realtime add table join_requests;
