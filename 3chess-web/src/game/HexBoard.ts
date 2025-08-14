import { Player, PieceType } from '../types';
import type { Piece } from '../types';

// The ACTUAL board structure - a hexagonal board on a 12x12 grid
// Not all squares exist - only those that form the hexagon

export interface HexSquare {
  col: number; // 0-11 (A-L)
  row: number; // 0-11 (1-12)
  name: string; // e.g., "A1", "E5", "L12"
  exists: boolean; // Whether this square is part of the hexagon
  piece: Piece | null;
}

export class HexBoard {
  squares: (HexSquare | null)[][];
  
  // Define which squares exist in the hexagonal board
  // Based on the yalta.py PIECES array structure
  private static readonly VALID_SQUARES: boolean[][] = [
    // Row 0 (row 1 in notation)
    [true, true, true, true, true, true, false, false, false, false, false, false],
    // Row 1 (row 2)
    [true, true, true, true, true, true, false, false, false, false, false, false],
    // Row 2 (row 3)
    [false, false, false, false, true, true, false, false, false, false, false, false],
    // Row 3 (row 4)
    [false, false, false, false, true, true, false, false, false, false, false, false],
    // Row 4 (row 5)
    [true, true, false, false, false, false, false, false, true, true, true, true],
    // Row 5 (row 6)
    [true, true, false, false, false, false, false, false, true, true, true, true],
    // Row 6 (row 7)
    [true, true, false, false, false, false, false, false, false, false, false, false],
    // Row 7 (row 8)
    [true, true, false, false, false, false, false, false, false, false, false, false],
    // Row 8 (row 9)
    [false, false, false, false, true, true, true, true, true, true, false, false],
    // Row 9 (row 10)
    [false, false, false, false, true, true, true, true, true, true, false, false],
    // Row 10 (row 11)
    [false, false, false, false, false, false, false, false, true, true, false, false],
    // Row 11 (row 12)
    [false, false, false, false, false, false, false, false, true, true, false, false],
  ];
  
  constructor() {
    this.squares = [];
    this.initializeBoard();
    this.setupStartingPosition();
  }
  
  private initializeBoard() {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    for (let row = 0; row < 12; row++) {
      this.squares[row] = [];
      for (let col = 0; col < 12; col++) {
        if (HexBoard.VALID_SQUARES[row][col]) {
          this.squares[row][col] = {
            col,
            row,
            name: `${cols[col]}${row + 1}`,
            exists: true,
            piece: null,
          };
        } else {
          this.squares[row][col] = null;
        }
      }
    }
  }
  
