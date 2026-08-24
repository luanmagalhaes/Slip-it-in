import { baseDeck } from "@/data/deck";
import { filterDeckByAdultSetting } from "@/lib/game/filterDeckByAdultSetting";
import { resolveContest } from "@/lib/game/online/contest";
import { isAccusationBlocked, isArmed } from "@/lib/game/online/timing";
import { shuffleDeck } from "@/lib/game/shuffleDeck";
import { serverClient } from "@/lib/supabase/server";
import { ClaimStatus, EventType, RoomPhase, type MyState, type RoomRow } from "@/types/room";

export class ServiceError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const minPlayers = 3;
const maxPlayers = 12;

function createToken(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

async function loadRoom(code: string): Promise<RoomRow> {
  const { data, error } = await serverClient()
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  if (!data) {
    throw new ServiceError("sala nao encontrada", 404);
  }

  return data as RoomRow;
}

async function loadPlayerByToken(room: RoomRow, token: string) {
  const { data, error } = await serverClient()
    .from("player_secrets")
    .select("player_id, armed_card_id, armed_until, accusation_blocked_until, players(*)")
    .eq("access_token", token)
    .eq("room_id", room.id)
    .maybeSingle();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  if (!data) {
    throw new ServiceError("jogador nao autorizado nesta sala", 401);
  }

  return data as unknown as {
    player_id: string;
    armed_card_id: string | null;
    armed_until: string | null;
    accusation_blocked_until: string | null;
    players: { id: string; name: string; is_host: boolean; hand_count: number };
  };
}

async function recordEvent(input: {
  roomId: string;
  type: string;
  actorId?: string | null;
  targetId?: string | null;
  cardId?: string | null;
  pointsDelta?: number;
}) {
  const client = serverClient();
  const { data: sequence, error: sequenceError } = await client.rpc("next_event_sequence", {
    p_room: input.roomId,
  });

  if (sequenceError) {
    throw new ServiceError(sequenceError.message, 500);
  }

  await client.from("match_events").insert({
    room_id: input.roomId,
    sequence,
    type: input.type,
    actor_id: input.actorId ?? null,
    target_id: input.targetId ?? null,
    card_id: input.cardId ?? null,
    points_delta: input.pointsDelta ?? 0,
  });
}

export async function createRoom(input: {
  hostName: string;
  adultContentEnabled: boolean;
  hardContentEnabled: boolean;
  crewId?: string | null;
}) {
  const client = serverClient();
  const { data: code, error: codeError } = await client.rpc("generate_room_code");

  if (codeError) {
    throw new ServiceError(codeError.message, 500);
  }

  const { data: room, error: roomError } = await client
    .from("rooms")
    .insert({
      code,
      adult_content_enabled: input.adultContentEnabled,
      hard_content_enabled: input.adultContentEnabled && input.hardContentEnabled,
      crew_id: input.crewId ?? crypto.randomUUID(),
    })
    .select()
    .single();

  if (roomError) {
    throw new ServiceError(roomError.message, 500);
  }

  const joined = await joinRoom({ code: room.code, name: input.hostName, isHost: true });

  await client.from("rooms").update({ host_player_id: joined.playerId }).eq("id", room.id);

  return { ...joined, code: room.code as string, crewId: room.crew_id as string };
}

export async function joinRoom(input: { code: string; name: string; isHost?: boolean }) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("a partida ja comecou", 409);
  }

  const name = input.name.trim();

  if (name.length < 1 || name.length > 24) {
    throw new ServiceError("nome invalido", 422);
  }

  const { count } = await client
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room.id);

  if ((count ?? 0) >= maxPlayers) {
    throw new ServiceError(`a sala esta cheia (maximo ${maxPlayers})`, 409);
  }

  const { data: lastSeat } = await client
    .from("players")
    .select("seat")
    .eq("room_id", room.id)
    .order("seat", { ascending: false })
    .limit(1)
    .maybeSingle();

  const seat = ((lastSeat?.seat as number | undefined) ?? 0) + 1;

  if (seat > maxPlayers) {
    throw new ServiceError("a sala ja teve jogadores demais, crie uma nova", 409);
  }

  const { data: player, error } = await client
    .from("players")
    .insert({ room_id: room.id, name, seat, is_host: input.isHost ?? false })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ServiceError(
        error.message.includes("seat")
          ? "nao ha assento livre nesta sala"
          : "esse nome ja esta na mesa",
        409,
      );
    }

    throw new ServiceError(error.message, 500);
  }

  const accessToken = createToken();

  await client
    .from("player_secrets")
    .insert({ player_id: player.id, room_id: room.id, access_token: accessToken });

  await recordEvent({ roomId: room.id, type: EventType.PlayerJoined, actorId: player.id });

  return {
    playerId: player.id as string,
    accessToken,
    roomId: room.id,
    code: room.code,
    crewId: room.crew_id,
  };
}

