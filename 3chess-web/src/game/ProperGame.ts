import { Player, PieceType } from '../types';
import type { Piece } from '../types';
import type { Square } from './ProperBoard';
import { ProperBoard } from './ProperBoard';
import { ProperMovement } from './ProperMovement';

export class ProperGame {
  board: ProperBoard;
  currentPlayer: Player;
  moveHistory: string[] = [];
  selectedSquare: Square | null = null;
  
  constructor() {
    this.board = new ProperBoard();
    this.currentPlayer = Player.White;
  }
  
  // Get all possible moves for a square
  getPossibleMoves(square: Square): Square[] {
    if (!square.piece || square.piece.player !== this.currentPlayer) {
      return [];
    }
    
    return ProperMovement.getPossibleMoves(this.board, square);
  }
  
  // Check if a move is valid
  isValidMove(from: Square, to: Square): boolean {
    return ProperMovement.isValidMove(this.board, from, to, this.currentPlayer);
  }
  
  // Make a move
  makeMove(from: Square, to: Square): boolean {
    if (!this.isValidMove(from, to)) {
      return false;
    }
    
    // Record the move
    const moveNotation = `${from.name}-${to.name}`;
    this.moveHistory.push(moveNotation);
    
    // Capture piece if present
    const capturedPiece = to.piece;
    
    // Move the piece
    to.piece = from.piece;
    from.piece = null;
    
    // Advance to next player
    this.nextTurn();
    
    return true;
  }
  
  // Advance to next player
  nextTurn() {
    if (this.currentPlayer === Player.White) {
      this.currentPlayer = Player.Red;
    } else if (this.currentPlayer === Player.Red) {
      this.currentPlayer = Player.Black;
    } else {
      this.currentPlayer = Player.White;
    }
  }
  
  // Reset the game
  reset() {
    this.board = new ProperBoard();
    this.currentPlayer = Player.White;
    this.moveHistory = [];
    this.selectedSquare = null;
  }
  
  // Get a square by name
  getSquare(name: string): Square | undefined {
    return this.board.getSquare(name);
  }
  
  // Get all squares for rendering
  getAllSquares(): Square[] {
    return this.board.getAllSquares();
  }
}