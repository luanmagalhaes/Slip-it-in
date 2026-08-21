create or replace function next_event_sequence(p_room uuid)
returns integer
language sql
as $$
  update rooms
  set event_sequence = event_sequence + 1
  where id = p_room
  returning event_sequence;
$$;

create or replace function draw_penalty_cards(p_room uuid, p_player uuid, p_count integer)
returns integer
language plpgsql
as $$
declare
  moved integer := 0;
  next_position smallint;
begin
  select coalesce(max(position), 0) + 1 into next_position
  from hand_cards
  where player_id = p_player;

  with taken as (
    delete from draw_pile
    where card_id in (
      select card_id from draw_pile
      where room_id = p_room
      order by position
      limit p_count
    )
    and room_id = p_room
    returning card_id, position
  ),
  inserted as (
    insert into hand_cards (room_id, player_id, card_id, position)
    select p_room, p_player, taken.card_id,
           next_position + (row_number() over (order by taken.position))::smallint - 1
    from taken
    returning 1
  )
  select count(*) into moved from inserted;

  update players
  set hand_count = (select count(*) from hand_cards where player_id = p_player)
  where id = p_player;

  return moved;
end;
$$;

create or replace function sync_hand_count(p_player uuid)
returns integer
language plpgsql
as $$
declare
  total integer;
begin
  select count(*) into total from hand_cards where player_id = p_player;

  update players set hand_count = total where id = p_player;

  return total;
end;
$$;
