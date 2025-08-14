import { Cell } from './Cell';
import { Player, PieceType } from '../types';
import type { Piece, Position } from '../types';
import { ThreePlayerMovement } from './ThreePlayerMovement';
import type { Move } from './MovementRules';

export class Game {
  board: Cell[][];
  currentPlayer: Player;
  archives: string[];
  selectedCell: Position | null = null;
  moveHistory: Move[] = [];
  kingMoved: { [key in Player]: boolean } = {
    [Player.White]: false,
    [Player.Red]: false,
    [Player.Black]: false,
  };
  rookMoved: { [key: string]: boolean } = {};
  lastMove: Move | null = null;
  capturedPieces: { [key in Player]: Piece[] } = {
    [Player.White]: [],
    [Player.Red]: [],
    [Player.Black]: [],
  };

  static INITIAL_PIECES: (Piece | null)[][] = [
    // Row 0
    [
      { player: Player.White, type: PieceType.Rook },
      { player: Player.White, type: PieceType.Knight },
      { player: Player.White, type: PieceType.Bishop },
      { player: Player.White, type: PieceType.Queen },
      { player: Player.White, type: PieceType.Rook },
      { player: Player.White, type: PieceType.Pawn },
      null, null, null, null, null, null,
    ],
    // Row 1
    [
      { player: Player.White, type: PieceType.Pawn },
      { player: Player.White, type: PieceType.Pawn },
      { player: Player.White, type: PieceType.Pawn },
      { player: Player.White, type: PieceType.Pawn },
      { player: Player.White, type: PieceType.Knight },
      { player: Player.White, type: PieceType.Pawn },
      null, null, null, null, null, null,
    ],
    // Row 2
    [
      null, null, null, null,
      { player: Player.White, type: PieceType.Bishop },
      { player: Player.White, type: PieceType.Pawn },
      null, null, null, null, null, null,
    ],
    // Row 3
    [
      null, null, null, null,
      { player: Player.White, type: PieceType.King },
      { player: Player.White, type: PieceType.Pawn },
      null, null, null, null, null, null,
    ],
    // Row 4
    [
      { player: Player.Red, type: PieceType.Rook },
      { player: Player.Red, type: PieceType.Pawn },
      null, null, null, null, null, null,
      { player: Player.Red, type: PieceType.Rook },
      { player: Player.Red, type: PieceType.Knight },
      { player: Player.Red, type: PieceType.Bishop },
      { player: Player.Red, type: PieceType.Queen },
    ],
    // Row 5
    [
      { player: Player.Red, type: PieceType.Knight },
      { player: Player.Red, type: PieceType.Pawn },
      null, null, null, null, null, null,
      { player: Player.Red, type: PieceType.Pawn },
      { player: Player.Red, type: PieceType.Pawn },
      { player: Player.Red, type: PieceType.Pawn },
      { player: Player.Red, type: PieceType.Pawn },
    ],
    // Row 6
    [
      { player: Player.Red, type: PieceType.Bishop },
      { player: Player.Red, type: PieceType.Pawn },
      null, null, null, null, null, null, null, null, null, null,
    ],
    // Row 7
    [
      { player: Player.Red, type: PieceType.King },
      { player: Player.Red, type: PieceType.Pawn },
      null, null, null, null, null, null, null, null, null, null,
    ],
    // Row 8
    [
      null, null, null, null,
      { player: Player.Black, type: PieceType.Rook },
      { player: Player.Black, type: PieceType.Knight },
      { player: Player.Black, type: PieceType.Bishop },
      { player: Player.Black, type: PieceType.Queen },
      { player: Player.Black, type: PieceType.Rook },
      { player: Player.Black, type: PieceType.Pawn },
      null, null,
    ],
    // Row 9
    [
      null, null, null, null,
      { player: Player.Black, type: PieceType.Pawn },
      { player: Player.Black, type: PieceType.Pawn },
      { player: Player.Black, type: PieceType.Pawn },
      { player: Player.Black, type: PieceType.Pawn },
      { player: Player.Black, type: PieceType.Knight },
      { player: Player.Black, type: PieceType.Pawn },
      null, null,
    ],
    // Row 10
    [
      null, null, null, null, null, null, null, null,
      { player: Player.Black, type: PieceType.Bishop },
      { player: Player.Black, type: PieceType.Pawn },
      null, null,
    ],
    // Row 11
    [
      null, null, null, null, null, null, null, null,
      { player: Player.Black, type: PieceType.King },
      { player: Player.Black, type: PieceType.Pawn },
      null, null,
    ],
  ];

