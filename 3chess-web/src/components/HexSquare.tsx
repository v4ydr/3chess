import React, { useState } from 'react';
import type { Piece } from '../types/game';
import { Cell } from '../utils/hexMath';
import { Player } from '../types/game';
import { 
  COLORS, 
  SIZES, 
  pieceSymbols,
  getPlayerColor,
  getPlayerStrokeColor,
  getMoveIndicatorColor 
} from '../config/constants';

interface HexSquareProps {
  node: string;
  cell: Cell;
  piece?: Piece;
  isSelected: boolean;
  isPossibleMove: boolean;
  isGrayMove?: boolean;  // For showing moves when not player's turn
  isLastMove?: boolean;  // For highlighting last move
  selectedPiecePlayer?: Player;  // The player of the selected piece
  isDragHovered?: boolean;  // True when a dragged piece is hovering over this square
  onClick: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}


const HexSquare: React.FC<HexSquareProps> = ({
  node,
  cell,
  piece,
  isSelected,
  isPossibleMove,
  isGrayMove,
  isLastMove,
  selectedPiecePlayer,
  isDragHovered,
  onClick,
  onMouseDown,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPieceHovered, setIsPieceHovered] = useState(false);
  
  const indicatorColor = getMoveIndicatorColor(selectedPiecePlayer);
  
  const fillColor = cell.isDark ? COLORS.board.darkSquare : COLORS.board.lightSquare;
  const edgeColor = cell.isDark ? COLORS.board.darkSquareEdge : COLORS.board.lightSquareEdge;
  
  // Create polygon points string
  const pointsStr = cell.points.map(p => `${p[0]},${p[1]}`).join(' ');
  
  // Create inset polygon for inner border (scaled down slightly)
  const insetPoints = cell.points.map(p => {
    // Move each point toward the center by a small amount
    const dx = p[0] - cell.center.x;
    const dy = p[1] - cell.center.y;
    const scale = SIZES.dragHoverInsetScale; // Scale down to create minimal inset
    return [
      cell.center.x + dx * scale,
      cell.center.y + dy * scale
    ];
  });
  const insetPointsStr = insetPoints.map(p => `${p[0]},${p[1]}`).join(' ');
  
  // Determine cursor style - only pointer when hovering over piece itself
  const cursorStyle = isPieceHovered ? 'pointer' : 'default';
  
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
        strokeWidth={SIZES.pieceStrokeWidth}
      />
      
      {/* Highlight overlay for selection or last move */}
      {(isSelected || isLastMove) && (
        <polygon
          points={pointsStr}
          fill={COLORS.ui.selectionHighlight}
          fillOpacity={COLORS.ui.selectionHighlightOpacity}
          stroke="none"
        />
      )}
      
      {/* Drag hover outline - inside border */}
      {isDragHovered && (
        <polygon
          points={insetPointsStr}
          fill="none"
          stroke={COLORS.ui.dragHoverStroke}
          strokeWidth={SIZES.dragHoverStrokeWidth}
        />
      )}
      
      {/* Square name with hover effect */}
      <text
        x={cell.center.x}
        y={cell.center.y + SIZES.squareLabelOffsetY}
        fontSize={SIZES.squareLabelFontSize}
        fontWeight="bold"
        fill={cell.isDark ? COLORS.board.darkSquareText : COLORS.board.lightSquareText}
        opacity={isHovered ? SIZES.squareLabelOpacityHover : SIZES.squareLabelOpacityNormal}
        textAnchor="middle"
        style={{ 
          userSelect: 'none', 
          pointerEvents: 'none',
          transition: `opacity ${SIZES.transitionDuration} ease`
        }}
      >
        {node}
      </text>
      
      {/* Piece */}
      {piece && (
        <text
          x={cell.center.x}
          y={cell.center.y + SIZES.pieceOffsetY}
          fontSize={SIZES.pieceFontSize}
          fontWeight="bold"
          textAnchor="middle"
          fill={getPlayerColor(piece.player)}
          stroke={getPlayerStrokeColor(piece.player)}
          strokeWidth={SIZES.pieceStrokeWidth}
          style={{ userSelect: 'none', cursor: 'pointer' }}
          onMouseEnter={() => setIsPieceHovered(true)}
          onMouseLeave={() => setIsPieceHovered(false)}
        >
          {pieceSymbols[piece.type]}
        </text>
      )}
      
      {/* Possible move indicator (color-tinted circle/dot for valid moves) - rendered OVER pieces */}
      {isPossibleMove && (
        piece ? (
          // Ring for captures
          <circle
            cx={cell.center.x}
            cy={cell.center.y}
            r={SIZES.captureIndicatorRadius}
            fill="none"
            stroke={indicatorColor}
            strokeWidth={SIZES.captureIndicatorStrokeWidth}
          />
        ) : (
          // Small filled circle for empty squares
          <circle
            cx={cell.center.x}
            cy={cell.center.y}
            r={SIZES.moveIndicatorRadius}
            fill={indicatorColor}
            stroke="none"
          />
        )
      )}
      
      {/* Preview move indicator (X for non-turn pieces) - rendered OVER pieces */}
      {isGrayMove && (
        <g>
          <line
            x1={cell.center.x - (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            y1={cell.center.y - (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            x2={cell.center.x + (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            y2={cell.center.y + (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            stroke={indicatorColor}
            strokeWidth={SIZES.previewMoveStrokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={cell.center.x - (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            y1={cell.center.y + (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            x2={cell.center.x + (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            y2={cell.center.y - (piece ? SIZES.previewMoveLineOffsetPiece : SIZES.previewMoveLineOffset)}
            stroke={indicatorColor}
            strokeWidth={SIZES.previewMoveStrokeWidth}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

export default HexSquare;