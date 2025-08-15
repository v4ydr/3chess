import { ChessGraph } from './graph';
import { RaySystem } from './rays';
import { Player, PieceType } from '../types/game';
import type { Piece, BoardState, Move } from '../types/game';

export class GameEngine {
  private graph: ChessGraph;
  private rays: RaySystem;
  private state: BoardState;
  private turnOrder: Player[] = [Player.RED, Player.WHITE, Player.BLACK];
  
  constructor() {
    this.graph = new ChessGraph();
    this.rays = new RaySystem(this.graph);
    this.state = this.initializeBoard();
  }
  
  private initializeBoard(): BoardState {
    const pieces = new Map<string, Piece>();
    
    // Red pieces (bottom - A1 to H1)
    pieces.set('A1', { player: Player.RED, type: PieceType.ROOK });
    pieces.set('B1', { player: Player.RED, type: PieceType.KNIGHT });
    pieces.set('C1', { player: Player.RED, type: PieceType.BISHOP });
    pieces.set('D1', { player: Player.RED, type: PieceType.QUEEN });
    pieces.set('E1', { player: Player.RED, type: PieceType.KING });
    pieces.set('F1', { player: Player.RED, type: PieceType.BISHOP });
    pieces.set('G1', { player: Player.RED, type: PieceType.KNIGHT });
    pieces.set('H1', { player: Player.RED, type: PieceType.ROOK });
    
    // Red pawns
    for (const file of 'ABCDEFGH') {
      pieces.set(`${file}2`, { player: Player.RED, type: PieceType.PAWN });
    }
    
    // White pieces (top-left - A8 to L8)
    pieces.set('A8', { player: Player.WHITE, type: PieceType.ROOK });
    pieces.set('B8', { player: Player.WHITE, type: PieceType.KNIGHT });
    pieces.set('C8', { player: Player.WHITE, type: PieceType.BISHOP });
    pieces.set('D8', { player: Player.WHITE, type: PieceType.QUEEN });
    pieces.set('I8', { player: Player.WHITE, type: PieceType.KING });
    pieces.set('J8', { player: Player.WHITE, type: PieceType.BISHOP });
    pieces.set('K8', { player: Player.WHITE, type: PieceType.KNIGHT });
    pieces.set('L8', { player: Player.WHITE, type: PieceType.ROOK });
    
    // White pawns
    for (const file of 'ABCD') {
      pieces.set(`${file}7`, { player: Player.WHITE, type: PieceType.PAWN });
    }
    for (const file of 'IJKL') {
      pieces.set(`${file}7`, { player: Player.WHITE, type: PieceType.PAWN });
    }
    
    // Black pieces (top-right - H12 to L12)
    pieces.set('H12', { player: Player.BLACK, type: PieceType.ROOK });
    pieces.set('G12', { player: Player.BLACK, type: PieceType.KNIGHT });
    pieces.set('F12', { player: Player.BLACK, type: PieceType.BISHOP });
    pieces.set('E12', { player: Player.BLACK, type: PieceType.QUEEN });
    pieces.set('I12', { player: Player.BLACK, type: PieceType.KING });
    pieces.set('J12', { player: Player.BLACK, type: PieceType.BISHOP });
    pieces.set('K12', { player: Player.BLACK, type: PieceType.KNIGHT });
    pieces.set('L12', { player: Player.BLACK, type: PieceType.ROOK });
    
    // Black pawns
    for (const file of 'EFGH') {
      pieces.set(`${file}11`, { player: Player.BLACK, type: PieceType.PAWN });
    }
    for (const file of 'IJKL') {
      pieces.set(`${file}11`, { player: Player.BLACK, type: PieceType.PAWN });
    }
    
    return {
      pieces,
      currentPlayer: Player.RED,
      selectedNode: null,
      possibleMoves: [],
      moveHistory: [],
      lastMoveFrom: null,
      lastMoveTo: null
    };
  }
  
  getState(): BoardState {
    return this.state;
  }
  
  selectNode(node: string): void {
    const piece = this.state.pieces.get(node);
    const selectedPiece = this.state.selectedNode ? this.state.pieces.get(this.state.selectedNode) : null;
    
    if (!piece) {
      // Empty square clicked
      if (this.state.selectedNode && this.state.possibleMoves.includes(node) && 
          selectedPiece?.player === this.state.currentPlayer) {
        // Move piece here (only if it's the current player's piece)
        this.movePiece(this.state.selectedNode, node);
      } else {
        // Deselect
        this.state.selectedNode = null;
        this.state.possibleMoves = [];
      }
    } else if (piece.player === this.state.currentPlayer) {
      // Select this piece
      this.state.selectedNode = node;
      this.state.possibleMoves = this.getValidMoves(node);
    } else if (this.state.selectedNode && this.state.possibleMoves.includes(node) && 
               selectedPiece?.player === this.state.currentPlayer) {
      // Capture enemy piece (only if it's the current player's piece)
      this.movePiece(this.state.selectedNode, node);
    } else {
      // Clicked on non-turn piece - show its moves in gray (preview mode)
      this.state.selectedNode = node;
      this.state.possibleMoves = this.getValidMovesForPiece(node, piece);
    }
  }
  
