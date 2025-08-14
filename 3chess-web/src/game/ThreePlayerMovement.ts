import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { Cell } from './Cell';

// Proper three-player chess movement based on the Python implementation
// Each player has their own 4x8 section, and directions transform when crossing sections

export class ThreePlayerMovement {
  
  // Check if position is valid
  static isValidPos(board: Cell[][], pos: Position): boolean {
    if (pos.x < 0 || pos.x >= 12 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    return board[pos.y][pos.x].points !== null;
  }
  
  // Get player section for a position
  // White: (0-5, 0-3) - bottom left
  // Red: (0-3, 4-7) left side and (8-11, 4-7) right side
  // Black: (6-11, 8-11) - top right
  static getPlayerSection(pos: Position): Player | 'center' {
    // White section
    if ((pos.x <= 5 && pos.y <= 3)) {
      return Player.White;
    }
    // Black section  
    if ((pos.x >= 6 && pos.y >= 8)) {
      return Player.Black;
    }
    // Red sections
    if ((pos.x <= 3 && pos.y >= 4 && pos.y <= 7) || 
        (pos.x >= 8 && pos.y >= 4 && pos.y <= 7)) {
      return Player.Red;
    }
    // Center area
    return 'center';
  }
  
  // Walk in a direction from a position, handling section transitions
  static walkPath(board: Cell[][], from: Position, dx: number, dy: number, maxSteps: number = 12): Position[] {
    const path: Position[] = [];
    let current = from;
    
    for (let i = 0; i < maxSteps; i++) {
      const next = { x: current.x + dx, y: current.y + dy };
      
      if (!this.isValidPos(board, next)) break;
      
      path.push(next);
      current = next;
    }
    
    return path;
  }
  
  // ROOK MOVEMENT
  static getRookMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Rook moves orthogonally
    const directions = [
      { dx: 0, dy: 1 },   // down
      { dx: 0, dy: -1 },  // up
      { dx: 1, dy: 0 },   // right
      { dx: -1, dy: 0 },  // left
    ];
    
    for (const { dx, dy } of directions) {
      const path = this.walkPath(board, from, dx, dy);
      
      for (const pos of path) {
        const targetPiece = board[pos.y][pos.x].piece;
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push(pos);
          }
          break;
        }
        moves.push(pos);
      }
    }
    
    return moves;
  }
  
  // BISHOP MOVEMENT
  static getBishopMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // Bishop moves diagonally
    const directions = [
      { dx: 1, dy: 1 },   // SE
      { dx: -1, dy: -1 }, // NW
      { dx: 1, dy: -1 },  // NE
      { dx: -1, dy: 1 },  // SW
    ];
    
    for (const { dx, dy } of directions) {
      const path = this.walkPath(board, from, dx, dy);
      
      for (const pos of path) {
        const targetCell = board[pos.y][pos.x];
        
        // Bishop must stay on same color
        if (targetCell.color !== fromCell.color) {
          continue;
        }
        
        const targetPiece = targetCell.piece;
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push(pos);
          }
          break;
        }
        moves.push(pos);
      }
    }
    
    return moves;
  }
  
  // QUEEN MOVEMENT
  static getQueenMoves(board: Cell[][], from: Position): Position[] {
    return [...this.getRookMoves(board, from), ...this.getBishopMoves(board, from)];
  }
  
  // KING MOVEMENT
  static getKingMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // King moves one square in any direction
    const directions = [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];
    
    for (const { dx, dy } of directions) {
      const newPos = { x: from.x + dx, y: from.y + dy };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetPiece = board[newPos.y][newPos.x].piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // KNIGHT MOVEMENT - L-shaped moves
  static getKnightMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // L-shaped moves: 2 in one direction, 1 perpendicular
    // Following the Python implementation patterns
    const knightMoves = [
      // NNE, NEE, SEE, SSE, SSW, SWW, NWW, NNW
      { dx: 1, dy: -2 },  // NNE
      { dx: 2, dy: -1 },  // NEE
      { dx: 2, dy: 1 },   // SEE
      { dx: 1, dy: 2 },   // SSE
      { dx: -1, dy: 2 },  // SSW
      { dx: -2, dy: 1 },  // SWW
      { dx: -2, dy: -1 }, // NWW
      { dx: -1, dy: -2 }, // NNW
    ];
    
    for (const { dx, dy } of knightMoves) {
      const newPos = { x: from.x + dx, y: from.y + dy };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetPiece = board[newPos.y][newPos.x].piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // PAWN MOVEMENT
  static getPawnMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const section = this.getPlayerSection(from);
    let forwardDir: { dx: number, dy: number } | null = null;
    let captureDirections: { dx: number, dy: number }[] = [];
    
    // Determine pawn movement based on player and position
    if (piece.player === Player.White) {
      // White pawns move "north" from their perspective (up on our board)
      if (section === Player.White || from.y <= 3) {
        // In home section, move up
        forwardDir = { dx: 0, dy: 1 };
        captureDirections = [
          { dx: 1, dy: 1 },  // NE
          { dx: -1, dy: 1 }, // NW
        ];
        
        // Special case for rightmost white pawns
        if (from.x === 5 && from.y <= 3) {
          // Can also move right into center
          forwardDir = { dx: 1, dy: 0 };
          captureDirections.push({ dx: 1, dy: 1 }, { dx: 1, dy: -1 });
        }
      } else {
        // In enemy territory, continue away from home
        forwardDir = { dx: 0, dy: 1 };
        captureDirections = [{ dx: 1, dy: 1 }, { dx: -1, dy: 1 }];
      }
      
    } else if (piece.player === Player.Red) {
      // Red pawns have two starting areas
      if (from.x <= 3) {
        // Left side red - move right toward center
        forwardDir = { dx: 1, dy: 0 };
        captureDirections = [
          { dx: 1, dy: 1 },  // SE
          { dx: 1, dy: -1 }, // NE
        ];
      } else if (from.x >= 8) {
        // Right side red - move left toward center
        forwardDir = { dx: -1, dy: 0 };
        captureDirections = [
          { dx: -1, dy: 1 },  // SW
          { dx: -1, dy: -1 }, // NW
        ];
      } else {
        // In center/enemy territory
        if (from.y < 5) {
          forwardDir = { dx: 0, dy: -1 }; // Move toward white
        } else {
          forwardDir = { dx: 0, dy: 1 };  // Move toward black
        }
        captureDirections = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 }
        ];
      }
      
    } else {
      // Black pawns move "north" from their perspective (down-left on our board)
      if (section === Player.Black || from.y >= 8) {
        // In home section, move down
        forwardDir = { dx: 0, dy: -1 };
        captureDirections = [
          { dx: 1, dy: -1 },  // SE from black's view
          { dx: -1, dy: -1 }, // SW from black's view
        ];
        
        // Special case for leftmost black pawns
        if (from.x === 9 && from.y >= 8) {
          // Can also move left into center
          forwardDir = { dx: -1, dy: 0 };
          captureDirections.push({ dx: -1, dy: 1 }, { dx: -1, dy: -1 });
        }
      } else {
        // In enemy territory, continue away from home
        forwardDir = { dx: 0, dy: -1 };
        captureDirections = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }];
      }
    }
    
    // Check forward move
    if (forwardDir) {
      const oneStep = { x: from.x + forwardDir.dx, y: from.y + forwardDir.dy };
      
      if (this.isValidPos(board, oneStep) && !board[oneStep.y][oneStep.x].piece) {
        moves.push(oneStep);
        
        // Check double move from starting position
        if (this.isPawnStartingPosition(from, piece.player)) {
          const twoStep = { x: from.x + forwardDir.dx * 2, y: from.y + forwardDir.dy * 2 };
          if (this.isValidPos(board, twoStep) && !board[twoStep.y][twoStep.x].piece) {
            moves.push(twoStep);
          }
        }
      }
    }
    
    // Check captures
    for (const { dx, dy } of captureDirections) {
      const capturePos = { x: from.x + dx, y: from.y + dy };
      
      if (this.isValidPos(board, capturePos)) {
        const targetPiece = board[capturePos.y][capturePos.x].piece;
        if (targetPiece && targetPiece.player !== piece.player) {
          moves.push(capturePos);
        }
      }
    }
    
    return moves;
  }
  
  // Check if pawn is in starting position
  static isPawnStartingPosition(pos: Position, player: Player): boolean {
    if (player === Player.White) {
      return pos.y === 1;
    } else if (player === Player.Red) {
      return pos.x === 1 || pos.x === 10 || pos.y === 5;
    } else {
      return pos.y === 10;
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