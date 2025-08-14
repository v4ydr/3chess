import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { Cell } from './Cell';

// Simplified and corrected movement rules for the hexagonal board
export class SimplifiedMovement {
  
  // Check if position is valid on the board
  static isValidPos(board: Cell[][], pos: Position): boolean {
    if (pos.x < 0 || pos.x >= 12 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    return board[pos.y][pos.x].points !== null;
  }
  
  // Get all valid rook moves
  static getRookMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Rook moves orthogonally - try all 4 directions plus the diagonal transitions through center
    const directions = [
      { x: 0, y: 1 },   // down
      { x: 0, y: -1 },  // up
      { x: 1, y: 0 },   // right
      { x: -1, y: 0 },  // left
      // Diagonal transitions for center area
      { x: 1, y: 1 },   
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
    ];
    
    for (const dir of directions) {
      for (let i = 1; i < 12; i++) {
        const newPos = { x: from.x + dir.x * i, y: from.y + dir.y * i };
        
        if (!this.isValidPos(board, newPos)) break;
        
        const targetPiece = board[newPos.y][newPos.x].piece;
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push(newPos);
          }
          break;
        }
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // Get all valid bishop moves
  static getBishopMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // Bishop moves diagonally and must stay on same color
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
        
        // Bishop must stay on same color
        if (targetCell.color !== fromCell.color) continue;
        
        const targetPiece = targetCell.piece;
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push(newPos);
          }
          break;
        }
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // Get all valid queen moves
  static getQueenMoves(board: Cell[][], from: Position): Position[] {
    // Queen combines rook and bishop moves
    const rookMoves = this.getRookMoves(board, from);
    const bishopMoves = this.getBishopMoves(board, from);
    return [...rookMoves, ...bishopMoves];
  }
  
  // Get all valid king moves
  static getKingMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // King moves one square in any direction
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
      
      const targetPiece = board[newPos.y][newPos.x].piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // Get all valid knight moves
  static getKnightMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Knight moves in L-shape: 2 squares in one direction, 1 in perpendicular
    const knightMoves = [
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: 2 },
      { x: -1, y: -2 },
      // Additional moves for hexagonal board
      { x: 3, y: 0 },
      { x: -3, y: 0 },
      { x: 0, y: 3 },
      { x: 0, y: -3 },
      { x: 2, y: 2 },
      { x: -2, y: -2 },
      { x: 2, y: -2 },
      { x: -2, y: 2 },
    ];
    
    const fromCell = board[from.y][from.x];
    
    for (const move of knightMoves) {
      const newPos = { x: from.x + move.x, y: from.y + move.y };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetCell = board[newPos.y][newPos.x];
      
      // Knight should land on opposite color (but this is complex on hex board, so we'll allow all valid moves)
      const targetPiece = targetCell.piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    // Remove duplicates
    const uniqueMoves: Position[] = [];
    for (const move of moves) {
      if (!uniqueMoves.some(m => m.x === move.x && m.y === move.y)) {
        uniqueMoves.push(move);
      }
    }
    
    return uniqueMoves;
  }
  
  // Get all valid pawn moves
  static getPawnMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Determine pawn direction based on player and position
    let forwardDirs: Position[] = [];
    let captureDirs: Position[] = [];
    
    if (piece.player === Player.White) {
      // White pawns generally move down-right (towards center then enemy bases)
      if (from.y < 4) {
        // Still in white territory, move towards center
        forwardDirs = [{ x: 0, y: 1 }];
        captureDirs = [{ x: 1, y: 1 }, { x: -1, y: 1 }];
        
        // Also allow rightward movement for pawns on the right edge
        if (from.x === 5) {
          forwardDirs.push({ x: 1, y: 0 });
          captureDirs.push({ x: 1, y: -1 });
        }
      } else {
        // Outside white territory, move towards other bases
        forwardDirs = [{ x: 1, y: 0 }, { x: 0, y: 1 }];
        captureDirs = [{ x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }];
      }
    } else if (piece.player === Player.Red) {
      // Red pawns - from left and right sides
      if (from.x <= 1) {
        // Left side red pawns move right
        forwardDirs = [{ x: 1, y: 0 }];
        captureDirs = [{ x: 1, y: 1 }, { x: 1, y: -1 }];
      } else if (from.x >= 10) {
        // Right side red pawns move left
        forwardDirs = [{ x: -1, y: 0 }];
        captureDirs = [{ x: -1, y: 1 }, { x: -1, y: -1 }];
      } else if (from.y === 5 || from.y === 6) {
        // Middle red pawns
        if (from.x < 6) {
          forwardDirs = [{ x: 1, y: 0 }];
          captureDirs = [{ x: 1, y: 1 }, { x: 1, y: -1 }];
        } else {
          forwardDirs = [{ x: -1, y: 0 }];
          captureDirs = [{ x: -1, y: 1 }, { x: -1, y: -1 }];
        }
      } else {
        // Red pawns in enemy territory
        if (from.y < 5) {
          // Move towards black
          forwardDirs = [{ x: 1, y: 1 }];
          captureDirs = [{ x: 0, y: 1 }, { x: 1, y: 0 }];
        } else {
          // Move towards white
          forwardDirs = [{ x: -1, y: -1 }];
          captureDirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }];
        }
      }
    } else {
      // Black pawns generally move up-left (towards center then enemy bases)
      if (from.y >= 8 && from.x >= 8) {
        // Still in black territory, move towards center
        forwardDirs = [{ x: 0, y: -1 }];
        captureDirs = [{ x: 1, y: -1 }, { x: -1, y: -1 }];
        
        // Also allow leftward movement for pawns on the left edge
        if (from.x === 9) {
          forwardDirs.push({ x: -1, y: 0 });
          captureDirs.push({ x: -1, y: 1 });
        }
      } else {
        // Outside black territory, move towards other bases
        forwardDirs = [{ x: -1, y: 0 }, { x: 0, y: -1 }];
        captureDirs = [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }];
      }
    }
    
    // Check forward moves (non-capturing)
    for (const dir of forwardDirs) {
      const newPos = { x: from.x + dir.x, y: from.y + dir.y };
      
      if (this.isValidPos(board, newPos)) {
        const targetPiece = board[newPos.y][newPos.x].piece;
        if (!targetPiece) {
          moves.push(newPos);
          
          // Check for double move from starting position
          if (this.isPawnStartingPosition(from, piece.player)) {
            const doublePos = { x: from.x + dir.x * 2, y: from.y + dir.y * 2 };
            if (this.isValidPos(board, doublePos) && !board[doublePos.y][doublePos.x].piece) {
              moves.push(doublePos);
            }
          }
        }
      }
    }
    
    // Check capture moves
    for (const dir of captureDirs) {
      const newPos = { x: from.x + dir.x, y: from.y + dir.y };
      
      if (this.isValidPos(board, newPos)) {
        const targetPiece = board[newPos.y][newPos.x].piece;
        if (targetPiece && targetPiece.player !== piece.player) {
          moves.push(newPos);
        }
      }
    }
    
    return moves;
  }
  
  // Check if pawn is in starting position
  static isPawnStartingPosition(pos: Position, player: Player): boolean {
    if (player === Player.White) {
      // White pawns start at row 1 (x: 0-3) and column 5 (y: 0-3)
      return (pos.y === 1 && pos.x <= 3) || (pos.x === 5 && pos.y <= 3);
    } else if (player === Player.Red) {
      // Red pawns start at column 1 (y: 4-7) and row 5 (x: 8-11)
      return (pos.x === 1 && pos.y >= 4 && pos.y <= 7) || (pos.y === 5 && pos.x >= 8 && pos.x <= 11);
    } else {
      // Black pawns start at row 10 (x: 8-11) and column 9 (y: 8-11)
      return (pos.y === 10 && pos.x >= 8 && pos.x <= 11) || (pos.x === 9 && pos.y >= 8 && pos.y <= 11);
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
    
    // Check piece exists and belongs to current player
    if (!piece || piece.player !== currentPlayer) {
      return false;
    }
    
    // Get all possible moves for this piece
    const possibleMoves = this.getPossibleMoves(board, from);
    
    // Check if target is in possible moves
    return possibleMoves.some(move => move.x === to.x && move.y === to.y);
  }
}