  // New method to get moves for any piece (not just current player's)
  getValidMovesForPiece(node: string, piece: Piece): string[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return this.getPawnMoves(node, piece.player);
      case PieceType.ROOK:
        return this.getRookMoves(node, piece.player);
      case PieceType.BISHOP:
        return this.getBishopMoves(node, piece.player);
      case PieceType.KNIGHT:
        return this.getKnightMoves(node, piece.player);
      case PieceType.QUEEN:
        return this.getQueenMoves(node, piece.player);
      case PieceType.KING:
        return this.getKingMoves(node, piece.player);
      default:
        return [];
    }
  }
  
  private movePiece(from: string, to: string): void {
    const piece = this.state.pieces.get(from);
    if (!piece) return;
    
    // Check if there's a capture
    const capturedPiece = this.state.pieces.get(to);
    
    // Record the move
    const move: Move = {
      player: piece.player,
      piece: piece.type,
      from,
      to,
      captured: capturedPiece || undefined
    };
    this.state.moveHistory.push(move);
    
    // Track last move for highlighting
    this.state.lastMoveFrom = from;
    this.state.lastMoveTo = to;
    
    // Move piece
    this.state.pieces.delete(from);
    this.state.pieces.set(to, piece);
    
    // Clear selection
    this.state.selectedNode = null;
    this.state.possibleMoves = [];
    
    // Next player's turn
    const currentIndex = this.turnOrder.indexOf(this.state.currentPlayer);
    this.state.currentPlayer = this.turnOrder[(currentIndex + 1) % 3];
  }
  
  private getValidMoves(node: string): string[] {
    const piece = this.state.pieces.get(node);
    if (!piece || piece.player !== this.state.currentPlayer) {
      return [];
    }
    
    switch (piece.type) {
      case PieceType.PAWN:
        return this.getPawnMoves(node, piece.player);
      case PieceType.ROOK:
        return this.getRookMoves(node, piece.player);
      case PieceType.BISHOP:
        return this.getBishopMoves(node, piece.player);
      case PieceType.KNIGHT:
        return this.getKnightMoves(node, piece.player);
      case PieceType.QUEEN:
        return this.getQueenMoves(node, piece.player);
      case PieceType.KING:
        return this.getKingMoves(node, piece.player);
      default:
        return [];
    }
  }
  
  private getPawnMoves(node: string, player: Player): string[] {
    const moves: string[] = [];
    const fileNeighbors = this.graph.getNeighbors(node, 'file' as any);
    
    // Determine pawn direction based on player
    const file = node[0];
    const rank = parseInt(node.slice(1));
    
    for (const neighbor of fileNeighbors) {
      const neighborRank = parseInt(neighbor.slice(1));
      
      if (player === Player.RED) {
        // Red moves up (increasing rank or crossing sections)
        if (neighborRank > rank || (rank === 4 && (neighborRank === 5 || neighborRank === 9))) {
          if (!this.state.pieces.has(neighbor)) {
            moves.push(neighbor);
          }
        }
      } else if (player === Player.WHITE) {
        // White moves from middle section
        if ((rank >= 5 && rank <= 8 && neighborRank < rank) || (rank === 5 && neighborRank === 9)) {
          if (!this.state.pieces.has(neighbor)) {
            moves.push(neighbor);
          }
        }
      } else if (player === Player.BLACK) {
        // Black moves down
        if (neighborRank < rank || (rank === 9 && (neighborRank === 5 || neighborRank === 4))) {
          if (!this.state.pieces.has(neighbor)) {
            moves.push(neighbor);
          }
        }
      }
    }
    
    // TODO: Add pawn captures (diagonal moves to capture)
    
    return moves;
  }
  
  private getRookMoves(node: string, player: Player): string[] {
    const moves: string[] = [];
    const rays = this.rays.getRookRays(node);
    
    for (const ray of rays) {
      for (const square of ray) {
        const piece = this.state.pieces.get(square);
        if (piece) {
          if (piece.player !== player) {
            moves.push(square); // Can capture
          }
          break; // Ray blocked
        } else {
          moves.push(square);
        }
      }
    }
    
    return moves;
  }
  
  private getBishopMoves(node: string, player: Player): string[] {
    const moves: string[] = [];
    const rays = this.rays.getBishopRays(node);
    
    for (const ray of rays) {
      for (const square of ray) {
        const piece = this.state.pieces.get(square);
        if (piece) {
          if (piece.player !== player) {
            moves.push(square); // Can capture
          }
          break; // Ray blocked
        } else {
          moves.push(square);
        }
      }
    }
    
    return moves;
  }
  
  private getKnightMoves(node: string, player: Player): string[] {
    const moves: string[] = [];
    const knightSquares = this.rays.getKnightMoves(node);
    
    for (const square of knightSquares) {
      const piece = this.state.pieces.get(square);
      if (!piece || piece.player !== player) {
        moves.push(square);
      }
    }
    
    return moves;
  }
  
  private getQueenMoves(node: string, player: Player): string[] {
    // Queen moves like rook + bishop
    return [...this.getRookMoves(node, player), ...this.getBishopMoves(node, player)];
  }
  
  private getKingMoves(node: string, player: Player): string[] {
    const moves: string[] = [];
    const neighbors = this.graph.getNeighbors(node);
    
    for (const neighbor of neighbors) {
      const piece = this.state.pieces.get(neighbor);
      if (!piece || piece.player !== player) {
        moves.push(neighbor);
      }
    }
    
    return moves;
  }
}