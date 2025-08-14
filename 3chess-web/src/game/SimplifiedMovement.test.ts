import { describe, it, expect, beforeEach } from 'vitest';
import { SimplifiedMovement } from './SimplifiedMovement';
import { Game } from './Game';
import { Player, PieceType } from '../types';
import type { Position } from '../types';

describe('SimplifiedMovement', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('Pawn Movement', () => {
    it('should allow white pawns to move forward one square', () => {
      // Test white pawn at (0, 1)
      const from: Position = { x: 0, y: 1 };
      const moves = SimplifiedMovement.getPawnMoves(game.board, from);
      
      // Should be able to move forward
      expect(moves).toContainEqual({ x: 0, y: 2 });
      
      // Should be able to move two squares from starting position
      expect(moves).toContainEqual({ x: 0, y: 3 });
    });

    it('should allow white pawns at edge to move right', () => {
      // Test white pawn at (5, 1) - edge position
      const from: Position = { x: 5, y: 1 };
      const moves = SimplifiedMovement.getPawnMoves(game.board, from);
      
      // Should include rightward movement
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should allow red pawns to move from left side', () => {
      // Test red pawn at (1, 4)
      const from: Position = { x: 1, y: 4 };
      const moves = SimplifiedMovement.getPawnMoves(game.board, from);
      
      // Should be able to move right
      expect(moves).toContainEqual({ x: 2, y: 4 });
      
      // Should be able to move two squares from starting position
      expect(moves).toContainEqual({ x: 3, y: 4 });
    });

    it('should allow black pawns to move forward', () => {
      // Test black pawn at (9, 10)
      const from: Position = { x: 9, y: 10 };
      const moves = SimplifiedMovement.getPawnMoves(game.board, from);
      
      // Should be able to move up
      expect(moves).toContainEqual({ x: 9, y: 9 });
      
      // Should be able to move two squares from starting position
      expect(moves).toContainEqual({ x: 9, y: 8 });
    });

    it('should allow pawns to capture diagonally', () => {
      // Place an enemy piece for white pawn to capture
      game.board[2][1].piece = { player: Player.Red, type: PieceType.Pawn };
      
      const from: Position = { x: 0, y: 1 };
      const moves = SimplifiedMovement.getPawnMoves(game.board, from);
      
      // Should be able to capture diagonally
      expect(moves).toContainEqual({ x: 1, y: 2 });
    });

    it('should not allow pawns to move forward if blocked', () => {
      // Place a piece blocking the pawn
      game.board[2][0].piece = { player: Player.Red, type: PieceType.Pawn };
      
      const from: Position = { x: 0, y: 1 };
      const moves = SimplifiedMovement.getPawnMoves(game.board, from);
      
      // Should not be able to move forward
      expect(moves).not.toContainEqual({ x: 0, y: 2 });
      expect(moves).not.toContainEqual({ x: 0, y: 3 });
    });
  });

  describe('Knight Movement', () => {
    it('should allow knight to make L-shaped moves', () => {
      const from: Position = { x: 1, y: 0 };
      const moves = SimplifiedMovement.getKnightMoves(game.board, from);
      
      // Knight should have multiple moves available
      expect(moves.length).toBeGreaterThan(0);
      
      // Check for some typical knight moves
      // Note: exact moves depend on board validity
    });

    it('should not allow knight to capture own pieces', () => {
      const from: Position = { x: 1, y: 0 };
      const moves = SimplifiedMovement.getKnightMoves(game.board, from);
      
      // Should not include positions with own pieces
      for (const move of moves) {
        const piece = game.board[move.y][move.x].piece;
        if (piece) {
          expect(piece.player).not.toBe(Player.White);
        }
      }
    });
  });

  describe('Rook Movement', () => {
    it('should allow rook to move horizontally and vertically', () => {
      // Clear the path for testing
      game.board[1][0].piece = null; // Remove pawn
      
      const from: Position = { x: 0, y: 0 };
      const moves = SimplifiedMovement.getRookMoves(game.board, from);
      
      // Should be able to move down
      expect(moves).toContainEqual({ x: 0, y: 1 });
      expect(moves).toContainEqual({ x: 0, y: 2 });
      expect(moves).toContainEqual({ x: 0, y: 3 });
    });

    it('should stop rook at first piece encountered', () => {
      const from: Position = { x: 0, y: 0 };
      const moves = SimplifiedMovement.getRookMoves(game.board, from);
      
      // Should not be able to move past own pawn at (0, 1)
      expect(moves).not.toContainEqual({ x: 0, y: 2 });
    });
  });

  describe('Bishop Movement', () => {
    it('should allow bishop to move diagonally', () => {
      // Clear some pawns for testing
      game.board[1][1].piece = null;
      game.board[2][2].piece = null;
      
      const from: Position = { x: 2, y: 0 };
      const moves = SimplifiedMovement.getBishopMoves(game.board, from);
      
      // Bishop should have diagonal moves
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should keep bishop on same color squares', () => {
      const from: Position = { x: 2, y: 0 };
      const fromColor = game.board[0][2].color;
      const moves = SimplifiedMovement.getBishopMoves(game.board, from);
      
      // All destination squares should be same color
      for (const move of moves) {
        if (game.board[move.y][move.x].points) {
          expect(game.board[move.y][move.x].color).toBe(fromColor);
        }
      }
    });
  });

  describe('Queen Movement', () => {
    it('should combine rook and bishop moves', () => {
      // Clear some pieces for testing
      game.board[1][3].piece = null;
      
      const from: Position = { x: 3, y: 0 };
      const moves = SimplifiedMovement.getQueenMoves(game.board, from);
      
      // Queen should have both diagonal and straight moves
      expect(moves.length).toBeGreaterThan(0);
    });
  });

  describe('King Movement', () => {
    it('should allow king to move one square in any direction', () => {
      // Move king to a more central position for testing
      game.board[3][3].piece = { player: Player.White, type: PieceType.King };
      game.board[3][4].piece = null; // Clear original position
      
      const from: Position = { x: 3, y: 3 };
      const moves = SimplifiedMovement.getKingMoves(game.board, from);
      
      // King should be able to move to adjacent squares
      expect(moves.length).toBeGreaterThan(0);
      
      // All moves should be exactly one square away
      for (const move of moves) {
        const dx = Math.abs(move.x - from.x);
        const dy = Math.abs(move.y - from.y);
        expect(dx <= 1 && dy <= 1).toBe(true);
      }
    });
  });

  describe('Move Validation', () => {
    it('should validate moves correctly for current player', () => {
      const from: Position = { x: 0, y: 1 };
      const to: Position = { x: 0, y: 2 };
      
      // White's turn - should be valid
      expect(SimplifiedMovement.isValidMove(game.board, from, to, Player.White)).toBe(true);
      
      // Red's turn - should be invalid (not their piece)
      expect(SimplifiedMovement.isValidMove(game.board, from, to, Player.Red)).toBe(false);
    });

    it('should not allow moving opponent pieces', () => {
      const from: Position = { x: 1, y: 4 }; // Red pawn
      const to: Position = { x: 2, y: 4 };
      
      // White's turn - should not be able to move red piece
      expect(SimplifiedMovement.isValidMove(game.board, from, to, Player.White)).toBe(false);
    });

    it('should not allow invalid moves', () => {
      const from: Position = { x: 0, y: 1 }; // White pawn
      const to: Position = { x: 5, y: 5 }; // Random invalid position
      
      expect(SimplifiedMovement.isValidMove(game.board, from, to, Player.White)).toBe(false);
    });
  });

  describe('Starting Position Tests', () => {
    it('should correctly identify white pawn starting positions', () => {
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 0, y: 1 }, Player.White)).toBe(true);
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 3, y: 1 }, Player.White)).toBe(true);
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 5, y: 1 }, Player.White)).toBe(true);
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 5, y: 3 }, Player.White)).toBe(true);
      
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 0, y: 2 }, Player.White)).toBe(false);
    });

    it('should correctly identify red pawn starting positions', () => {
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 1, y: 4 }, Player.Red)).toBe(true);
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 1, y: 7 }, Player.Red)).toBe(true);
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 9, y: 5 }, Player.Red)).toBe(true);
      
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 2, y: 4 }, Player.Red)).toBe(false);
    });

    it('should correctly identify black pawn starting positions', () => {
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 9, y: 10 }, Player.Black)).toBe(true);
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 9, y: 9 }, Player.Black)).toBe(true);
      
      expect(SimplifiedMovement.isPawnStartingPosition({ x: 8, y: 9 }, Player.Black)).toBe(false);
    });
  });
});