export async function startMatch(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);

  if (!me.players.is_host) {
    throw new ServiceError("apenas o host pode comecar", 403);
  }

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("a partida ja comecou", 409);
  }

  const { data: players } = await client
    .from("players")
    .select("id, seat")
    .eq("room_id", room.id)
    .order("seat");

  const roster = players ?? [];

  if (roster.length < minPlayers) {
    throw new ServiceError(`precisa de pelo menos ${minPlayers} jogadores`, 409);
  }

  const eligible = filterDeckByAdultSetting(baseDeck, {
    adultContentEnabled: room.adult_content_enabled,
    hardContentEnabled: room.hard_content_enabled,
  });
  const shuffled = shuffleDeck(eligible);
  const handSize = room.initial_hand_size;

  const hands = roster.flatMap((player, playerIndex) =>
    shuffled.slice(playerIndex * handSize, playerIndex * handSize + handSize).map((card, index) => ({
      room_id: room.id,
      player_id: player.id,
      card_id: card.id,
      position: index + 1,
    })),
  );

  const pile = shuffled.slice(roster.length * handSize).map((card, index) => ({
    room_id: room.id,
    card_id: card.id,
    position: index + 1,
  }));

  const { error: handError } = await client.from("hand_cards").insert(hands);

  if (handError) {
    throw new ServiceError(handError.message, 500);
  }

  for (let index = 0; index < pile.length; index += 500) {
    const { error: pileError } = await client.from("draw_pile").insert(pile.slice(index, index + 500));

    if (pileError) {
      throw new ServiceError(pileError.message, 500);
    }
  }

  for (const player of roster) {
    await client.rpc("sync_hand_count", { p_player: player.id });
  }

  await client
    .from("rooms")
    .update({ phase: RoomPhase.Playing, started_at: new Date().toISOString() })
    .eq("id", room.id);

  await recordEvent({ roomId: room.id, type: EventType.MatchStarted, actorId: me.player_id });

  return { started: true };
}

export async function getMyState(input: { code: string; token: string }): Promise<MyState> {
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);

  const { data: cards } = await serverClient()
    .from("hand_cards")
    .select("card_id, position")
    .eq("player_id", me.player_id)
    .order("position");

  return {
    playerId: me.player_id,
    name: me.players.name,
    isHost: me.players.is_host,
    handCardIds: (cards ?? []).map((card) => card.card_id as string),
    armedCardId: me.armed_card_id,
    armedUntil: me.armed_until,
    accusationBlockedUntil: me.accusation_blocked_until,
  };
}

export async function armCard(input: { code: string; token: string; cardId: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);
  const now = new Date();

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida nao esta em andamento", 409);
  }

  if (isArmed(me.armed_until, now)) {
    throw new ServiceError("voce ja tem uma carta armada", 409);
  }

  const { data: owned } = await client
    .from("hand_cards")
    .select("card_id")
    .eq("player_id", me.player_id)
    .eq("card_id", input.cardId)
    .maybeSingle();

  if (!owned) {
    throw new ServiceError("essa carta nao esta na sua mao", 409);
  }

  const armedUntil = new Date(now.getTime() + room.arm_window_seconds * 1000).toISOString();

  const { error } = await client
    .from("player_secrets")
    .update({ armed_card_id: input.cardId, armed_at: now.toISOString(), armed_until: armedUntil })
    .eq("player_id", me.player_id);

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return { armedCardId: input.cardId, armedUntil };
}

