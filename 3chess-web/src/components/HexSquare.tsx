import React from 'react';
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
  onClick: () => void;
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
  onClick,
}) => {
  // EXACT colors from unified_chess.py
  const darkColor = '#22572E';  // Forest green
  const lightColor = '#F5DEB3'; // Beige
  
  const fillColor = cell.isDark ? darkColor : lightColor;
  const edgeColor = cell.isDark ? '#143219' : '#C8B88B';
  
  // Create polygon points string
  const pointsStr = cell.points.map(p => `${p[0]},${p[1]}`).join(' ');
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Base square */}
      <polygon
        points={pointsStr}
        fill={fillColor}
        stroke={edgeColor}
        strokeWidth="1"
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <polygon
          points={pointsStr}
          fill="none"
          stroke="#FFD700"
          strokeWidth="4"
        />
      )}
      
      {/* Possible move indicator (green for valid turn, gray for preview) */}
      {(isPossibleMove || isGrayMove) && (
        <circle
          cx={cell.center.x}
          cy={cell.center.y}
          r="10"
          fill={isGrayMove ? "rgba(150, 150, 150, 0.5)" : "rgba(50, 205, 50, 0.8)"}
          stroke={isGrayMove ? "#666" : "#228B22"}
          strokeWidth="2"
        />
      )}
      
      {/* Square name with low opacity */}
      <text
        x={cell.center.x}
        y={cell.center.y + 5}
        fontSize="14"
        fill="#888"
        opacity="0.3"
        textAnchor="middle"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
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
          style={{ userSelect: 'none' }}
        >
          {pieceSymbols[piece.type]}
        </text>
      )}
    </g>
  );
};

export default HexSquare;