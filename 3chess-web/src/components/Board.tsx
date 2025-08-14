import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Game } from '../game/Game';
import { Player, PieceType } from '../types';
import type { Position } from '../types';
import { pointInPolygon } from '../utils/geometry';

const PIECE_SYMBOLS: { [key in PieceType]: string } = {
  [PieceType.King]: '♔',
  [PieceType.Queen]: '♕',
  [PieceType.Rook]: '♖',
  [PieceType.Bishop]: '♗',
  [PieceType.Knight]: '♘',
  [PieceType.Pawn]: '♙',
};

const PLAYER_COLORS = {
  [Player.White]: '#FFFFFF',
  [Player.Red]: '#D61541',
  [Player.Black]: '#784D3A',
};

interface BoardProps {
  game: Game;
  onMove: (from: Position, to: Position) => void;
  showPossibleMoves?: boolean;
}

export const Board: React.FC<BoardProps> = ({ game, onMove, showPossibleMoves = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 800, 800);

    // Draw cells
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        const cell = game.board[y][x];
        if (!cell.points) continue;

        // Draw cell background
        ctx.fillStyle = cell.color;
        
        // Highlight hovered cell
        if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y) {
          ctx.fillStyle = '#969696';
        }
        
        // Highlight selected cell
        if (selectedCell && selectedCell.x === x && selectedCell.y === y) {
          ctx.fillStyle = '#90EE90';
        }
        
        // Don't highlight possible moves here, we'll draw dots instead
        
        // Highlight king in check
        if (cell.piece && cell.piece.type === PieceType.King && 
            cell.piece.player === game.currentPlayer && 
            game.isKingInCheck(game.currentPlayer)) {
          ctx.fillStyle = '#ff6666';
        }

        ctx.beginPath();
        ctx.moveTo(cell.points[0][0], cell.points[0][1]);
        for (let i = 1; i < cell.points.length; i++) {
          ctx.lineTo(cell.points[i][0], cell.points[i][1]);
        }
        ctx.closePath();
        ctx.fill();

        // Draw cell border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Draw piece
        if (cell.piece) {
          ctx.save();
          ctx.fillStyle = PLAYER_COLORS[cell.piece.player];
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.font = '32px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const symbol = PIECE_SYMBOLS[cell.piece.type];
          
          // Draw black outline for better visibility
          ctx.strokeText(symbol, cell.center.x, cell.center.y);
          ctx.fillText(symbol, cell.center.x, cell.center.y);
          ctx.restore();
        }
      }
    }
    
    // Draw possible move indicators as dots
    if (showPossibleMoves && possibleMoves.length > 0) {
      for (const move of possibleMoves) {
        const cell = game.board[move.y][move.x];
        if (!cell.points) continue;
        
        ctx.save();
        ctx.globalAlpha = 0.5;
        
        if (cell.piece) {
          // Draw a ring around enemy pieces that can be captured
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cell.center.x, cell.center.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Draw a dot for empty squares
          ctx.fillStyle = '#4CAF50';
          ctx.beginPath();
          ctx.arc(cell.center.x, cell.center.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }
  }, [game, hoveredCell, selectedCell, possibleMoves]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard, possibleMoves]);

  // Calculate possible moves when a piece is selected
  useEffect(() => {
    if (selectedCell && showPossibleMoves) {
      const piece = game.board[selectedCell.y][selectedCell.x].piece;
      
      if (piece && piece.player === game.currentPlayer) {
        // Get possible moves from the game
        const moves = game.getPossibleMoves(selectedCell);
        // Filter to only include moves that don't put king in check
        const validMoves = moves.filter(move => 
          game.isValidMove(selectedCell, move)
        );
        setPossibleMoves(validMoves);
      } else {
        setPossibleMoves([]);
      }
    } else {
      setPossibleMoves([]);
    }
  }, [selectedCell, game, showPossibleMoves]);

  const getCellAtPosition = useCallback(
    (x: number, y: number): Position | null => {
      for (let cellY = 0; cellY < 12; cellY++) {
        for (let cellX = 0; cellX < 12; cellX++) {
          const cell = game.board[cellY][cellX];
          if (cell.points && pointInPolygon([x, y], cell.points)) {
            return { x: cellX, y: cellY };
          }
        }
      }
      return null;
    },
    [game]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cell = getCellAtPosition(x, y);
      setHoveredCell(cell);
    },
    [getCellAtPosition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedCell = getCellAtPosition(x, y);
      if (!clickedCell) return;

      // If we have a selected piece and clicked on a valid move, make the move
      if (selectedCell && possibleMoves.some(move => move.x === clickedCell.x && move.y === clickedCell.y)) {
        onMove(selectedCell, clickedCell);
        setSelectedCell(null);
        setPossibleMoves([]);
      } else {
        // Otherwise, select/deselect the clicked cell
        const boardCell = game.board[clickedCell.y][clickedCell.x];
        if (boardCell.piece && boardCell.piece.player === game.currentPlayer) {
          // Select this piece
          if (selectedCell?.x === clickedCell.x && selectedCell?.y === clickedCell.y) {
            // Clicking the same piece deselects it
            setSelectedCell(null);
            setPossibleMoves([]);
          } else {
            // Select new piece
            setSelectedCell(clickedCell);
          }
        } else {
          // Clicked on empty square or enemy piece without a selection
          setSelectedCell(null);
          setPossibleMoves([]);
        }
      }
    },
    [getCellAtPosition, game, selectedCell, possibleMoves, onMove]
  );

  // We don't need handleMouseUp anymore for click-to-move
  const handleMouseUp = useCallback(() => {}, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      style={{ 
        border: '2px solid #333',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: selectedCell ? 'pointer' : 'default'
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};