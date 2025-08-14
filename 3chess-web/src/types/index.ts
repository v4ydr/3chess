export const Player = {
  White: 0,
  Red: 1,
  Black: 2,
} as const;

export type Player = typeof Player[keyof typeof Player];

export const PieceType = {
  King: 0,
  Pawn: 1,
  Knight: 2,
  Bishop: 3,
  Rook: 4,
  Queen: 5,
} as const;

export type PieceType = typeof PieceType[keyof typeof PieceType];

export interface Piece {
  player: Player;
  type: PieceType;
}

export interface Position {
  x: number;
  y: number;
}

export interface CellData {
  x: number;
  y: number;
  piece: Piece | null;
  points: [number, number][];
  center: { x: number; y: number };
  color: string;
}