export async function claimCard(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);
  const now = new Date();

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida nao esta em andamento", 409);
  }

  if (!me.armed_card_id || !isArmed(me.armed_until, now)) {
    throw new ServiceError("arme uma carta antes de reivindicar", 409);
  }

  const cardId = me.armed_card_id;

  const { data: released, error: releaseError } = await client
    .from("player_secrets")
    .update({ armed_card_id: null, armed_at: null, armed_until: null })
    .eq("player_id", me.player_id)
    .eq("armed_card_id", cardId)
    .select("player_id");

  if (releaseError) {
    throw new ServiceError(releaseError.message, 500);
  }

  if (!released || released.length === 0) {
    throw new ServiceError("essa carta ja foi reivindicada", 409);
  }

  const { data: removed } = await client
    .from("hand_cards")
    .delete()
    .eq("player_id", me.player_id)
    .eq("card_id", cardId)
    .select("card_id");

  if (!removed || removed.length === 0) {
    throw new ServiceError("essa carta nao esta mais na sua mao", 409);
  }

  await client.rpc("sync_hand_count", { p_player: me.player_id });

  const contestEndsAt = new Date(
    now.getTime() + room.contest_window_seconds * 1000,
  ).toISOString();

  const { data: claim, error: claimError } = await client
    .from("claims")
    .insert({
      room_id: room.id,
      player_id: me.player_id,
      card_id: cardId,
      contest_ends_at: contestEndsAt,
    })
    .select()
    .single();

  if (claimError) {
    throw new ServiceError(claimError.message, 500);
  }

  await syncCompletedCount(me.player_id);

  await recordEvent({
    roomId: room.id,
    type: EventType.CardClaimed,
    actorId: me.player_id,
    cardId,
  });

  return { claimId: claim.id as string, cardId, contestEndsAt };
}

export async function accusePlayer(input: { code: string; token: string; accusedId: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);
  const now = new Date();

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida nao esta em andamento", 409);
  }

  if (input.accusedId === me.player_id) {
    throw new ServiceError("nao da para acusar voce mesmo", 422);
  }

  if (isAccusationBlocked(me.accusation_blocked_until, now)) {
    throw new ServiceError("aguarde antes de acusar de novo", 429);
  }

  const { data: accusedSecret } = await client
    .from("player_secrets")
    .select("player_id, armed_until")
    .eq("player_id", input.accusedId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (!accusedSecret) {
    throw new ServiceError("jogador nao esta nesta sala", 404);
  }

  const wasCorrect = isArmed(accusedSecret.armed_until as string | null, now);
  const penalizedId = wasCorrect ? input.accusedId : me.player_id;

  await client.from("accusations").insert({
    room_id: room.id,
    accuser_id: me.player_id,
    accused_id: input.accusedId,
    was_correct: wasCorrect,
  });

  const { data: drawn } = await client.rpc("draw_penalty_cards", {
    p_room: room.id,
    p_player: penalizedId,
    p_count: room.penalty_card_count,
  });

  const drawnCount = (drawn as number | null) ?? 0;
  const pointsLost = room.penalty_card_count - drawnCount;

  if (pointsLost > 0) {
    const { data: penalized } = await client
      .from("players")
      .select("points")
      .eq("id", penalizedId)
      .single();

    await client
      .from("players")
      .update({ points: (penalized?.points ?? 0) - pointsLost })
      .eq("id", penalizedId);
  }

  if (wasCorrect) {
    await client
      .from("player_secrets")
      .update({ armed_card_id: null, armed_at: null, armed_until: null })
      .eq("player_id", input.accusedId);
  } else {
    await client
      .from("player_secrets")
      .update({
        accusation_blocked_until: new Date(
          now.getTime() + room.accusation_cooldown_seconds * 1000,
        ).toISOString(),
      })
      .eq("player_id", me.player_id);
  }

  await recordEvent({
    roomId: room.id,
    type: wasCorrect ? EventType.AccusationCorrect : EventType.AccusationWrong,
    actorId: me.player_id,
    targetId: input.accusedId,
    pointsDelta: -pointsLost,
  });

  return { wasCorrect, penalizedId, drawnCount, pointsLost };
}

