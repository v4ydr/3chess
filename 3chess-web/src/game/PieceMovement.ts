import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { Cell } from './Cell';
import { BoardGeometry } from './MovementRules';

export class PieceMovement {
  // Check if a rook can move from one position to another
  static isValidRookMove(board: Cell[][], from: Position, to: Position): boolean {
    const directions = BoardGeometry.getOrthogonalDirections(from);
    
    for (const dir of directions) {
      const line = BoardGeometry.getLine(board, from, dir);
      
      for (const pos of line) {
        // Check if we've reached the target
        if (pos.x === to.x && pos.y === to.y) {
          return true;
        }
        
        // Check if path is blocked
        const cell = board[pos.y][pos.x];
        if (cell.piece) {
          // If this is the target and it's an enemy piece, the move is valid
          if (pos.x === to.x && pos.y === to.y) {
            const fromPiece = board[from.y][from.x].piece!;
            return cell.piece.player !== fromPiece.player;
          }
          // Path is blocked
          break;
        }
      }
    }
    
    return false;
  }
  
  // Check if a bishop can move from one position to another
  static isValidBishopMove(board: Cell[][], from: Position, to: Position): boolean {
    const directions = BoardGeometry.getDiagonalDirections(from);
    
    // Bishop must stay on same color
    const fromCell = board[from.y][from.x];
    const toCell = board[to.y][to.x];
    if (fromCell.color !== toCell.color) {
      return false;
    }
    
    for (const dir of directions) {
      const line = BoardGeometry.getLine(board, from, dir);
      
      for (const pos of line) {
        // Check if we've reached the target
        if (pos.x === to.x && pos.y === to.y) {
          return true;
        }
        
        // Check if path is blocked
        const cell = board[pos.y][pos.x];
        if (cell.piece) {
          // If this is the target and it's an enemy piece, the move is valid
          if (pos.x === to.x && pos.y === to.y) {
            const fromPiece = board[from.y][from.x].piece!;
            return cell.piece.player !== fromPiece.player;
          }
          // Path is blocked
          break;
        }
      }
    }
    
    return false;
  }
  
  // Check if a queen can move from one position to another
  static isValidQueenMove(board: Cell[][], from: Position, to: Position): boolean {
    // Queen combines rook and bishop moves
    return this.isValidRookMove(board, from, to) || this.isValidBishopMove(board, from, to);
  }
  
  // Check if a king can move from one position to another
  static isValidKingMove(board: Cell[][], from: Position, to: Position, gameState?: any): boolean {
    const adjacent = BoardGeometry.getAdjacentPositions(board, from);
    
    // Check if target is adjacent
    const isAdjacent = adjacent.some(pos => pos.x === to.x && pos.y === to.y);
    
    if (isAdjacent) {
      const toCell = board[to.y][to.x];
      const fromPiece = board[from.y][from.x].piece!;
      
      // Can't capture own piece
      if (toCell.piece && toCell.piece.player === fromPiece.player) {
        return false;
      }
      
      // TODO: Check if move would put king in check
      return true;
    }
    
    // Check for castling
    if (gameState && this.isValidCastling(board, from, to, gameState)) {
      return true;
    }
    
    return false;
  }
  
  // Check if castling is valid
  static isValidCastling(board: Cell[][], from: Position, _to: Position, _gameState: any): boolean {
    const piece = board[from.y][from.x].piece;
    if (!piece || piece.type !== PieceType.King) {
      return false;
    }
    
    // Check if king has moved (would need to track this in game state)
    // For now, return false (will implement later with game history tracking)
    return false;
  }
  