  constructor(archives?: string[]) {
    this.board = [];
    this.currentPlayer = Player.White;
    this.archives = archives || [];

    // Initialize board
    for (let y = 0; y < 12; y++) {
      this.board[y] = [];
      for (let x = 0; x < 12; x++) {
        this.board[y][x] = new Cell(x, y, Game.INITIAL_PIECES[y][x]);
      }
    }

    if (this.archives.length === 0) {
      this.record();
    }
  }

  isValidMove(from: Position, to: Position): boolean {
    const fromCell = this.board[from.y][from.x];

    // Check if piece belongs to current player
    if (!fromCell.piece || fromCell.piece.player !== this.currentPlayer) {
      return false;
    }

    // Use the three-player movement validation system
    const isValid = ThreePlayerMovement.isValidMove(this.board, from, to, this.currentPlayer);
    
    if (isValid) {
      // Check if move would put own king in check
      if (this.wouldBeInCheck(from, to)) {
        return false;
      }
    }
    
    return isValid;
  }

  // Check if a move would put the current player's king in check
  wouldBeInCheck(from: Position, to: Position): boolean {
    // Make temporary move
    const fromCell = this.board[from.y][from.x];
    const toCell = this.board[to.y][to.x];
    const capturedPiece = toCell.piece;
    
    toCell.piece = fromCell.piece;
    fromCell.piece = null;
    
    // Check if king is in check
    const inCheck = this.isKingInCheck(this.currentPlayer);
    
    // Restore board state
    fromCell.piece = toCell.piece;
    toCell.piece = capturedPiece;
    
    return inCheck;
  }