export async function voteContest(input: {
  code: string;
  token: string;
  claimId: string;
  saidIt: boolean;
}) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);

  const { data: claim } = await client
    .from("claims")
    .select("*")
    .eq("id", input.claimId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (!claim) {
    throw new ServiceError("reivindicacao nao encontrada", 404);
  }

  if (claim.status !== ClaimStatus.Pending) {
    throw new ServiceError("essa reivindicacao ja foi resolvida", 409);
  }

  if (claim.player_id === me.player_id) {
    throw new ServiceError("quem reivindicou nao vota", 422);
  }

  const { error } = await client
    .from("contest_votes")
    .upsert(
      { claim_id: input.claimId, voter_id: me.player_id, said_it: input.saidIt },
      { onConflict: "claim_id,voter_id" },
    );

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return settleClaims({ code: input.code });
}

export async function settleClaims(input: { code: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const now = new Date();

  const { data: pending } = await client
    .from("claims")
    .select("*")
    .eq("room_id", room.id)
    .eq("status", ClaimStatus.Pending);

  const { count: playerCount } = await client
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room.id);

  const eligibleVoterCount = Math.max(0, (playerCount ?? 0) - 1);
  const resolved: Array<{ claimId: string; status: string }> = [];

  for (const claim of pending ?? []) {
    const { data: votes } = await client
      .from("contest_votes")
      .select("voter_id, said_it")
      .eq("claim_id", claim.id);

    const outcome = resolveContest({
      votes: (votes ?? []).map((vote) => ({
        voterId: vote.voter_id as string,
        saidIt: vote.said_it as boolean,
      })),
      eligibleVoterCount,
      contestEndsAt: claim.contest_ends_at as string,
      now,
    });

    if (outcome === ClaimStatus.Pending) {
      continue;
    }

    await client
      .from("claims")
      .update({ status: outcome, resolved_at: now.toISOString() })
      .eq("id", claim.id)
      .eq("status", ClaimStatus.Pending);

    if (outcome === ClaimStatus.Reverted) {
      const { data: maxPosition } = await client
        .from("hand_cards")
        .select("position")
        .eq("player_id", claim.player_id)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

      await client.from("hand_cards").insert({
        room_id: room.id,
        player_id: claim.player_id,
        card_id: claim.card_id,
        position: ((maxPosition?.position as number | undefined) ?? 0) + 1,
      });

      await client.rpc("draw_penalty_cards", {
        p_room: room.id,
        p_player: claim.player_id,
        p_count: room.penalty_card_count,
      });

      await client.rpc("sync_hand_count", { p_player: claim.player_id });
      await syncCompletedCount(claim.player_id as string);
    }

    await recordEvent({
      roomId: room.id,
      type: outcome === ClaimStatus.Reverted ? EventType.ClaimReverted : EventType.ClaimConfirmed,
      actorId: claim.player_id,
      cardId: claim.card_id,
    });

    resolved.push({ claimId: claim.id as string, status: outcome });
  }

  const winner = await detectWinner(room.id);

  return { resolved, winnerId: winner };
}

async function syncCompletedCount(playerId: string) {
  const client = serverClient();
  const { count } = await client
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId)
    .neq("status", ClaimStatus.Reverted);

  await client.from("players").update({ completed_count: count ?? 0 }).eq("id", playerId);
}