  // Check if a knight can move from one position to another
  static isValidKnightMove(board: Cell[][], from: Position, to: Position): boolean {
    const validMoves = BoardGeometry.getKnightMoves(board, from);
    
    // Check if target is in valid moves
    const canMove = validMoves.some(pos => pos.x === to.x && pos.y === to.y);
    
    if (canMove) {
      const toCell = board[to.y][to.x];
      const fromPiece = board[from.y][from.x].piece!;
      
      // Can't capture own piece
      if (toCell.piece && toCell.piece.player === fromPiece.player) {
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  // Check if a pawn can move from one position to another
  static isValidPawnMove(board: Cell[][], from: Position, to: Position, gameState?: any): boolean {
    const fromPiece = board[from.y][from.x].piece!;
    const toCell = board[to.y][to.x];
    
    // Determine pawn direction based on player and board section
    const direction = this.getPawnDirection(from, fromPiece.player);
    
    // Check for normal move (one square forward)
    if (!toCell.piece) {
      // Single step forward
      if (to.x === from.x + direction.x && to.y === from.y + direction.y) {
        return true;
      }
      
      // Double step from starting position
      if (this.isPawnStartingPosition(from, fromPiece.player)) {
        if (to.x === from.x + 2 * direction.x && to.y === from.y + 2 * direction.y) {
          // Check if path is clear
          const middlePos = { x: from.x + direction.x, y: from.y + direction.y };
          if (BoardGeometry.isValidPosition(board, middlePos)) {
            const middleCell = board[middlePos.y][middlePos.x];
            if (!middleCell.piece) {
              return true;
            }
          }
        }
      }
    }
    
    // Check for capture (diagonal)
    if (toCell.piece && toCell.piece.player !== fromPiece.player) {
      const captureDirections = this.getPawnCaptureDirections(from, fromPiece.player);
      
      for (const capDir of captureDirections) {
        if (to.x === from.x + capDir.x && to.y === from.y + capDir.y) {
          return true;
        }
      }
    }
    
    // TODO: Check for en passant
    if (gameState && this.isValidEnPassant(board, from, to, gameState)) {
      return true;
    }
    
    return false;
  }
  
  // Get pawn movement direction based on player and board position
  static getPawnDirection(pos: Position, player: Player): Position {
    const section = BoardGeometry.getBoardSection(pos);
    
    if (player === Player.White) {
      // White pawns move towards the center from their base, then towards other bases
      if (section === 'white') {
        return { x: 1, y: 1 }; // Towards center
      } else {
        // Move towards black's base
        return { x: 1, y: 1 };
      }
    } else if (player === Player.Red) {
      // Red pawns move from their bases towards center, then to other bases
      if (pos.x < 4) {
        // Left side red
        return { x: 1, y: 0 }; // Towards center
      } else if (pos.x >= 8) {
        // Right side red
        return { x: -1, y: 0 }; // Towards center
      } else {
        // In center, move towards white or black
        if (pos.y < 6) {
          return { x: -1, y: -1 }; // Towards white
        } else {
          return { x: 1, y: 1 }; // Towards black
        }
      }
    } else {
      // Black pawns
      if (section === 'black') {
        return { x: -1, y: -1 }; // Towards center
      } else {
        // Move towards white's base
        return { x: -1, y: -1 };
      }
    }
  }
  
  // Get pawn capture directions
  static getPawnCaptureDirections(pos: Position, player: Player): Position[] {
    const forward = this.getPawnDirection(pos, player);
    const section = BoardGeometry.getBoardSection(pos);
    
    // Pawns capture diagonally relative to their forward direction
    if (section === 'center') {
      // In center, pawns have two capture options
      return [
        { x: forward.x + 1, y: forward.y },
        { x: forward.x - 1, y: forward.y },
        { x: forward.x, y: forward.y + 1 },
        { x: forward.x, y: forward.y - 1 },
      ].filter(dir => dir.x !== forward.x || dir.y !== forward.y);
    } else {
      // Normal diagonal captures
      if (Math.abs(forward.x) === 1 && Math.abs(forward.y) === 1) {
        // Moving diagonally, capture on adjacent diagonals
        return [
          { x: forward.x, y: 0 },
          { x: 0, y: forward.y },
        ];
      } else {
        // Moving orthogonally, capture on diagonals
        return [
          { x: forward.x + 1, y: forward.y + 1 },
          { x: forward.x + 1, y: forward.y - 1 },
          { x: forward.x - 1, y: forward.y + 1 },
          { x: forward.x - 1, y: forward.y - 1 },
        ].filter(dir => (dir.x !== 0 || dir.y !== 0) && (Math.abs(dir.x) <= 1 && Math.abs(dir.y) <= 1));
      }
    }
  }
  
  // Check if pawn is in starting position
  static isPawnStartingPosition(pos: Position, player: Player): boolean {
    if (player === Player.White) {
      return (pos.y === 1 && pos.x <= 5) || (pos.x === 5 && pos.y <= 3);
    } else if (player === Player.Red) {
      return (pos.x === 1 && pos.y >= 4 && pos.y <= 7) || (pos.y === 5 && pos.x >= 8);
    } else {
      // Black
      return (pos.y === 10 && pos.x >= 8) || (pos.x === 9 && pos.y >= 8);
    }
  }
  
  // Check if en passant is valid
  static isValidEnPassant(_board: Cell[][], _from: Position, _to: Position, _gameState: any): boolean {
    // TODO: Implement en passant logic (requires game history)
    return false;
  }
  
  // Check if a piece needs promotion
  static needsPromotion(board: Cell[][], pos: Position): boolean {
    const piece = board[pos.y][pos.x].piece;
    if (!piece || piece.type !== PieceType.Pawn) {
      return false;
    }
    
    // Check if pawn reached opposite base
    if (piece.player === Player.White) {
      // White pawn reaches red or black base
      return (pos.x >= 8 && pos.y >= 8) || (pos.x <= 1 && pos.y >= 4 && pos.y <= 7);
    } else if (piece.player === Player.Red) {
      // Red pawn reaches white or black base
      return (pos.x <= 3 && pos.y <= 3) || (pos.x >= 8 && pos.y >= 8);
    } else {
      // Black pawn reaches white or red base
      return (pos.x <= 3 && pos.y <= 3) || (pos.x <= 1 && pos.y >= 4 && pos.y <= 7);
    }
  }
  
  // Main validation function
  static isValidMove(board: Cell[][], from: Position, to: Position, gameState?: any): boolean {
    const fromCell = board[from.y][from.x];
    const toCell = board[to.y][to.x];
    
    // Basic validation
    if (!fromCell.piece) {
      return false;
    }
    
    // Can't capture own piece
    if (toCell.piece && toCell.piece.player === fromCell.piece.player) {
      return false;
    }
    
    // Check piece-specific rules
    switch (fromCell.piece.type) {
      case PieceType.Rook:
        return this.isValidRookMove(board, from, to);
      
      case PieceType.Bishop:
        return this.isValidBishopMove(board, from, to);
      
      case PieceType.Queen:
        return this.isValidQueenMove(board, from, to);
      
      case PieceType.King:
        return this.isValidKingMove(board, from, to, gameState);
      
      case PieceType.Knight:
        return this.isValidKnightMove(board, from, to);
      
      case PieceType.Pawn:
        return this.isValidPawnMove(board, from, to, gameState);
      
      default:
        return false;
    }
  }
}