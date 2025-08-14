import { Player, PieceType } from '../types';
import type { Square } from './ProperBoard';
import { ProperBoard } from './ProperBoard';

// PROPER movement implementation that ACTUALLY checks for blocking pieces

export class ProperMovement {
  
  // Walk in a direction from a square, collecting all squares until blocked
  static walkInDirection(
    from: Square,
    getNext: (sq: Square) => Square | null,
    maxSteps: number = 8
  ): Square[] {
    const squares: Square[] = [];
    let current = from;
    
    for (let i = 0; i < maxSteps; i++) {
      const next = getNext(current);
      if (!next) break; // Hit edge of board
      
      squares.push(next);
      
      if (next.piece) break; // Hit a piece - stop here
      
      current = next;
    }
    
    return squares;
  }
  
  // Get all valid rook moves from a square
  static getRookMoves(board: ProperBoard, from: Square): Square[] {
    const moves: Square[] = [];
    if (!from.piece) return moves;
    
    const player = from.piece.player;
    
    // Check all 4 orthogonal directions
    const directions = [
      (sq: Square) => sq.north,
      (sq: Square) => sq.south,
      (sq: Square) => sq.east,
      (sq: Square) => sq.west,
    ];
    
    for (const getNext of directions) {
      const squares = this.walkInDirection(from, getNext);
      
      for (const sq of squares) {
        if (sq.piece) {
          // Can capture enemy piece
          if (sq.piece.player !== player) {
            moves.push(sq);
          }
          break; // Can't go past any piece
        } else {
          moves.push(sq); // Empty square
        }
      }
    }
    
    return moves;
  }
  
  // Get all valid bishop moves from a square
  static getBishopMoves(board: ProperBoard, from: Square): Square[] {
    const moves: Square[] = [];
    if (!from.piece) return moves;
    
    const player = from.piece.player;
    
    // Check all 4 diagonal directions
    const directions = [
      (sq: Square) => sq.ne,
      (sq: Square) => sq.nw,
      (sq: Square) => sq.se,
      (sq: Square) => sq.sw,
    ];
    
    for (const getNext of directions) {
      const squares = this.walkInDirection(from, getNext);
      
      for (const sq of squares) {
        if (sq.piece) {
          // Can capture enemy piece
          if (sq.piece.player !== player) {
            moves.push(sq);
          }
          break; // Can't go past any piece
        } else {
          moves.push(sq); // Empty square
        }
      }
    }
    
    return moves;
  }
  
  // Get all valid queen moves from a square
  static getQueenMoves(board: ProperBoard, from: Square): Square[] {
    return [
      ...this.getRookMoves(board, from),
      ...this.getBishopMoves(board, from)
    ];
  }
  
  // Get all valid king moves from a square
  static getKingMoves(board: ProperBoard, from: Square): Square[] {
    const moves: Square[] = [];
    if (!from.piece) return moves;
    
    const player = from.piece.player;
    
    // King can move one square in any direction
    const adjacentSquares = [
      from.north,
      from.south,
      from.east,
      from.west,
      from.ne,
      from.nw,
      from.se,
      from.sw,
    ].filter(sq => sq !== null) as Square[];
    
    for (const sq of adjacentSquares) {
      // Can move to empty square or capture enemy piece
      if (!sq.piece || sq.piece.player !== player) {
        moves.push(sq);
      }
    }
    
    return moves;
  }
  
  // Get all valid knight moves from a square
  static getKnightMoves(board: ProperBoard, from: Square): Square[] {
    const moves: Square[] = [];
    if (!from.piece) return moves;
    
    const player = from.piece.player;
    
    // Knight moves: 2 squares in one direction, then 1 perpendicular
    // We need to trace the actual path
    const knightPaths = [
      // 2 north, 1 east/west
      (sq: Square) => sq.north?.north?.east,
      (sq: Square) => sq.north?.north?.west,
      // 2 south, 1 east/west
      (sq: Square) => sq.south?.south?.east,
      (sq: Square) => sq.south?.south?.west,
      // 2 east, 1 north/south
      (sq: Square) => sq.east?.east?.north,
      (sq: Square) => sq.east?.east?.south,
      // 2 west, 1 north/south
      (sq: Square) => sq.west?.west?.north,
      (sq: Square) => sq.west?.west?.south,
    ];
    
    for (const getTarget of knightPaths) {
      const target = getTarget(from);
      if (target) {
        // Can move to empty square or capture enemy piece
        if (!target.piece || target.piece.player !== player) {
          moves.push(target);
        }
      }
    }
    
    return moves;
  }
  
  // Get all valid pawn moves from a square
  static getPawnMoves(board: ProperBoard, from: Square): Square[] {
    const moves: Square[] = [];
    if (!from.piece) return moves;
    
    const player = from.piece.player;
    const isStartingRank = from.row === 1; // Pawns start on row 1 (second row)
    
    // Pawn direction depends on which player
    // Each player's pawns move "forward" from their perspective
    let forward: Square | null = null;
    let captures: (Square | null)[] = [];
    
    if (player === Player.White) {
      // White pawns move north (towards Red/Black territories)
      forward = from.north;
      captures = [from.ne, from.nw];
    } else if (player === Player.Red) {
      // Red pawns move north (towards Black territory)
      forward = from.north;
      captures = [from.ne, from.nw];
    } else {
      // Black pawns move SOUTH from absolute perspective (but this is "forward" for them)
      // Since Black's board is at the top, their pawns move downward
      forward = from.south;
      captures = [from.se, from.sw];
    }
    
    // Check forward move (non-capturing)
    if (forward && !forward.piece) {
      moves.push(forward);
      
      // Check double move from starting position
      if (isStartingRank) {
        let twoForward: Square | null = null;
        
        if (player === Player.White) {
          twoForward = forward.north;
        } else if (player === Player.Red) {
          twoForward = forward.north;
        } else {
          // Black pawns move south
          twoForward = forward.south;
        }
        
        if (twoForward && !twoForward.piece) {
          moves.push(twoForward);
        }
      }
    }
    
    // Check captures
    for (const captureSquare of captures) {
      if (captureSquare && captureSquare.piece && captureSquare.piece.player !== player) {
        moves.push(captureSquare);
      }
    }
    
    return moves;
  }
  
  // Get all possible moves for a piece
  static getPossibleMoves(board: ProperBoard, from: Square): Square[] {
    if (!from.piece) return [];
    
    switch (from.piece.type) {
      case PieceType.Rook:
        return this.getRookMoves(board, from);
      case PieceType.Bishop:
        return this.getBishopMoves(board, from);
      case PieceType.Queen:
        return this.getQueenMoves(board, from);
      case PieceType.King:
        return this.getKingMoves(board, from);
      case PieceType.Knight:
        return this.getKnightMoves(board, from);
      case PieceType.Pawn:
        return this.getPawnMoves(board, from);
      default:
        return [];
    }
  }
  
  // Check if a move is valid
  static isValidMove(board: ProperBoard, from: Square, to: Square, currentPlayer: Player): boolean {
    if (!from.piece || from.piece.player !== currentPlayer) {
      return false;
    }
    
    const possibleMoves = this.getPossibleMoves(board, from);
    return possibleMoves.includes(to);
  }
}