async function detectWinner(roomId: string): Promise<string | null> {
  const client = serverClient();

  const { data: room } = await client
    .from("rooms")
    .select("phase, winner_player_id")
    .eq("id", roomId)
    .single();

  if (room?.winner_player_id) {
    return room.winner_player_id as string;
  }

  const { data: candidates } = await client
    .from("players")
    .select("id")
    .eq("room_id", roomId)
    .eq("hand_count", 0);

  for (const candidate of candidates ?? []) {
    const { count: pendingClaims } = await client
      .from("claims")
      .select("id", { count: "exact", head: true })
      .eq("player_id", candidate.id)
      .eq("status", ClaimStatus.Pending);

    if ((pendingClaims ?? 0) > 0) {
      continue;
    }

    await client
      .from("rooms")
      .update({
        phase: RoomPhase.Finished,
        winner_player_id: candidate.id,
        finished_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .is("winner_player_id", null);

    await client.rpc("apply_match_to_scoreboard", { p_room: roomId });
    await recordEvent({ roomId, type: EventType.MatchWon, actorId: candidate.id as string });

    return candidate.id as string;
  }

  return null;
}

export async function sweepRoom(input: { code: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  await client
    .from("player_secrets")
    .update({ armed_card_id: null, armed_at: null, armed_until: null })
    .eq("room_id", room.id)
    .lt("armed_until", new Date().toISOString());

  return settleClaims({ code: input.code });
}

export async function matchSummary(input: { code: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  const [{ data: players }, { data: accusations }] = await Promise.all([
    client.from("players").select("id, name, completed_count").eq("room_id", room.id).order("seat"),
    client.from("accusations").select("accuser_id, accused_id, was_correct").eq("room_id", room.id),
  ]);

  const rows = accusations ?? [];

  return {
    code: room.code,
    phase: room.phase,
    winnerPlayerId: room.winner_player_id,
    players: (players ?? []).map((player) => ({
      name: player.name as string,
      cardsCompleted: (player.completed_count as number) ?? 0,
      correctAccusations: rows.filter((row) => row.accuser_id === player.id && row.was_correct)
        .length,
      wrongAccusations: rows.filter((row) => row.accuser_id === player.id && !row.was_correct)
        .length,
      timesCaught: rows.filter((row) => row.accused_id === player.id && row.was_correct).length,
      isWinner: room.winner_player_id === player.id,
    })),
  };
}

export async function crewScoreboard(input: { crewId: string }) {
  const { data, error } = await serverClient()
    .from("scoreboard_entries")
    .select(
      "name, points, matches_played, matches_won, cards_completed, correct_accusations, times_caught, wrong_accusations",
    )
    .eq("owner_key", input.crewId)
    .order("points", { ascending: false });

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return {
    crewId: input.crewId,
    entries: (data ?? []).map((row) => ({
      name: row.name as string,
      points: row.points as number,
      matchesPlayed: row.matches_played as number,
      matchesWon: row.matches_won as number,
      cardsCompleted: row.cards_completed as number,
      correctAccusations: row.correct_accusations as number,
      timesCaught: row.times_caught as number,
      wrongAccusations: row.wrong_accusations as number,
    })),
  };
}

export async function resetCrewScoreboard(input: { crewId: string }) {
  const { error } = await serverClient()
    .from("scoreboard_entries")
    .delete()
    .eq("owner_key", input.crewId);

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return { reset: true };
}

export async function rematch(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);

  if (!me.players.is_host) {
    throw new ServiceError("apenas o host pode iniciar a revanche", 403);
  }

  if (room.phase !== RoomPhase.Finished) {
    throw new ServiceError("a partida atual nao terminou", 409);
  }

  const { data: existing } = await client
    .from("rooms")
    .select("id, code")
    .eq("crew_id", room.crew_id)
    .eq("phase", RoomPhase.Lobby)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { code: existing.code as string, alreadyOpen: true };
  }

  const { data: code, error: codeError } = await client.rpc("generate_room_code");

  if (codeError) {
    throw new ServiceError(codeError.message, 500);
  }

  const { data: created, error: createError } = await client
    .from("rooms")
    .insert({
      code,
      adult_content_enabled: room.adult_content_enabled,
      hard_content_enabled: room.hard_content_enabled,
      initial_hand_size: room.initial_hand_size,
      penalty_card_count: room.penalty_card_count,
      crew_id: room.crew_id,
    })
    .select()
    .single();

  if (createError) {
    throw new ServiceError(createError.message, 500);
  }

  return { code: created.code as string, alreadyOpen: false };
}

export async function kickPlayer(input: { code: string; token: string; playerId: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayerByToken(room, input.token);

  if (!me.players.is_host) {
    throw new ServiceError("apenas o host pode remover jogadores", 403);
  }

  if (input.playerId === me.player_id) {
    throw new ServiceError("o host nao pode remover a si mesmo", 422);
  }

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("so da para remover jogador antes de comecar", 409);
  }

  const { data: target } = await client
    .from("players")
    .select("id, name")
    .eq("id", input.playerId)
    .eq("room_id", room.id)
    .maybeSingle();

  if (!target) {
    throw new ServiceError("jogador nao esta nesta sala", 404);
  }

  const { error } = await client.from("players").delete().eq("id", input.playerId);

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return { removed: target.name as string };
}
