import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { Cell } from './Cell';

// Complete Yalta chess movement implementation
// The board is three 4x8 sections stitched together in a hexagon

export class YaltaMovement {
  
  // Check if position has a valid cell on the hex board
  static isValidPos(board: Cell[][], pos: Position): boolean {
    if (pos.x < 0 || pos.x >= 12 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    return board[pos.y][pos.x].points !== null;
  }
  
  // ROOK MOVEMENT - follows grid lines, even through section transitions
  static getRookMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Rook moves in 4 orthogonal directions
    const directions = [
      { x: 0, y: 1 },   // down
      { x: 0, y: -1 },  // up
      { x: 1, y: 0 },   // right
      { x: -1, y: 0 },  // left
    ];
    
    for (const dir of directions) {
      // Move in this direction until blocked
      for (let i = 1; i < 12; i++) {
        const newPos = { x: from.x + dir.x * i, y: from.y + dir.y * i };
        
        // Check if position is valid
        if (!this.isValidPos(board, newPos)) break;
        
        const targetPiece = board[newPos.y][newPos.x].piece;
        if (targetPiece) {
          // Can capture enemy piece
          if (targetPiece.player !== piece.player) {
            moves.push(newPos);
          }
          break; // Stop at any piece
        }
        
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // BISHOP MOVEMENT - follows diagonals, stays on same color
  static getBishopMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // Bishop moves in 4 diagonal directions
    const directions = [
      { x: 1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
    ];
    
    for (const dir of directions) {
      for (let i = 1; i < 12; i++) {
        const newPos = { x: from.x + dir.x * i, y: from.y + dir.y * i };
        
        if (!this.isValidPos(board, newPos)) break;
        
        const targetCell = board[newPos.y][newPos.x];
        
        // Bishop MUST stay on same color
        if (targetCell.color !== fromCell.color) {
          continue; // Skip this square but keep looking further
        }
        
        const targetPiece = targetCell.piece;
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push(newPos);
          }
          break; // Stop at any piece
        }
        
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // QUEEN MOVEMENT - combines rook and bishop
  static getQueenMoves(board: Cell[][], from: Position): Position[] {
    return [...this.getRookMoves(board, from), ...this.getBishopMoves(board, from)];
  }
  
  // KING MOVEMENT - one square in any direction (with center restrictions)
  static getKingMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // King moves one square in 8 directions
    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
    ];
    
    for (const dir of directions) {
      const newPos = { x: from.x + dir.x, y: from.y + dir.y };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetCell = board[newPos.y][newPos.x];
      
      // Special rule: King cannot move straight through center to opposite color
      // Only applies to orthogonal moves in the center area
      if (from.x >= 4 && from.x <= 7 && from.y >= 4 && from.y <= 7 &&
          newPos.x >= 4 && newPos.x <= 7 && newPos.y >= 4 && newPos.y <= 7) {
        // Both positions are in center
        if (fromCell.color !== targetCell.color && 
            (dir.x === 0 || dir.y === 0)) {
          // Can't move orthogonally to opposite color in center
          continue;
        }
      }
      
      const targetPiece = targetCell.piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // KNIGHT MOVEMENT - L-shaped, lands on opposite color
  static getKnightMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // All possible L-shaped moves
    const knightMoves = [
      // Standard chess knight moves
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: 2 },
      { x: -1, y: -2 },
    ];
    
    for (const move of knightMoves) {
      const newPos = { x: from.x + move.x, y: from.y + move.y };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetCell = board[newPos.y][newPos.x];
      
      // Knight must land on opposite color
      if (targetCell.color === fromCell.color) continue;
      
      const targetPiece = targetCell.piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // PAWN MOVEMENT - moves away from home base toward enemy bases
  static getPawnMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Determine pawn direction based on player and position
    let forwardMoves: Position[] = [];
    let captureMoves: Position[] = [];
    
    if (piece.player === Player.White) {
      // White pawns start at bottom, move up/toward other sections
      
      // Pawns in rows 0-3
      if (from.y <= 3) {
        // Can move up
        forwardMoves.push({ x: from.x, y: from.y + 1 });
        
        // Can capture diagonally up
        captureMoves.push(
          { x: from.x + 1, y: from.y + 1 },
          { x: from.x - 1, y: from.y + 1 }
        );
        
        // Special: rightmost white pawns can also move right
        if (from.x === 5) {
          forwardMoves.push({ x: from.x + 1, y: from.y });
          captureMoves.push({ x: from.x + 1, y: from.y - 1 });
        }
      } else {
        // In enemy territory - keep moving away from white base
        forwardMoves.push({ x: from.x, y: from.y + 1 });
        if (from.x < 8) {
          forwardMoves.push({ x: from.x + 1, y: from.y });
        }
        captureMoves.push(
          { x: from.x + 1, y: from.y + 1 },
          { x: from.x - 1, y: from.y + 1 },
          { x: from.x + 1, y: from.y - 1 }
        );
      }
      
    } else if (piece.player === Player.Red) {
      // Red pawns - two starting areas (left and right sides)
      
      if (from.x <= 3) {
        // Left side red pawns - move right toward center/enemies
        forwardMoves.push({ x: from.x + 1, y: from.y });
        
        // Special: bottom red pawns can also move up
        if (from.y === 5 || from.y === 6) {
          forwardMoves.push({ x: from.x, y: from.y + 1 });
        }
        
        captureMoves.push(
          { x: from.x + 1, y: from.y + 1 },
          { x: from.x + 1, y: from.y - 1 }
        );
      } else if (from.x >= 8) {
        // Right side red pawns - move left toward center/enemies
        forwardMoves.push({ x: from.x - 1, y: from.y });
        
        // Special: top red pawns can also move down
        if (from.y === 5 || from.y === 6) {
          forwardMoves.push({ x: from.x, y: from.y - 1 });
        }
        
        captureMoves.push(
          { x: from.x - 1, y: from.y + 1 },
          { x: from.x - 1, y: from.y - 1 }
        );
      } else {
        // In center/enemy territory
        if (from.y < 5) {
          // Move toward white
          forwardMoves.push({ x: from.x, y: from.y - 1 });
        } else {
          // Move toward black
          forwardMoves.push({ x: from.x, y: from.y + 1 });
        }
        captureMoves.push(
          { x: from.x + 1, y: from.y },
          { x: from.x - 1, y: from.y },
          { x: from.x, y: from.y + 1 },
          { x: from.x, y: from.y - 1 }
        );
      }
      
    } else {
      // Black pawns start at top, move down/toward other sections
      
      // Pawns in rows 8-11
      if (from.y >= 8) {
        // Can move down
        forwardMoves.push({ x: from.x, y: from.y - 1 });
        
        // Can capture diagonally down
        captureMoves.push(
          { x: from.x + 1, y: from.y - 1 },
          { x: from.x - 1, y: from.y - 1 }
        );
        
        // Special: leftmost black pawns can also move left
        if (from.x === 9) {
          forwardMoves.push({ x: from.x - 1, y: from.y });
          captureMoves.push({ x: from.x - 1, y: from.y + 1 });
        }
      } else {
        // In enemy territory - keep moving away from black base
        forwardMoves.push({ x: from.x, y: from.y - 1 });
        if (from.x > 3) {
          forwardMoves.push({ x: from.x - 1, y: from.y });
        }
        captureMoves.push(
          { x: from.x - 1, y: from.y - 1 },
          { x: from.x + 1, y: from.y - 1 },
          { x: from.x - 1, y: from.y + 1 }
        );
      }
    }
    
    // Check forward moves (non-capturing)
    for (const move of forwardMoves) {
      if (this.isValidPos(board, move) && !board[move.y][move.x].piece) {
        moves.push(move);
        
        // Check for double move from starting position
        if (this.isPawnStartingPosition(from, piece.player)) {
          // Try to move two squares in same direction
          const doubleMove = {
            x: from.x + (move.x - from.x) * 2,
            y: from.y + (move.y - from.y) * 2
          };
          if (this.isValidPos(board, doubleMove) && !board[doubleMove.y][doubleMove.x].piece) {
            moves.push(doubleMove);
          }
        }
      }
    }
    
    // Check capture moves
    for (const move of captureMoves) {
      if (this.isValidPos(board, move)) {
        const targetPiece = board[move.y][move.x].piece;
        if (targetPiece && targetPiece.player !== piece.player) {
          moves.push(move);
        }
      }
    }
    
    return moves;
  }
  
  // Check if pawn is in starting position
  static isPawnStartingPosition(pos: Position, player: Player): boolean {
    if (player === Player.White) {
      // White pawns start at row 1 and column 5
      return pos.y === 1 || (pos.x === 5 && pos.y <= 3);
    } else if (player === Player.Red) {
      // Red pawns start at column 1 (left) and row 5
      return pos.x === 1 || pos.y === 5;
    } else {
      // Black pawns start at row 10 and column 9
      return pos.y === 10 || (pos.x === 9 && pos.y >= 8);
    }
  }
  
  // Get all possible moves for a piece
  static getPossibleMoves(board: Cell[][], from: Position): Position[] {
    const piece = board[from.y][from.x].piece;
    if (!piece) return [];
    
    switch (piece.type) {
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
  static isValidMove(board: Cell[][], from: Position, to: Position, currentPlayer: Player): boolean {
    const piece = board[from.y][from.x].piece;
    
    if (!piece || piece.player !== currentPlayer) {
      return false;
    }
    
    const possibleMoves = this.getPossibleMoves(board, from);
    return possibleMoves.some(move => move.x === to.x && move.y === to.y);
  }
}