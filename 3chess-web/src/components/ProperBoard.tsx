import React, { useState, useCallback, useEffect } from 'react';
import { ProperGame } from '../game/ProperGame';
import type { Square } from '../game/ProperBoard';
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

interface ProperBoardProps {
  game: ProperGame;
  onMove: () => void;
}

export const ProperBoardComponent: React.FC<ProperBoardProps> = ({ game, onMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [, forceUpdate] = useState({});
  
  // Calculate possible moves when a square is selected
  useEffect(() => {
    if (selectedSquare) {
      const moves = game.getPossibleMoves(selectedSquare);
      setPossibleMoves(moves);
    } else {
      setPossibleMoves([]);
    }
  }, [selectedSquare, game]);
  
  const handleSquareClick = useCallback((square: Square) => {
    // If we have a selected square and clicked on a valid move, make the move
    if (selectedSquare && possibleMoves.includes(square)) {
      if (game.makeMove(selectedSquare, square)) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        onMove();
      }
    } else if (square.piece && square.piece.player === game.currentPlayer) {
      // Select this square
      if (selectedSquare === square) {
        // Deselect if clicking the same square
        setSelectedSquare(null);
      } else {
        setSelectedSquare(square);
      }
    } else {
      // Clicked on empty square or enemy piece - deselect
      setSelectedSquare(null);
    }
  }, [selectedSquare, possibleMoves, game, onMove]);
  
  const getSquareColor = (row: number, col: number): string => {
    return (row + col) % 2 === 0 ? '#e5d2aa' : '#362720';
  };
  
  const renderSquare = (square: Square, x: number, y: number) => {
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    const squareColor = getSquareColor(square.row, square.col);
    
    return (
      <div
        key={square.name}
        onClick={() => handleSquareClick(square)}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: '60px',
          height: '60px',
          backgroundColor: isSelected ? '#90EE90' : squareColor,
          border: '1px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '36px',
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
        
        {/* Show possible move indicator */}
        {isPossibleMove && !square.piece && (
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#4CAF50',
            borderRadius: '50%',
            opacity: 0.7,
          }} />
        )}
        
        {/* Show capture indicator */}
        {isPossibleMove && square.piece && (
          <div style={{
            position: 'absolute',
            width: '50px',
            height: '50px',
            border: '3px solid #ff0000',
            borderRadius: '50%',
            opacity: 0.7,
          }} />
        )}
        
        {/* Show square name for debugging */}
        <span style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          fontSize: '10px',
          color: '#888',
        }}>
          {square.name}
        </span>
      </div>
    );
  };
  
  return (
    <div style={{
      position: 'relative',
      width: '800px',
      height: '800px',
      backgroundColor: '#f0f0f0',
      margin: '20px auto',
    }}>
      {/* Render White's section (bottom-left) */}
      {game.board.whiteSection.map((row, rowIdx) => 
        row.map((square, colIdx) => 
          renderSquare(square, 100 + colIdx * 60, 500 - rowIdx * 60)
        )
      )}
      
      {/* Render Red's left section */}
      {game.board.redSection.map((row, rowIdx) => 
        row.slice(0, 4).map((square, colIdx) => 
          renderSquare(square, 40 + colIdx * 60, 260 - rowIdx * 60)
        )
      )}
      
      {/* Render Red's right section */}
      {game.board.redSection.map((row, rowIdx) => 
        row.slice(4, 8).map((square, colIdx) => 
          renderSquare(square, 400 + colIdx * 60, 260 - rowIdx * 60)
        )
      )}
      
      {/* Render Black's section (top-right) */}
      {game.board.blackSection.map((row, rowIdx) => 
        row.map((square, colIdx) => 
          renderSquare(square, 340 + colIdx * 60, 20 + rowIdx * 60)
        )
      )}
      
      {/* Show current player */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: PLAYER_COLORS[game.currentPlayer],
      }}>
        {['White', 'Red', 'Black'][game.currentPlayer]}'s Turn
      </div>
    </div>
  );
};