import { PieceType } from '../types';
import type { Position, Piece } from '../types';
import { Cell } from './Cell';

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotion?: PieceType;
}

// Direction vectors for the hexagonal board
// These represent the 12 possible directions from any cell
export class BoardGeometry {
  // Get all cells in a straight line from a position in a given direction
  static getLine(board: Cell[][], from: Position, direction: Position, maxSteps: number = 12): Position[] {
    const positions: Position[] = [];
    let current = { x: from.x, y: from.y };
    
    for (let i = 0; i < maxSteps; i++) {
      current = { x: current.x + direction.x, y: current.y + direction.y };
      
      if (current.x < 0 || current.x >= 12 || current.y < 0 || current.y >= 12) {
        break;
      }
      
      // Check if this position has valid cell points (some positions are invalid on the hex board)
      if (!board[current.y][current.x].points) {
        break;
      }
      
      positions.push({ ...current });
    }
    
    return positions;
  }
  
  // Get orthogonal directions (rook moves) based on the section of the board
  static getOrthogonalDirections(pos: Position): Position[] {
    // Determine which section of the board we're in
    const section = this.getBoardSection(pos);
    
    // Different directions based on board section
    if (section === 'white') {
      // White's section (top-left)
      return [
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 },  // left
        { x: 0, y: 1 },   // down
        { x: 0, y: -1 },  // up
        { x: 1, y: 1 },   // diagonal for center transitions
        { x: -1, y: -1 }, // diagonal for center transitions
      ];
    } else if (section === 'red') {
      // Red's section (left and right sides)
      if (pos.x < 4) {
        // Left side
        return [
          { x: 1, y: 0 },   // right
          { x: -1, y: 0 },  // left
          { x: 0, y: 1 },   // down
          { x: 0, y: -1 },  // up
          { x: 1, y: -1 },  // diagonal for center transitions
          { x: -1, y: 1 },  // diagonal for center transitions
        ];
      } else {
        // Right side
        return [
          { x: 1, y: 0 },   // right
          { x: -1, y: 0 },  // left
          { x: 0, y: 1 },   // down
          { x: 0, y: -1 },  // up
          { x: -1, y: -1 }, // diagonal for center transitions
          { x: 1, y: 1 },   // diagonal for center transitions
        ];
      }
    } else {
      // Black's section (bottom-right)
      return [
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 },  // left
        { x: 0, y: 1 },   // down
        { x: 0, y: -1 },  // up
        { x: -1, y: 1 },  // diagonal for center transitions
        { x: 1, y: -1 },  // diagonal for center transitions
      ];
    }
  }
  
  // Get diagonal directions (bishop moves) based on the section of the board
  static getDiagonalDirections(pos: Position): Position[] {
    const section = this.getBoardSection(pos);
    
    if (section === 'white') {
      return [
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },   // Through center
        { x: -1, y: -1 }, // Through center
      ];
    } else if (section === 'red') {
      if (pos.x < 4) {
        return [
          { x: 1, y: 1 },
          { x: -1, y: -1 },
          { x: 1, y: -1 },  // Through center
          { x: -1, y: 1 },  // Through center
        ];
      } else {
        return [
          { x: 1, y: -1 },
          { x: -1, y: 1 },
          { x: -1, y: -1 }, // Through center
          { x: 1, y: 1 },   // Through center
        ];
      }
    } else {
      return [
        { x: 1, y: 1 },
        { x: -1, y: -1 },
        { x: -1, y: 1 },  // Through center
        { x: 1, y: -1 },  // Through center
      ];
    }
  }
  
  // Determine which section of the board a position is in
  static getBoardSection(pos: Position): 'white' | 'red' | 'black' | 'center' {
    // Center area
    if (pos.x >= 4 && pos.x < 8 && pos.y >= 4 && pos.y < 8) {
      return 'center';
    }
    
    // White's territory (top-left)
    if (pos.x < 4 && pos.y < 4) {
      return 'white';
    }
    
    // Black's territory (bottom-right)
    if (pos.x >= 8 && pos.y >= 8) {
      return 'black';
    }
    
    // Red's territory (left side and right side)
    return 'red';
  }
  
  // Check if a position is valid on the hexagonal board
  static isValidPosition(board: Cell[][], pos: Position): boolean {
    if (pos.x < 0 || pos.x >= 12 || pos.y < 0 || pos.y >= 12) {
      return false;
    }
    return board[pos.y][pos.x].points !== null;
  }
  
  // Get all adjacent positions (for king moves)
  static getAdjacentPositions(board: Cell[][], pos: Position): Position[] {
    const adjacent: Position[] = [];
    const directions = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: -1 },
      { x: 1, y: -1 }, { x: -1, y: 1 },
    ];
    
    for (const dir of directions) {
      const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      if (this.isValidPosition(board, newPos)) {
        // Special case: king cannot move straight through center to opposite color
        if (this.getBoardSection(pos) === 'center' && this.getBoardSection(newPos) === 'center') {
          const fromCell = board[pos.y][pos.x];
          const toCell = board[newPos.y][newPos.x];
          if (fromCell.color !== toCell.color && Math.abs(dir.x) + Math.abs(dir.y) === 1) {
            continue; // Skip this move
          }
        }
        adjacent.push(newPos);
      }
    }
    
    return adjacent;
  }
  
  // Get knight moves (L-shaped moves on hex board)
  static getKnightMoves(board: Cell[][], pos: Position): Position[] {
    const moves: Position[] = [];
    
    // Knight moves are more complex on a hex board
    // We need to consider the two-step + one-step combinations
    const knightPatterns = [
      // Two steps in one direction, then one perpendicular
      { first: { x: 2, y: 0 }, second: { x: 0, y: 1 } },
      { first: { x: 2, y: 0 }, second: { x: 0, y: -1 } },
      { first: { x: -2, y: 0 }, second: { x: 0, y: 1 } },
      { first: { x: -2, y: 0 }, second: { x: 0, y: -1 } },
      { first: { x: 0, y: 2 }, second: { x: 1, y: 0 } },
      { first: { x: 0, y: 2 }, second: { x: -1, y: 0 } },
      { first: { x: 0, y: -2 }, second: { x: 1, y: 0 } },
      { first: { x: 0, y: -2 }, second: { x: -1, y: 0 } },
      // One step in one direction, then two perpendicular
      { first: { x: 1, y: 0 }, second: { x: 0, y: 2 } },
      { first: { x: 1, y: 0 }, second: { x: 0, y: -2 } },
      { first: { x: -1, y: 0 }, second: { x: 0, y: 2 } },
      { first: { x: -1, y: 0 }, second: { x: 0, y: -2 } },
      { first: { x: 0, y: 1 }, second: { x: 2, y: 0 } },
      { first: { x: 0, y: 1 }, second: { x: -2, y: 0 } },
      { first: { x: 0, y: -1 }, second: { x: 2, y: 0 } },
      { first: { x: 0, y: -1 }, second: { x: -2, y: 0 } },
      // Diagonal combinations for hex board
      { first: { x: 1, y: 1 }, second: { x: 1, y: -1 } },
      { first: { x: 1, y: 1 }, second: { x: -1, y: 1 } },
      { first: { x: -1, y: -1 }, second: { x: -1, y: 1 } },
      { first: { x: -1, y: -1 }, second: { x: 1, y: -1 } },
    ];
    
    for (const pattern of knightPatterns) {
      const finalPos = {
        x: pos.x + pattern.first.x + pattern.second.x,
        y: pos.y + pattern.first.y + pattern.second.y,
      };
      
      if (this.isValidPosition(board, finalPos)) {
        // Check that the final position is a different color (knight always changes color)
        const fromCell = board[pos.y][pos.x];
        const toCell = board[finalPos.y][finalPos.x];
        if (fromCell.color !== toCell.color) {
          moves.push(finalPos);
        }
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
}