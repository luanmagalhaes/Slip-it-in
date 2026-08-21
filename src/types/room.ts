export const RoomPhase = {
  Lobby: "LOBBY",
  Playing: "PLAYING",
  Finished: "FINISHED",
} as const;

export type RoomPhase = (typeof RoomPhase)[keyof typeof RoomPhase];

export const ClaimStatus = {
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  Reverted: "REVERTED",
} as const;

export type ClaimStatus = (typeof ClaimStatus)[keyof typeof ClaimStatus];

export const EventType = {
  PlayerJoined: "PLAYER_JOINED",
  MatchStarted: "MATCH_STARTED",
  CardClaimed: "CARD_CLAIMED",
  ClaimConfirmed: "CLAIM_CONFIRMED",
  ClaimReverted: "CLAIM_REVERTED",
  AccusationCorrect: "ACCUSATION_CORRECT",
  AccusationWrong: "ACCUSATION_WRONG",
  MatchWon: "MATCH_WON",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export interface RoomRow {
  id: string;
  code: string;
  phase: RoomPhase;
  adult_content_enabled: boolean;
  hard_content_enabled: boolean;
  initial_hand_size: number;
  penalty_card_count: number;
  arm_window_seconds: number;
  contest_window_seconds: number;
  accusation_cooldown_seconds: number;
  host_player_id: string | null;
  winner_player_id: string | null;
  event_sequence: number;
}

export interface PlayerRow {
  id: string;
  room_id: string;
  name: string;
  seat: number;
  is_host: boolean;
  connected: boolean;
  hand_count: number;
  completed_count: number;
  points: number;
}

export interface ClaimRow {
  id: string;
  room_id: string;
  player_id: string;
  card_id: string;
  status: ClaimStatus;
  contest_ends_at: string;
  created_at: string;
}

export interface EventRow {
  id: number;
  room_id: string;
  sequence: number;
  type: EventType;
  actor_id: string | null;
  target_id: string | null;
  card_id: string | null;
  points_delta: number;
  created_at: string;
}

export interface MyState {
  playerId: string;
  name: string;
  isHost: boolean;
  handCardIds: string[];
  armedCardId: string | null;
  armedUntil: string | null;
  accusationBlockedUntil: string | null;
}
