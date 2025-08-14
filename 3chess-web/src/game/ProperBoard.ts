import { Player, PieceType } from '../types';
import type { Piece } from '../types';

// PROPER Three-Player Chess Implementation
// The board consists of THREE separate 4x8 boards (96 squares total)
// Each player has their own 4x8 section
// The sections connect at specific edges

export interface Square {
  // Unique identifier for this square
  name: string;
  // Which player's section this square belongs to
  section: Player;
  // Row (0-3) and column (0-7) within that section
  row: number;
  col: number;
  // The piece on this square (if any)
  piece: Piece | null;
  // References to neighboring squares
  north: Square | null;
  south: Square | null;
  east: Square | null;
  west: Square | null;
  // Diagonal neighbors
  ne: Square | null;
  nw: Square | null;
  se: Square | null;
  sw: Square | null;
}

export class ProperBoard {
  squares: Map<string, Square>;
  
  // The three 4x8 sections
  whiteSection: Square[][] = [];
  redSection: Square[][] = [];
  blackSection: Square[][] = [];
  
  constructor() {
    this.squares = new Map();
    this.initializeBoard();
    this.connectSections();
    this.setupStartingPosition();
  }
  
  private initializeBoard() {
    // White's section (4 rows x 8 columns)
    // Rows numbered 1-4 (bottom to top from white's view)
    // Columns a-h (left to right from white's view)
    const whiteCols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const whiteRows = ['1', '2', '3', '4'];
    
    for (let row = 0; row < 4; row++) {
      this.whiteSection[row] = [];
      for (let col = 0; col < 8; col++) {
        const name = whiteCols[col] + whiteRows[row];
        const square: Square = {
          name,
          section: Player.White,
          row,
          col,
          piece: null,
          north: null,
          south: null,
          east: null,
          west: null,
          ne: null,
          nw: null,
          se: null,
          sw: null,
        };
        this.whiteSection[row][col] = square;
        this.squares.set(name, square);
      }
    }
    
    // Connect white section internally
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = this.whiteSection[row][col];
        if (row > 0) sq.south = this.whiteSection[row - 1][col];
        if (row < 3) sq.north = this.whiteSection[row + 1][col];
        if (col > 0) sq.west = this.whiteSection[row][col - 1];
        if (col < 7) sq.east = this.whiteSection[row][col + 1];
        // Diagonals
        if (row > 0 && col > 0) sq.sw = this.whiteSection[row - 1][col - 1];
        if (row > 0 && col < 7) sq.se = this.whiteSection[row - 1][col + 1];
        if (row < 3 && col > 0) sq.nw = this.whiteSection[row + 1][col - 1];
        if (row < 3 && col < 7) sq.ne = this.whiteSection[row + 1][col + 1];
      }
    }
    
    // Red's section (4 rows x 8 columns)
    // Split into left and right parts in the actual game
    // Using i-p for columns
    const redCols = ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];
    const redRows = ['1', '2', '3', '4'];
    
    for (let row = 0; row < 4; row++) {
      this.redSection[row] = [];
      for (let col = 0; col < 8; col++) {
        const name = redCols[col] + redRows[row];
        const square: Square = {
          name,
          section: Player.Red,
          row,
          col,
          piece: null,
          north: null,
          south: null,
          east: null,
          west: null,
          ne: null,
          nw: null,
          se: null,
          sw: null,
        };
        this.redSection[row][col] = square;
        this.squares.set(name, square);
      }
    }
    
    // Connect red section internally
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = this.redSection[row][col];
        if (row > 0) sq.south = this.redSection[row - 1][col];
        if (row < 3) sq.north = this.redSection[row + 1][col];
        if (col > 0) sq.west = this.redSection[row][col - 1];
        if (col < 7) sq.east = this.redSection[row][col + 1];
        // Diagonals
        if (row > 0 && col > 0) sq.sw = this.redSection[row - 1][col - 1];
        if (row > 0 && col < 7) sq.se = this.redSection[row - 1][col + 1];
        if (row < 3 && col > 0) sq.nw = this.redSection[row + 1][col - 1];
        if (row < 3 && col < 7) sq.ne = this.redSection[row + 1][col + 1];
      }
    }
    
    // Black's section (4 rows x 8 columns)
    // Rows numbered backwards 12-9
    const blackCols = ['q', 'r', 's', 't', 'u', 'v', 'w', 'x'];
    const blackRows = ['9', '10', '11', '12'];
    
    for (let row = 0; row < 4; row++) {
      this.blackSection[row] = [];
      for (let col = 0; col < 8; col++) {
        const name = blackCols[col] + blackRows[row];
        const square: Square = {
          name,
          section: Player.Black,
          row,
          col,
          piece: null,
          north: null,
          south: null,
          east: null,
          west: null,
          ne: null,
          nw: null,
          se: null,
          sw: null,
        };
        this.blackSection[row][col] = square;
        this.squares.set(name, square);
      }
    }
    
    // Connect black section internally
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = this.blackSection[row][col];
        if (row > 0) sq.south = this.blackSection[row - 1][col];
        if (row < 3) sq.north = this.blackSection[row + 1][col];
        if (col > 0) sq.west = this.blackSection[row][col - 1];
        if (col < 7) sq.east = this.blackSection[row][col + 1];
        // Diagonals
        if (row > 0 && col > 0) sq.sw = this.blackSection[row - 1][col - 1];
        if (row > 0 && col < 7) sq.se = this.blackSection[row - 1][col + 1];
        if (row < 3 && col > 0) sq.nw = this.blackSection[row + 1][col - 1];
        if (row < 3 && col < 7) sq.ne = this.blackSection[row + 1][col + 1];
      }
    }
  }
  
  private connectSections() {
    // Connect the three sections at their edges
    // This is where the "hexagonal" nature comes from
    
    // Connect White's top row to Red's bottom-left and Black's bottom-right
    // White h4 connects to Red i1
    this.whiteSection[3][7].north = this.redSection[0][0];
    this.redSection[0][0].south = this.whiteSection[3][7];
    
    // White g4 connects to Red j1
    this.whiteSection[3][6].north = this.redSection[0][1];
    this.redSection[0][1].south = this.whiteSection[3][6];
    
    // White f4 connects to Red k1
    this.whiteSection[3][5].north = this.redSection[0][2];
    this.redSection[0][2].south = this.whiteSection[3][5];
    
    // White e4 connects to Red l1
    this.whiteSection[3][4].north = this.redSection[0][3];
    this.redSection[0][3].south = this.whiteSection[3][4];
    
    // Connect Red's top row to Black's left side
    // Red p4 connects to Black q9
    this.redSection[3][7].north = this.blackSection[0][0];
    this.blackSection[0][0].south = this.redSection[3][7];
    
    // Red o4 connects to Black r9
    this.redSection[3][6].north = this.blackSection[0][1];
    this.blackSection[0][1].south = this.redSection[3][6];
    
    // Red n4 connects to Black s9
    this.redSection[3][5].north = this.blackSection[0][2];
    this.blackSection[0][2].south = this.redSection[3][5];
    
    // Red m4 connects to Black t9
    this.redSection[3][4].north = this.blackSection[0][3];
    this.blackSection[0][3].south = this.redSection[3][4];
    
    // Connect Black's bottom to White's left side
    // Black x9 connects to White a4
    this.blackSection[0][7].south = this.whiteSection[3][0];
    this.whiteSection[3][0].north = this.blackSection[0][7];
    
    // Black w9 connects to White b4
    this.blackSection[0][6].south = this.whiteSection[3][1];
    this.whiteSection[3][1].north = this.blackSection[0][6];
    
    // Black v9 connects to White c4
    this.blackSection[0][5].south = this.whiteSection[3][2];
    this.whiteSection[3][2].north = this.blackSection[0][5];
    
    // Black u9 connects to White d4
    this.blackSection[0][4].south = this.whiteSection[3][3];
    this.whiteSection[3][3].north = this.blackSection[0][4];
  }
  
  private setupStartingPosition() {
    // Set up white pieces
    const whitePieces: [PieceType, number, number][] = [
      [PieceType.Rook, 0, 0],    // a1
      [PieceType.Knight, 0, 1],  // b1
      [PieceType.Bishop, 0, 2],  // c1
      [PieceType.Queen, 0, 3],   // d1
      [PieceType.King, 0, 4],    // e1
      [PieceType.Bishop, 0, 5],  // f1
      [PieceType.Knight, 0, 6],  // g1
      [PieceType.Rook, 0, 7],    // h1
    ];
    
    for (const [type, row, col] of whitePieces) {
      this.whiteSection[row][col].piece = { player: Player.White, type };
    }
    
    // White pawns
    for (let col = 0; col < 8; col++) {
      this.whiteSection[1][col].piece = { player: Player.White, type: PieceType.Pawn };
    }
    
    // Set up red pieces
    const redPieces: [PieceType, number, number][] = [
      [PieceType.Rook, 0, 0],    // i1
      [PieceType.Knight, 0, 1],  // j1
      [PieceType.Bishop, 0, 2],  // k1
      [PieceType.Queen, 0, 3],   // l1
      [PieceType.King, 0, 4],    // m1
      [PieceType.Bishop, 0, 5],  // n1
      [PieceType.Knight, 0, 6],  // o1
      [PieceType.Rook, 0, 7],    // p1
    ];
    
    for (const [type, row, col] of redPieces) {
      this.redSection[row][col].piece = { player: Player.Red, type };
    }
    
    // Red pawns
    for (let col = 0; col < 8; col++) {
      this.redSection[1][col].piece = { player: Player.Red, type: PieceType.Pawn };
    }
    
    // Set up black pieces
    const blackPieces: [PieceType, number, number][] = [
      [PieceType.Rook, 0, 0],    // q9
      [PieceType.Knight, 0, 1],  // r9
      [PieceType.Bishop, 0, 2],  // s9
      [PieceType.Queen, 0, 3],   // t9
      [PieceType.King, 0, 4],    // u9
      [PieceType.Bishop, 0, 5],  // v9
      [PieceType.Knight, 0, 6],  // w9
      [PieceType.Rook, 0, 7],    // x9
    ];
    
    for (const [type, row, col] of blackPieces) {
      this.blackSection[row][col].piece = { player: Player.Black, type };
    }
    
    // Black pawns
    for (let col = 0; col < 8; col++) {
      this.blackSection[1][col].piece = { player: Player.Black, type: PieceType.Pawn };
    }
  }
  
  getSquare(name: string): Square | undefined {
    return this.squares.get(name);
  }
  
  // Get all squares as a flat array for rendering
  getAllSquares(): Square[] {
    const squares: Square[] = [];
    
    // Add all white squares
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        squares.push(this.whiteSection[row][col]);
      }
    }
    
    // Add all red squares
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        squares.push(this.redSection[row][col]);
      }
    }
    
    // Add all black squares
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        squares.push(this.blackSection[row][col]);
      }
    }
    
    return squares;
  }
}