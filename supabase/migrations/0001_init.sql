create extension if not exists pgcrypto;

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  phase text not null default 'LOBBY',
  adult_content_enabled boolean not null default false,
  initial_hand_size smallint not null default 5,
  penalty_card_count smallint not null default 1,
  arm_window_seconds smallint not null default 90,
  contest_window_seconds smallint not null default 30,
  accusation_cooldown_seconds smallint not null default 45,
  host_player_id uuid,
  winner_player_id uuid,
  event_sequence integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  constraint rooms_phase_check check (phase in ('LOBBY', 'PLAYING', 'FINISHED')),
  constraint rooms_code_format check (code ~ '^[A-Z0-9]{6}$'),
  constraint rooms_hand_size_range check (initial_hand_size between 1 and 10)
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  name text not null,
  seat smallint not null,
  is_host boolean not null default false,
  connected boolean not null default true,
  hand_count smallint not null default 0,
  completed_count smallint not null default 0,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_seat_range check (seat between 1 and 12),
  constraint players_name_length check (char_length(btrim(name)) between 1 and 24),
  unique (room_id, seat)
);

create unique index if not exists players_room_name_key
  on players (room_id, lower(btrim(name)));

create table if not exists player_secrets (
  player_id uuid primary key references players (id) on delete cascade,
  room_id uuid not null references rooms (id) on delete cascade,
  access_token text not null unique,
  armed_card_id text,
  armed_at timestamptz,
  armed_until timestamptz,
  accusation_blocked_until timestamptz
);

create index if not exists player_secrets_armed_idx
  on player_secrets (room_id) where armed_card_id is not null;

create table if not exists hand_cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  card_id text not null,
  position smallint not null,
  created_at timestamptz not null default now(),
  unique (room_id, card_id)
);

create index if not exists hand_cards_player_idx on hand_cards (player_id, position);

create table if not exists draw_pile (
  room_id uuid not null references rooms (id) on delete cascade,
  card_id text not null,
  position integer not null,
  primary key (room_id, card_id)
);

create index if not exists draw_pile_order_idx on draw_pile (room_id, position);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  card_id text not null,
  status text not null default 'PENDING',
  contest_ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint claims_status_check check (status in ('PENDING', 'CONFIRMED', 'REVERTED'))
);

create index if not exists claims_room_idx on claims (room_id, created_at desc);

create table if not exists contest_votes (
  claim_id uuid not null references claims (id) on delete cascade,
  voter_id uuid not null references players (id) on delete cascade,
  said_it boolean not null,
  created_at timestamptz not null default now(),
  primary key (claim_id, voter_id)
);

create table if not exists accusations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  accuser_id uuid not null references players (id) on delete cascade,
  accused_id uuid not null references players (id) on delete cascade,
  was_correct boolean not null,
  created_at timestamptz not null default now(),
  constraint accusations_distinct_players check (accuser_id <> accused_id)
);

create table if not exists match_events (
  id bigserial primary key,
  room_id uuid not null references rooms (id) on delete cascade,
  sequence integer not null,
  type text not null,
  actor_id uuid references players (id) on delete set null,
  target_id uuid references players (id) on delete set null,
  card_id text,
  points_delta integer not null default 0,
  created_at timestamptz not null default now(),
  unique (room_id, sequence)
);

create index if not exists match_events_feed_idx on match_events (room_id, sequence desc);

create table if not exists scoreboard_entries (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null,
  name text not null,
  points integer not null default 0,
  matches_played integer not null default 0,
  matches_won integer not null default 0,
  cards_completed integer not null default 0,
  correct_accusations integer not null default 0,
  times_caught integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (owner_key, name)
);

create or replace function touch_players_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists players_touch_updated_at on players;

create trigger players_touch_updated_at
before update on players
for each row
execute function touch_players_updated_at();

create or replace function generate_room_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  attempt integer := 0;
begin
  loop
    candidate := '';

    for index in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;

    exit when not exists (select 1 from rooms where code = candidate);

    attempt := attempt + 1;

    if attempt > 40 then
      raise exception 'nao foi possivel gerar codigo de sala';
    end if;
  end loop;

  return candidate;
end;
$$;

alter table rooms enable row level security;
alter table players enable row level security;
alter table player_secrets enable row level security;
alter table hand_cards enable row level security;
alter table draw_pile enable row level security;
alter table claims enable row level security;
alter table contest_votes enable row level security;
alter table accusations enable row level security;
alter table match_events enable row level security;
alter table scoreboard_entries enable row level security;

drop policy if exists rooms_public_read on rooms;
create policy rooms_public_read on rooms for select to anon, authenticated using (true);

drop policy if exists players_public_read on players;
create policy players_public_read on players for select to anon, authenticated using (true);

drop policy if exists claims_public_read on claims;
create policy claims_public_read on claims for select to anon, authenticated using (true);

drop policy if exists accusations_public_read on accusations;
create policy accusations_public_read on accusations for select to anon, authenticated using (true);

drop policy if exists match_events_public_read on match_events;
create policy match_events_public_read on match_events for select to anon, authenticated using (true);

drop policy if exists contest_votes_public_read on contest_votes;
create policy contest_votes_public_read on contest_votes for select to anon, authenticated using (true);

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table claims;
alter publication supabase_realtime add table accusations;
alter publication supabase_realtime add table match_events;
alter publication supabase_realtime add table contest_votes;
