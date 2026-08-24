alter table rooms add column if not exists crew_id uuid;

create index if not exists rooms_crew_idx on rooms (crew_id);

alter table scoreboard_entries
  add column if not exists wrong_accusations integer not null default 0;

create index if not exists scoreboard_owner_idx on scoreboard_entries (owner_key, points desc);

create or replace function apply_match_to_scoreboard(p_room uuid)
returns integer
language plpgsql
as $$
declare
  crew uuid;
  winner uuid;
  affected integer := 0;
begin
  select crew_id, winner_player_id into crew, winner from rooms where id = p_room;

  if crew is null then
    return 0;
  end if;

  insert into scoreboard_entries (
    owner_key, name, points, matches_played, matches_won,
    cards_completed, correct_accusations, times_caught, wrong_accusations, updated_at
  )
  select
    crew::text,
    p.name,
    p.completed_count * 2
      + coalesce(acc.correct, 0) * 3
      + coalesce(acc.wrong, 0) * -2
      + coalesce(caught.total, 0) * -1
      + case when p.id = winner then 5 else 0 end,
    1,
    case when p.id = winner then 1 else 0 end,
    p.completed_count,
    coalesce(acc.correct, 0),
    coalesce(caught.total, 0),
    coalesce(acc.wrong, 0),
    now()
  from players p
  left join (
    select accuser_id,
           count(*) filter (where was_correct) as correct,
           count(*) filter (where not was_correct) as wrong
    from accusations where room_id = p_room group by accuser_id
  ) acc on acc.accuser_id = p.id
  left join (
    select accused_id, count(*) as total
    from accusations where room_id = p_room and was_correct group by accused_id
  ) caught on caught.accused_id = p.id
  where p.room_id = p_room
  on conflict (owner_key, name) do update set
    points = scoreboard_entries.points + excluded.points,
    matches_played = scoreboard_entries.matches_played + 1,
    matches_won = scoreboard_entries.matches_won + excluded.matches_won,
    cards_completed = scoreboard_entries.cards_completed + excluded.cards_completed,
    correct_accusations = scoreboard_entries.correct_accusations + excluded.correct_accusations,
    times_caught = scoreboard_entries.times_caught + excluded.times_caught,
    wrong_accusations = scoreboard_entries.wrong_accusations + excluded.wrong_accusations,
    updated_at = now();

  get diagnostics affected = row_count;

  return affected;
end;
$$;
