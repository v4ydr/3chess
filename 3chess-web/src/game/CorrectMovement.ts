import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { Cell } from './Cell';

export class CorrectMovement {
  
  // Check if position is valid on the board
  static isValidPos(board: Cell[][], pos: Position): boolean {
    if (pos.x < 0 || pos.x >= 12 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    return board[pos.y][pos.x].points !== null;
  }
  
  // Get all valid rook moves - FIXED to stop at first piece
  static getRookMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Only orthogonal directions for rook
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
        
        if (!this.isValidPos(board, newPos)) break;
        
        const targetPiece = board[newPos.y][newPos.x].piece;
        if (targetPiece) {
          // Can capture enemy piece, but stop here
          if (targetPiece.player !== piece.player) {
            moves.push(newPos);
          }
          break; // STOP at any piece
        }
        
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // Get all valid bishop moves - FIXED to properly check diagonals and stop at pieces
  static getBishopMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    const fromCell = board[from.y][from.x];
    
    // Only diagonal directions for bishop
    const directions = [
      { x: 1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
    ];
    
    for (const dir of directions) {
      // Move in this direction until blocked
      for (let i = 1; i < 12; i++) {
        const newPos = { x: from.x + dir.x * i, y: from.y + dir.y * i };
        
        if (!this.isValidPos(board, newPos)) break;
        
        const targetCell = board[newPos.y][newPos.x];
        
        // Bishop must stay on same color
        if (targetCell.color !== fromCell.color) {
          break; // Can't move to different color square
        }
        
        const targetPiece = targetCell.piece;
        if (targetPiece) {
          // Can capture enemy piece, but stop here
          if (targetPiece.player !== piece.player) {
            moves.push(newPos);
          }
          break; // STOP at any piece
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
  
  // Get all valid king moves - king can't jump over pieces
  static getKingMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // King moves ONE square in any direction
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
      // Can move to empty square or capture enemy piece
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // Get all valid knight moves - FIXED to only allow proper L-shapes
  static getKnightMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Standard knight L-shape moves: 2 squares in one direction, 1 in perpendicular
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
    
    for (const move of knightMoves) {
      const newPos = { x: from.x + move.x, y: from.y + move.y };
      
      if (!this.isValidPos(board, newPos)) continue;
      
      const targetPiece = board[newPos.y][newPos.x].piece;
      // Can move to empty square or capture enemy piece
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push(newPos);
      }
    }
    
    return moves;
  }
  
  // Get all valid pawn moves - FIXED directions
  static getPawnMoves(board: Cell[][], from: Position): Position[] {
    const moves: Position[] = [];
    const piece = board[from.y][from.x].piece;
    if (!piece) return moves;
    
    // Simple pawn movement based on player
    let forwardDir: Position;
    let captureDirections: Position[] = [];
    
    if (piece.player === Player.White) {
      // White pawns move down (increasing y)
      forwardDir = { x: 0, y: 1 };
      captureDirections = [
        { x: 1, y: 1 },
        { x: -1, y: 1 }
      ];
    } else if (piece.player === Player.Red) {
      // Red pawns depend on their starting side
      if (from.x <= 3) {
        // Left side red pawns move right
        forwardDir = { x: 1, y: 0 };
        captureDirections = [
          { x: 1, y: 1 },
          { x: 1, y: -1 }
        ];
      } else {
        // Right side red pawns move left
        forwardDir = { x: -1, y: 0 };
        captureDirections = [
          { x: -1, y: 1 },
          { x: -1, y: -1 }
        ];
      }
    } else {
      // Black pawns move up (decreasing y)
      forwardDir = { x: 0, y: -1 };
      captureDirections = [
        { x: 1, y: -1 },
        { x: -1, y: -1 }
      ];
    }
    
    // Check forward move (non-capturing)
    const oneStep = { x: from.x + forwardDir.x, y: from.y + forwardDir.y };
    if (this.isValidPos(board, oneStep) && !board[oneStep.y][oneStep.x].piece) {
      moves.push(oneStep);
      
      // Check for double move from starting position
      if (this.isPawnStartingPosition(from, piece.player)) {
        const twoStep = { x: from.x + forwardDir.x * 2, y: from.y + forwardDir.y * 2 };
        if (this.isValidPos(board, twoStep) && !board[twoStep.y][twoStep.x].piece) {
          moves.push(twoStep);
        }
      }
    }
    
    // Check capture moves
    for (const captureDir of captureDirections) {
      const capturePos = { x: from.x + captureDir.x, y: from.y + captureDir.y };
      
      if (this.isValidPos(board, capturePos)) {
        const targetPiece = board[capturePos.y][capturePos.x].piece;
        // Can only capture enemy pieces
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
      // White pawns start at row 1
      return pos.y === 1 && pos.x <= 5;
    } else if (player === Player.Red) {
      // Red pawns start at column 1 (left) or row 5 (right)
      return (pos.x === 1 && pos.y >= 4 && pos.y <= 7) || 
             (pos.y === 5 && pos.x >= 8 && pos.x <= 11);
    } else {
      // Black pawns start at row 10
      return pos.y === 10 && pos.x >= 8;
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