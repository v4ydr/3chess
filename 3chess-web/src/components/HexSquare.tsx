import React, { useState } from 'react';
import type { Piece } from '../types/game';
import { Cell } from '../utils/hexMath';
import { Player, PieceType } from '../types/game';

interface HexSquareProps {
  node: string;
  cell: Cell;
  piece?: Piece;
  isSelected: boolean;
  isPossibleMove: boolean;
  isGrayMove?: boolean;  // For showing moves when not player's turn
  isLastMove?: boolean;  // For highlighting last move
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

// Filled/solid Unicode pieces
const pieceSymbols: Record<PieceType, string> = {
  [PieceType.KING]: '♚',
  [PieceType.QUEEN]: '♛',
  [PieceType.ROOK]: '♜',
  [PieceType.BISHOP]: '♝',
  [PieceType.KNIGHT]: '♞',
  [PieceType.PAWN]: '♟',
};

const HexSquare: React.FC<HexSquareProps> = ({
  node,
  cell,
  piece,
  isSelected,
  isPossibleMove,
  isGrayMove,
  isLastMove,
  onClick,
  onMouseDown,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // EXACT colors from unified_chess.py
  const darkColor = '#769656';  // Forest green
  const lightColor = '#EEEED2'; // Beige
  
  const fillColor = cell.isDark ? darkColor : lightColor;
  const edgeColor = cell.isDark ? '#14321900' : '#C8B88B00';
  
  // Create polygon points string
  const pointsStr = cell.points.map(p => `${p[0]},${p[1]}`).join(' ');
  
  // Determine cursor style
  const cursorStyle = piece ? 'pointer' : 'default';
  
  return (
    <g 
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: cursorStyle }}
    >
      {/* Base square */}
      <polygon
        points={pointsStr}
        fill={fillColor}
        stroke={edgeColor}
        strokeWidth="1"
      />
      
      {/* Highlight overlay for selection or last move */}
      {(isSelected || isLastMove) && (
        <polygon
          points={pointsStr}
          fill="#FFFF00"
          fillOpacity={"0.4"}
          stroke="none"
        />
      )}
      
      {/* Square name with hover effect */}
      <text
        x={cell.center.x}
        y={cell.center.y + 5}
        fontSize="18"
        fontWeight="bold"
        fill="#666"
        opacity={isHovered ? "0.8" : "0.2"}
        textAnchor="middle"
        style={{ 
          userSelect: 'none', 
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease'
        }}
      >
        {node}
      </text>
      
      {/* Piece */}
      {piece && (
        <text
          x={cell.center.x}
          y={cell.center.y + 18}
          fontSize="60"
          fontWeight="bold"
          textAnchor="middle"
          fill={
            piece.player === Player.RED ? '#D61539' :
            piece.player === Player.WHITE ? '#F0F0F0' :
            '#0A0A0A'
          }
          stroke={
            piece.player === Player.RED ? '#808080' :
            piece.player === Player.WHITE ? '#000000' :
            '#FFFFFF'
          }
          strokeWidth="1"
          style={{ userSelect: 'none' }}
        >
          {pieceSymbols[piece.type]}
        </text>
      )}
      
      {/* Possible move indicator (gray circle/dot for valid moves) - rendered OVER pieces */}
      {isPossibleMove && (
        piece ? (
          // Ring for captures
          <circle
            cx={cell.center.x}
            cy={cell.center.y}
            r="28"
            fill="none"
            stroke="rgba(180, 180, 180, 0.5)"
            strokeWidth="5"
          />
        ) : (
          // Small filled circle for empty squares
          <circle
            cx={cell.center.x}
            cy={cell.center.y}
            r="12"
            fill="rgba(180, 180, 180, 0.5)"
            stroke="none"
          />
        )
      )}
      
      {/* Preview move indicator (X for non-turn pieces) - rendered OVER pieces */}
      {isGrayMove && (
        <g>
          <line
            x1={cell.center.x - (piece ? 15 : 8)}
            y1={cell.center.y - (piece ? 15 : 8)}
            x2={cell.center.x + (piece ? 15 : 8)}
            y2={cell.center.y + (piece ? 15 : 8)}
            stroke="rgba(150, 150, 150, 0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1={cell.center.x - (piece ? 15 : 8)}
            y1={cell.center.y + (piece ? 15 : 8)}
            x2={cell.center.x + (piece ? 15 : 8)}
            y2={cell.center.y - (piece ? 15 : 8)}
            stroke="rgba(150, 150, 150, 0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

export default HexSquare;