  // Check if a king is in check
  isKingInCheck(player: Player): boolean {
    // Find king position
    let kingPos: Position | null = null;
    
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        const piece = this.board[y][x].piece;
        if (piece && piece.player === player && piece.type === PieceType.King) {
          kingPos = { x, y };
          break;
        }
      }
      if (kingPos) break;
    }
    
    if (!kingPos) return false;
    
    // Check if any enemy piece can capture the king
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        const piece = this.board[y][x].piece;
        if (piece && piece.player !== player) {
          // We don't need gameState for simplified validation
          
          if (ThreePlayerMovement.isValidMove(this.board, { x, y }, kingPos, piece.player)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Check if a player is in checkmate
  isCheckmate(player: Player): boolean {
    if (!this.isKingInCheck(player)) {
      return false;
    }
    
    // Try all possible moves for the player
    for (let fromY = 0; fromY < 12; fromY++) {
      for (let fromX = 0; fromX < 12; fromX++) {
        const piece = this.board[fromY][fromX].piece;
        if (piece && piece.player === player) {
          for (let toY = 0; toY < 12; toY++) {
            for (let toX = 0; toX < 12; toX++) {
              if (this.board[toY][toX].points) {
                const tempPlayer = this.currentPlayer;
                this.currentPlayer = player;
                
                if (this.isValidMove({ x: fromX, y: fromY }, { x: toX, y: toY })) {
                  this.currentPlayer = tempPlayer;
                  return false;
                }
                
                this.currentPlayer = tempPlayer;
              }
            }
          }
        }
      }
    }
    
    return true;
  }

  makeMove(from: Position, to: Position): boolean {
    if (!this.isValidMove(from, to)) {
      return false;
    }

    const fromCell = this.board[from.y][from.x];
    const toCell = this.board[to.y][to.x];
    const piece = fromCell.piece!;
    const capturedPiece = toCell.piece;

    // Record the move
    const move: Move = {
      from,
      to,
      piece,
      captured: capturedPiece || undefined,
    };

    // Handle castling
    if (piece.type === PieceType.King) {
      const dx = to.x - from.x;
      if (Math.abs(dx) === 2) {
        // Castling move
        move.isCastling = true;
        // Move the rook
        if (dx > 0) {
          // King-side castling
          const rookFrom = { x: from.x + 3, y: from.y };
          const rookTo = { x: from.x + 1, y: from.y };
          this.board[rookTo.y][rookTo.x].piece = this.board[rookFrom.y][rookFrom.x].piece;
          this.board[rookFrom.y][rookFrom.x].piece = null;
        } else {
          // Queen-side castling
          const rookFrom = { x: from.x - 4, y: from.y };
          const rookTo = { x: from.x - 1, y: from.y };
          this.board[rookTo.y][rookTo.x].piece = this.board[rookFrom.y][rookFrom.x].piece;
          this.board[rookFrom.y][rookFrom.x].piece = null;
        }
      }
      this.kingMoved[piece.player] = true;
    }

    // Handle en passant
    if (piece.type === PieceType.Pawn) {
      const dy = Math.abs(to.y - from.y);
      const dx = Math.abs(to.x - from.x);
      
      // Check for en passant capture
      if (dx === 1 && dy === 1 && !capturedPiece) {
        // This is an en passant capture
        const capturedPawnY = from.y;
        const capturedPawnX = to.x;
        const capturedPawn = this.board[capturedPawnY][capturedPawnX].piece;
        if (capturedPawn && capturedPawn.type === PieceType.Pawn) {
          this.board[capturedPawnY][capturedPawnX].piece = null;
          move.captured = capturedPawn;
          move.isEnPassant = true;
        }
      }
    }

    // Track rook moves for castling
    if (piece.type === PieceType.Rook) {
      this.rookMoved[`${from.x},${from.y}`] = true;
    }

    // Make the move
    toCell.piece = piece;
    fromCell.piece = null;

    // Handle captured pieces
    if (capturedPiece) {
      this.capturedPieces[capturedPiece.player].push(capturedPiece);
    }

    // Check for pawn promotion
    if (piece.type === PieceType.Pawn && this.needsPromotion(to, piece.player)) {
      // Auto-promote to queen for now
      toCell.piece = { player: piece.player, type: PieceType.Queen };
      move.promotion = PieceType.Queen;
    }

    // Record the move
    this.moveHistory.push(move);
    this.lastMove = move;

    return true;
  }

  nextTurn(): void {
    this.record();
    this.currentPlayer = ((this.currentPlayer + 1) % 3) as Player;
  }

  undo(): void {
    if (this.archives.length > 1) {
      this.archives.pop();
      this.import(this.archives[this.archives.length - 1]);
    }
  }

  record(): void {
    this.archives.push(this.export());
  }

  export(): string {
    const lines: string[] = [];

    for (let y = 0; y < 12; y++) {
      const line: string[] = [];
      for (let x = 0; x < 12; x++) {
        const piece = this.board[y][x].piece;
        if (piece) {
          line.push(`${piece.player},${piece.type}`);
        } else {
          line.push('-1,-1');
        }
      }
      lines.push(line.join('.'));
    }

    return `${lines.join('/')} ${this.currentPlayer}`;
  }

  import(boardString: string): void {
    const [boardData, playerData] = boardString.split(' ');
    this.currentPlayer = parseInt(playerData) as Player;

    const lines = boardData.split('/');
    for (let y = 0; y < lines.length; y++) {
      const cells = lines[y].split('.');
      for (let x = 0; x < cells.length; x++) {
        const [player, type] = cells[x].split(',').map((v) => parseInt(v));
        if (player >= 0 && type >= 0) {
          this.board[y][x].piece = {
            player: player as Player,
            type: type as PieceType,
          };
        } else {
          this.board[y][x].piece = null;
        }
      }
    }
  }

  getCellAt(x: number, y: number): Cell | null {
    if (x >= 0 && x < 12 && y >= 0 && y < 12) {
      return this.board[y][x];
    }
    return null;
  }
  
  // Check if a pawn needs promotion
  needsPromotion(pos: Position, player: Player): boolean {
    // Check if pawn reached opposite base
    if (player === Player.White) {
      // White pawn reaches red or black base
      return (pos.x >= 8 && pos.y >= 8) || (pos.x <= 1 && pos.y >= 4 && pos.y <= 7);
    } else if (player === Player.Red) {
      // Red pawn reaches white or black base
      return (pos.x <= 3 && pos.y <= 3) || (pos.x >= 8 && pos.y >= 8);
    } else {
      // Black pawn reaches white or red base
      return (pos.x <= 3 && pos.y <= 3) || (pos.x <= 1 && pos.y >= 4 && pos.y <= 7);
    }
  }
  
  // Get all possible moves for a piece at position
  getPossibleMoves(from: Position): Position[] {
    return ThreePlayerMovement.getPossibleMoves(this.board, from);
  }
}