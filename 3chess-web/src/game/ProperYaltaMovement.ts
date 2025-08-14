import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { Cell } from './Cell';

// The board is divided into three 4x8 sections:
// White section: (0-3, 0-3) and extensions
// Red section: Left (0-3, 4-7) and Right (8-11, 4-7) 
// Black section: (8-11, 8-11) and extensions
// Center: (4-7, 4-7)

export class ProperYaltaMovement {
  
  // Check if position is valid on the hexagonal board
  static isValidPos(board: Cell[][], pos: Position): boolean {
    if (pos.x < 0 || pos.x >= 12 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    // Check if this cell has valid points (exists on hex board)
    return board[pos.y][pos.x].points !== null;
  }
  
  // Determine which section a position is in
  static getBoardSection(pos: Position): 'white' | 'red-left' | 'red-right' | 'black' | 'center' {
    // Center area (4-7, 4-7)
    if (pos.x >= 4 && pos.x <= 7 && pos.y >= 4 && pos.y <= 7) {
      return 'center';
    }
    
    // White section (top-left quadrant and extensions)
    if ((pos.x <= 3 && pos.y <= 3) || 
        (pos.x === 4 && pos.y <= 3) || 
        (pos.x === 5 && pos.y <= 3) ||
        (pos.y === 4 && pos.x <= 3) ||
        (pos.y === 5 && pos.x <= 3)) {
      return 'white';
    }
    
    // Black section (bottom-right quadrant and extensions)
    if ((pos.x >= 8 && pos.y >= 8) ||
        (pos.x === 8 && pos.y >= 8) ||
        (pos.x === 9 && pos.y >= 8) ||
        (pos.y === 8 && pos.x >= 8) ||
        (pos.y === 9 && pos.x >= 8)) {
      return 'black';
    }
    
    // Red sections (left and right sides)
    if (pos.x <= 3) {
      return 'red-left';
    } else {
      return 'red-right';
    }
  }
  
  // ROOK MOVEMENT - moves along grid lines
  static getRookMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Rook moves orthogonally along grid lines
    const directions = [
      { x: 0, y: 1 },   // down
      { x: 0, y: -1 },  // up
      { x: 1, y: 0 },   // right
      { x: -1, y: 0 },  // left
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
  
  // BISHOP MOVEMENT - moves along diagonals, stays on same color
  static getBishopMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // Bishop moves diagonally
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
        
        // Bishop must stay on same color - this is KEY for hex board
        if (targetCell.color !== fromCell.color) {
          continue; // Skip different color squares but keep looking
        }
        
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
  
  // QUEEN MOVEMENT - combines rook and bishop
  static getQueenMoves(board: Cell[][], from: Position): Position[] {
    return [...this.getRookMoves(board, from), ...this.getBishopMoves(board, from)];
  }
  
  // KING MOVEMENT - one square in any direction
  static getKingMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
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
      
      // Special rule: king cannot move straight through center to opposite color
      const fromSection = this.getBoardSection(from);
      const toSection = this.getBoardSection(newPos);
      
      if (fromSection === 'center' && toSection === 'center') {
        const fromCell = board[from.y][from.x];
        const toCell = board[newPos.y][newPos.x];
        // Can't move straight to opposite color field through center
        if (fromCell.color !== toCell.color && (dir.x === 0 || dir.y === 0)) {
          continue;
        }
      }
      
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
    
    // Standard L-shaped moves: 2 in one direction, 1 perpendicular
    const knightMoves = [
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: 1 },
      { x: -2, y: -1 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: 2 },
      { x: -1, y: -2 },
    ];
    
    const fromCell = board[from.y][from.x];
    
    for (const move of knightMoves) {
      const newPos = { x: from.x + move.x, y: from.y + move.y };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetCell = board[newPos.y][newPos.x];
      
      // Knight should land on opposite color square
      if (targetCell.color === fromCell.color) continue;
      
      const targetPiece = targetCell.piece;
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // PAWN MOVEMENT - moves away from base toward enemy bases
  static getPawnMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const section = this.getBoardSection(from);
    let forwardDirs: Position[] = [];
    let captureDirs: Position[] = [];
    
    if (piece.player === Player.White) {
      // White pawns move away from white base (top-left)
      if (section === 'white') {
        // In white section, move toward center
        if (from.x <= 3 && from.y <= 3) {
          // Main white area - move down or right toward center
          if (from.y < 3) {
            forwardDirs = [{ x: 0, y: 1 }];
            captureDirs = [{ x: 1, y: 1 }, { x: -1, y: 1 }];
          }
          // Rightmost column of white section
          if (from.x === 3) {
            forwardDirs.push({ x: 1, y: 0 });
            captureDirs.push({ x: 1, y: 1 }, { x: 1, y: -1 });
          }
        }
        // Extended white pawns
        if (from.x === 5) {
          forwardDirs = [{ x: 0, y: 1 }];
          captureDirs = [{ x: 1, y: 1 }, { x: -1, y: 1 }];
        }
      } else {
        // Outside white section, move toward enemy bases
        if (from.y < 8) {
          forwardDirs = [{ x: 0, y: 1 }]; // Move down toward black
        }
        if (from.x < 8) {
          forwardDirs.push({ x: 1, y: 0 }); // Move right
        }
        captureDirs = [{ x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }];
      }
      
    } else if (piece.player === Player.Red) {
      // Red pawns move from sides toward center then enemy bases
      if (section === 'red-left') {
        // Left red section - move right toward center
        forwardDirs = [{ x: 1, y: 0 }];
        captureDirs = [{ x: 1, y: 1 }, { x: 1, y: -1 }];
      } else if (section === 'red-right') {
        // Right red section - move left toward center
        forwardDirs = [{ x: -1, y: 0 }];
        captureDirs = [{ x: -1, y: 1 }, { x: -1, y: -1 }];
      } else if (section === 'center') {
        // In center, move toward enemy bases
        if (from.y < 6) {
          forwardDirs = [{ x: 0, y: -1 }]; // Up toward white
        } else {
          forwardDirs = [{ x: 0, y: 1 }]; // Down toward black
        }
        captureDirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      } else {
        // In enemy territory
        if (section === 'white') {
          forwardDirs = [{ x: -1, y: -1 }];
          captureDirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }];
        } else {
          forwardDirs = [{ x: 1, y: 1 }];
          captureDirs = [{ x: 0, y: 1 }, { x: 1, y: 0 }];
        }
      }
      
    } else {
      // Black pawns move away from black base (bottom-right)
      if (section === 'black') {
        // In black section, move toward center
        if (from.x >= 8 && from.y >= 8) {
          // Main black area - move up or left toward center
          if (from.y > 8) {
            forwardDirs = [{ x: 0, y: -1 }];
            captureDirs = [{ x: 1, y: -1 }, { x: -1, y: -1 }];
          }
          // Leftmost column of black section
          if (from.x === 8) {
            forwardDirs.push({ x: -1, y: 0 });
            captureDirs.push({ x: -1, y: 1 }, { x: -1, y: -1 });
          }
        }
        // Extended black pawns
        if (from.x === 9 && from.y >= 8) {
          forwardDirs = [{ x: -1, y: 0 }];
          captureDirs = [{ x: -1, y: 1 }, { x: -1, y: -1 }];
        }
      } else {
        // Outside black section, move toward enemy bases
        if (from.y > 3) {
          forwardDirs = [{ x: 0, y: -1 }]; // Move up toward white
        }
        if (from.x > 3) {
          forwardDirs.push({ x: -1, y: 0 }); // Move left
        }
        captureDirs = [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }];
      }
    }
    
    // Check forward moves (non-capturing)
    for (const dir of forwardDirs) {
      const newPos = { x: from.x + dir.x, y: from.y + dir.y };
      
      if (this.isValidPos(board, newPos) && !board[newPos.y][newPos.x].piece) {
        moves.push(newPos);
        
        // Check double move from starting position
        if (this.isPawnStartingPosition(from, piece.player)) {
          const doublePos = { x: from.x + dir.x * 2, y: from.y + dir.y * 2 };
          if (this.isValidPos(board, doublePos) && !board[doublePos.y][doublePos.x].piece) {
            moves.push(doublePos);
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
      return (pos.y === 1 && pos.x <= 3) || 
             (pos.x === 5 && pos.y <= 3);
    } else if (player === Player.Red) {
      return (pos.x === 1 && pos.y >= 4 && pos.y <= 7) || 
             (pos.y === 5 && pos.x >= 8 && pos.x <= 11);
    } else {
      return (pos.y === 10 && pos.x >= 8 && pos.x <= 11) || 
             (pos.x === 9 && pos.y >= 8 && pos.y <= 11);
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