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
      lastMoveTo: null,
      promotionPending: null
    };
  }
  
  getState(): BoardState {
    return this.state;
  }
  
  selectNodeDebug(node: string): void {
    // Debug mode: move any piece to any square without restrictions
    const piece = this.state.pieces.get(node);
    const selectedPiece = this.state.selectedNode ? this.state.pieces.get(this.state.selectedNode) : null;
    
    if (this.state.selectedNode && selectedPiece) {
      // We have a piece selected - move it to the clicked square (any square)
      if (node !== this.state.selectedNode) {
        this.movePieceDebug(this.state.selectedNode, node);
      } else {
        // Clicked on the same piece - deselect
        this.state.selectedNode = null;
        this.state.possibleMoves = [];
      }
    } else if (piece) {
      // No piece selected - select this piece
      this.state.selectedNode = node;
      // In debug mode, show all squares as possible moves (except the piece's current square)
      this.state.possibleMoves = this.graph.getNodes().filter(n => n !== node);
    } else {
      // Clicked on empty square with nothing selected - do nothing
      this.state.selectedNode = null;
      this.state.possibleMoves = [];
    }
  }
  
  private movePieceDebug(from: string, to: string): void {
    // Debug move - no history, no turn change
    const piece = this.state.pieces.get(from);
    if (!piece) return;
    
    // Move piece
    this.state.pieces.delete(from);
    this.state.pieces.set(to, piece);
    
    // Track last move for highlighting (but don't record in history)
    this.state.lastMoveFrom = from;
    this.state.lastMoveTo = to;
    
    // Clear selection
    this.state.selectedNode = null;
    this.state.possibleMoves = [];
    
    // Don't change turn or record move
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
    
    // Move piece first
    this.state.pieces.delete(from);
    this.state.pieces.set(to, piece);
    
    // Check for pawn promotion
    if (piece.type === PieceType.PAWN && this.isPromotionSquare(to, piece.player)) {
      // Set promotion pending state
      this.state.promotionPending = {
        from,
        to,
        player: piece.player
      };
      // Don't advance turn yet - wait for promotion choice
      this.state.selectedNode = null;
      this.state.possibleMoves = [];
      return;
    }
    
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
    
    // Clear selection
    this.state.selectedNode = null;
    this.state.possibleMoves = [];
    
    // Next player's turn
    const currentIndex = this.turnOrder.indexOf(this.state.currentPlayer);
    this.state.currentPlayer = this.turnOrder[(currentIndex + 1) % 3];
  }
  
  private isPromotionSquare(square: string, player: Player): boolean {
    const file = square[0];
    const rank = parseInt(square.slice(1));
    
    if (player === Player.RED) {
      // Red promotes on rank 8, rank 12, or L file
      return rank === 8 || rank === 12 || file === 'L';
    } else if (player === Player.WHITE) {
      // White promotes on rank 1, rank 12, or H file  
      return rank === 1 || rank === 12 || file === 'H';
    } else if (player === Player.BLACK) {
      // Black promotes on rank 1, rank 8, or A file
      return rank === 1 || rank === 8 || file === 'A';
    }
    
    return false;
  }
  
  promotePawn(pieceType: PieceType): void {
    if (!this.state.promotionPending) return;
    
    const { from, to, player } = this.state.promotionPending;
    
    // Replace pawn with promoted piece
    this.state.pieces.set(to, { player, type: pieceType });
    
    // Record the move with promotion
    const move: Move = {
      player,
      piece: PieceType.PAWN,
      from,
      to,
      promotion: pieceType
    };
    this.state.moveHistory.push(move);
    
    // Track last move for highlighting
    this.state.lastMoveFrom = from;
    this.state.lastMoveTo = to;
    
    // Clear promotion state
    this.state.promotionPending = null;
    
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
    const rank = parseInt(node.slice(1));
    
    // Get forward moves along the file
    const forwardMoves = this.getPawnForwardMoves(node, player);
    moves.push(...forwardMoves);
    
    // Get diagonal captures
    const captures = this.getPawnCaptures(node, player);
    moves.push(...captures);
    
    return moves;
  }
  
  private getPawnForwardMoves(node: string, player: Player): string[] {
    const moves: string[] = [];
    const fileNeighbors = this.graph.getNeighbors(node, 'file' as any);
    const file = node[0];
    const rank = parseInt(node.slice(1));
    
    // Check if pawn is in starting position
    const isStartingPosition = (
      (player === Player.RED && rank === 2) ||
      (player === Player.WHITE && rank === 7) ||
      (player === Player.BLACK && rank === 11)
    );
    
    // Determine forward direction based on player and position
    let forwardSquare: string | null = null;
    
    for (const neighbor of fileNeighbors) {
      const neighborRank = parseInt(neighbor.slice(1));
      
      if (player === Player.RED) {
        // Red moves "up" - generally increasing rank
        // Special case: from rank 4, can go to 5 (for A,B,C,D files) or 9 (for E,F,G,H,I,J,K,L files)
        if (rank === 4) {
          if ('ABCD'.includes(file) && neighborRank === 5) {
            forwardSquare = neighbor;
          } else if ('EFGHIJKL'.includes(file) && neighborRank === 9) {
            forwardSquare = neighbor;
          }
        } else if (neighborRank === rank + 1) {
          forwardSquare = neighbor;
        }
      } else if (player === Player.WHITE) {
        // White moves in middle section and transitions
        // From 8→7→6→5 then 5→9 for I,J,K,L files or 5→4 for A,B,C,D,E,F,G,H files
        if (rank === 5 && 'IJKL'.includes(file)) {
          if (neighborRank === 9) {
            forwardSquare = neighbor;
          }
        } else if (rank === 5 && 'ABCDEFGH'.includes(file)) {
          if (neighborRank === 4) {
            forwardSquare = neighbor;
          }
        } else if (rank >= 6 && rank <= 8 && neighborRank === rank - 1) {
          forwardSquare = neighbor;
        } else if (rank >= 9 && neighborRank === rank + 1) {
          // White can also move up once in the top section
          forwardSquare = neighbor;
        } else if (rank >= 2 && rank <= 4 && neighborRank === rank - 1) {
          // White continues moving down in the bottom section (ranks 4→3→2→1)
          forwardSquare = neighbor;
        }
      } else if (player === Player.BLACK) {
        // Black moves "down" but direction changes after transition
        // From 12→11→10→9, then 9→5 (or 9→4), then continues 5→6→7→8 (or 4→3→2→1)
        if (rank === 9) {
          // At rank 9, transition to 5 for IJKL files, or 4 for EFGH files
          if ('IJKL'.includes(file) && neighborRank === 5) {
            forwardSquare = neighbor;
          } else if ('EFGH'.includes(file) && neighborRank === 4) {
            forwardSquare = neighbor;
          }
        } else if (rank > 9) {
          // Before transition: moving down (decreasing rank)
          if (neighborRank === rank - 1) {
            forwardSquare = neighbor;
          }
        } else if (rank >= 5 && rank <= 8) {
          // After transition in middle section (IJKL files): now moving up (increasing rank)
          if ('IJKL'.includes(file) && neighborRank === rank + 1) {
            forwardSquare = neighbor;
          }
        } else if (rank < 5) {
          // In bottom section (EFGH files after transition): moving down (decreasing rank)
          if (neighborRank === rank - 1) {
            forwardSquare = neighbor;
          }
        }
      }
    }
    
    // Add one square forward if not blocked
    if (forwardSquare && !this.state.pieces.has(forwardSquare)) {
      moves.push(forwardSquare);
      
      // Check two squares forward from starting position
      if (isStartingPosition) {
        const nextFileNeighbors = this.graph.getNeighbors(forwardSquare, 'file' as any);
        const forwardRank = parseInt(forwardSquare.slice(1));
        
        for (const neighbor of nextFileNeighbors) {
          const neighborRank = parseInt(neighbor.slice(1));
          
          if (player === Player.RED) {
            if (forwardRank === 3 && neighborRank === 4) {
              if (!this.state.pieces.has(neighbor)) {
                moves.push(neighbor);
              }
            }
          } else if (player === Player.WHITE) {
            if (forwardRank === 6 && neighborRank === 5) {
              if (!this.state.pieces.has(neighbor)) {
                moves.push(neighbor);
              }
            }
          } else if (player === Player.BLACK) {
            if (forwardRank === 10 && neighborRank === 9) {
              if (!this.state.pieces.has(neighbor)) {
                moves.push(neighbor);
              }
            }
          }
        }
      }
    }
    
    return moves;
  }
  
  private getPawnCaptures(node: string, player: Player): string[] {
    const captures: string[] = [];
    const diagonalNeighbors = this.graph.getNeighbors(node, 'diagonal' as any);
    const file = node[0];
    const rank = parseInt(node.slice(1));
    
    for (const neighbor of diagonalNeighbors) {
      const neighborFile = neighbor[0];
      const neighborRank = parseInt(neighbor.slice(1));
      const piece = this.state.pieces.get(neighbor);
      
      // Check if it's a forward diagonal based on player
      // Use the same logic as forward moves to determine if it's in the right direction
      let isForwardDiagonal = false;
      
      if (player === Player.RED) {
        // Red captures diagonally "upward"
        if (rank < 4) {
          // Normal progression: next rank up
          isForwardDiagonal = neighborRank === rank + 1;
        } else if (rank === 4) {
          // Transition: can capture into rank 5 (for files on same side) or rank 9 (cross-board)
          isForwardDiagonal = neighborRank === 5 || neighborRank === 9;
        } else if (rank >= 5 && rank <= 7) {
          // In middle section: continue upward
          isForwardDiagonal = neighborRank === rank + 1;
        } else if (rank === 8) {
          // At rank 8, can transition to rank 9 (toward black's area)
          isForwardDiagonal = neighborRank === 9;
        } else if (rank >= 9) {
          // In top section: continue upward toward black's backrank
          isForwardDiagonal = neighborRank === rank + 1;
        }
      } else if (player === Player.WHITE) {
        // White captures diagonally in its direction
        if (rank >= 6 && rank <= 8) {
          // Moving down in middle section
          isForwardDiagonal = neighborRank === rank - 1;
        } else if (rank === 5) {
          // At transition: can go to 4 (for ABCD/EFGH) or 9 (for IJKL → EFGH cross-board)
          if ('IJKL'.includes(file)) {
            // From IJKL at rank 5, can capture to rank 9 (any file in that area)
            isForwardDiagonal = neighborRank === 9;
          } else {
            // From ABCD/EFGH at rank 5, can capture to rank 4
            isForwardDiagonal = neighborRank === 4;
          }
        } else if (rank >= 9) {
          // In top section: moving up
          isForwardDiagonal = neighborRank === rank + 1;
        } else if (rank >= 2 && rank <= 4) {
          // In bottom section: moving down
          isForwardDiagonal = neighborRank === rank - 1;
        }
      } else if (player === Player.BLACK) {
        // Black captures diagonally in its forward direction
        if (rank > 9) {
          // Moving down from top
          isForwardDiagonal = neighborRank === rank - 1;
        } else if (rank === 9) {
          // At transition: can go to 5 (for IJKL) or 4 (for EFGH) or 8 (staying in upper area)
          isForwardDiagonal = neighborRank === 8 || neighborRank === 5 || neighborRank === 4;
        } else if (rank >= 6 && rank <= 8) {
          // In middle section after transition (IJKL files): moving up
          if ('IJKL'.includes(file)) {
            isForwardDiagonal = neighborRank === rank + 1;
          } else if ('EFGH'.includes(file)) {
            // EFGH files in middle section: moving down
            isForwardDiagonal = neighborRank === rank - 1;
          }
        } else if (rank === 5) {
          // At rank 5: IJKL continues up to 6, EFGH transitions down to 4
          if ('IJKL'.includes(file)) {
            isForwardDiagonal = neighborRank === 6;
          } else if ('EFGH'.includes(file)) {
            isForwardDiagonal = neighborRank === 4;
          }
        } else if (rank < 5) {
          // In bottom section: moving down toward red's area
          isForwardDiagonal = neighborRank === rank - 1;
        }
      }
      
      // Can only capture enemy pieces
      if (isForwardDiagonal && piece && piece.player !== player) {
        captures.push(neighbor);
      }
    }
    
    return captures;
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