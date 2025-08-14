import React, { useState, useCallback, useEffect } from 'react';
import { HexBoard, HexSquare } from '../game/HexBoard';
import { Player, PieceType } from '../types';

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
  [Player.Black]: '#000000',
};

interface HexBoardComponentProps {
  board: HexBoard;
  currentPlayer: Player;
  onMove: (from: HexSquare, to: HexSquare) => void;
}

export const HexBoardComponent: React.FC<HexBoardComponentProps> = ({ board, currentPlayer, onMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<HexSquare | null>(null);
  
  const handleSquareClick = useCallback((square: HexSquare) => {
    if (selectedSquare) {
      // Try to move
      onMove(selectedSquare, square);
      setSelectedSquare(null);
    } else if (square.piece && square.piece.player === currentPlayer) {
      // Select this piece
      setSelectedSquare(square);
    }
  }, [selectedSquare, currentPlayer, onMove]);
  
  const getSquareColor = (col: number, row: number): string => {
    // Hexagonal checkered pattern
    return (col + row) % 2 === 0 ? '#e5d2aa' : '#362720';
  };
  
  // Calculate hexagonal positioning
  const getSquarePosition = (col: number, row: number): { x: number, y: number } => {
    const size = 50;
    const centerX = 400;
    const centerY = 400;
    
    // Map the 12x12 grid to hexagonal positions
    let x = centerX;
    let y = centerY;
    
    // White section (bottom) - rows 0-3
    if (row <= 3) {
      if (col <= 5) {
        x = centerX - 150 + col * size;
        y = centerY + 200 - row * size;
      }
    }
    // Red left section - rows 4-7
    else if (row >= 4 && row <= 7) {
      if (col <= 1) {
        x = centerX - 350 + col * size;
        y = centerY + 50 - (row - 4) * size;
      }
      // Red right section
      else if (col >= 8) {
        x = centerX + 150 + (col - 8) * size;
        y = centerY + 50 - (row - 4) * size;
      }
    }
    // Black section (top) - rows 8-11
    else if (row >= 8) {
      if (col >= 4 && col <= 9) {
        x = centerX - 50 + (col - 4) * size;
        y = centerY - 150 - (row - 8) * size;
      }
    }
    
    return { x, y };
  };
  
  return (
    <div style={{
      position: 'relative',
      width: '800px',
      height: '800px',
      backgroundColor: '#2a2a2a',
      margin: '20px auto',
    }}>
      {board.getAllSquares().map((square) => {
        const pos = getSquarePosition(square.col, square.row);
        const isSelected = selectedSquare === square;
        
        return (
          <div
            key={square.name}
            onClick={() => handleSquareClick(square)}
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: '48px',
              height: '48px',
              backgroundColor: isSelected ? '#90EE90' : getSquareColor(square.col, square.row),
              border: '1px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '30px',
              fontWeight: 'bold',
              userSelect: 'none',
            }}
          >
            {/* Show piece */}
            {square.piece && (
              <span style={{ 
                color: PLAYER_COLORS[square.piece.player],
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}>
                {PIECE_SYMBOLS[square.piece.type]}
              </span>
            )}
            
            {/* Show square name for debugging */}
            <span style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              fontSize: '8px',
              color: '#888',
            }}>
              {square.name}
            </span>
          </div>
        );
      })}
      
      {/* Show current player */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: PLAYER_COLORS[currentPlayer],
      }}>
        {['White', 'Red', 'Black'][currentPlayer]}'s Turn
      </div>
    </div>
  );
};