// Game type definitions

export enum Player {
  WHITE = 'white',
  RED = 'red',
  BLACK = 'black',
}

export enum PieceType {
  KING = 'king',
  QUEEN = 'queen',
  ROOK = 'rook',
  BISHOP = 'bishop',
  KNIGHT = 'knight',
  PAWN = 'pawn',
}

export interface Piece {
  player: Player;
  type: PieceType;
}

export interface Position {
  node: string;
}

export interface Move {
  player: Player;
  piece: PieceType;
  from: string;
  to: string;
  captured?: Piece;
}

export interface BoardState {
  pieces: Map<string, Piece>;
  currentPlayer: Player;
  selectedNode: string | null;
  possibleMoves: string[];
  moveHistory: Move[];
  lastMoveFrom: string | null;
  lastMoveTo: string | null;
}

export enum EdgeType {
  RANK = 'rank',
  FILE = 'file',
  DIAGONAL = 'diagonal',
}

export interface GraphEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export interface Ray {
  squares: string[];
}