  private setupStartingPosition() {
    // Based on yalta.py PIECES array
    // White pieces (bottom)
    this.setPiece(0, 0, Player.White, PieceType.Rook);   // A1
    this.setPiece(1, 0, Player.White, PieceType.Knight); // B1
    this.setPiece(2, 0, Player.White, PieceType.Bishop); // C1
    this.setPiece(3, 0, Player.White, PieceType.Queen);  // D1
    this.setPiece(4, 0, Player.White, PieceType.Rook);   // E1
    this.setPiece(5, 0, Player.White, PieceType.Pawn);   // F1
    
    // White pawns (row 2)
    this.setPiece(0, 1, Player.White, PieceType.Pawn);   // A2
    this.setPiece(1, 1, Player.White, PieceType.Pawn);   // B2
    this.setPiece(2, 1, Player.White, PieceType.Pawn);   // C2
    this.setPiece(3, 1, Player.White, PieceType.Pawn);   // D2
    this.setPiece(4, 1, Player.White, PieceType.Knight); // E2
    this.setPiece(5, 1, Player.White, PieceType.Pawn);   // F2
    
    // White pieces (rows 3-4)
    this.setPiece(4, 2, Player.White, PieceType.Bishop); // E3
    this.setPiece(5, 2, Player.White, PieceType.Pawn);   // F3
    this.setPiece(4, 3, Player.White, PieceType.King);   // E4
    this.setPiece(5, 3, Player.White, PieceType.Pawn);   // F4
    
    // Red pieces (left side)
    this.setPiece(0, 4, Player.Red, PieceType.Rook);   // A5
    this.setPiece(1, 4, Player.Red, PieceType.Pawn);   // B5
    this.setPiece(0, 5, Player.Red, PieceType.Knight); // A6
    this.setPiece(1, 5, Player.Red, PieceType.Pawn);   // B6
    this.setPiece(0, 6, Player.Red, PieceType.Bishop); // A7
    this.setPiece(1, 6, Player.Red, PieceType.Pawn);   // B7
    this.setPiece(0, 7, Player.Red, PieceType.King);   // A8
    this.setPiece(1, 7, Player.Red, PieceType.Pawn);   // B8
    
    // Red pieces (right side)
    this.setPiece(8, 4, Player.Red, PieceType.Rook);   // I5
    this.setPiece(9, 4, Player.Red, PieceType.Knight); // J5
    this.setPiece(10, 4, Player.Red, PieceType.Bishop); // K5
    this.setPiece(11, 4, Player.Red, PieceType.Queen);  // L5
    this.setPiece(8, 5, Player.Red, PieceType.Pawn);   // I6
    this.setPiece(9, 5, Player.Red, PieceType.Pawn);   // J6
    this.setPiece(10, 5, Player.Red, PieceType.Pawn);  // K6
    this.setPiece(11, 5, Player.Red, PieceType.Pawn);  // L6
    
    // Black pieces (top)
    this.setPiece(4, 8, Player.Black, PieceType.Rook);   // E9
    this.setPiece(5, 8, Player.Black, PieceType.Knight); // F9
    this.setPiece(6, 8, Player.Black, PieceType.Bishop); // G9
    this.setPiece(7, 8, Player.Black, PieceType.Queen);  // H9
    this.setPiece(8, 8, Player.Black, PieceType.Rook);   // I9
    this.setPiece(9, 8, Player.Black, PieceType.Pawn);   // J9
    
    // Black pawns (row 10)
    this.setPiece(4, 9, Player.Black, PieceType.Pawn);   // E10
    this.setPiece(5, 9, Player.Black, PieceType.Pawn);   // F10
    this.setPiece(6, 9, Player.Black, PieceType.Pawn);   // G10
    this.setPiece(7, 9, Player.Black, PieceType.Pawn);   // H10
    this.setPiece(8, 9, Player.Black, PieceType.Knight); // I10
    this.setPiece(9, 9, Player.Black, PieceType.Pawn);   // J10
    
    // Black pieces (rows 11-12)
    this.setPiece(8, 10, Player.Black, PieceType.Bishop); // I11
    this.setPiece(9, 10, Player.Black, PieceType.Pawn);   // J11
    this.setPiece(8, 11, Player.Black, PieceType.King);   // I12
    this.setPiece(9, 11, Player.Black, PieceType.Pawn);   // J12
  }
  
  private setPiece(col: number, row: number, player: Player, type: PieceType) {
    const square = this.squares[row][col];
    if (square) {
      square.piece = { player, type };
    }
  }
  
  getSquare(col: number, row: number): HexSquare | null {
    if (row >= 0 && row < 12 && col >= 0 && col < 12) {
      return this.squares[row][col];
    }
    return null;
  }
  
  getSquareByName(name: string): HexSquare | null {
    const match = name.match(/^([A-L])(\d+)$/);
    if (!match) return null;
    
    const col = match[1].charCodeAt(0) - 'A'.charCodeAt(0);
    const row = parseInt(match[2]) - 1;
    
    return this.getSquare(col, row);
  }
  
  // Get all valid squares for rendering
  getAllSquares(): HexSquare[] {
    const squares: HexSquare[] = [];
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 12; col++) {
        const square = this.squares[row][col];
        if (square) {
          squares.push(square);
        }
      }
    }
    return squares;
  }
}