import React, { useMemo, useState, useRef } from 'react';
import type { BoardState, Piece } from '../types/game';
import { Cell } from '../utils/hexMath';
import { createNodeMapping } from '../utils/nodeMapping';
import HexSquare from './HexSquare';
import './HexBoard.css';
import { Player, PieceType } from '../types/game';

// Filled/solid Unicode pieces
const pieceSymbols: Record<PieceType, string> = {
  [PieceType.KING]: '♚',
  [PieceType.QUEEN]: '♛',
  [PieceType.ROOK]: '♜',
  [PieceType.BISHOP]: '♝',
  [PieceType.KNIGHT]: '♞',
  [PieceType.PAWN]: '♟',
};

const DraggedPiece: React.FC<{ piece: Piece; x: number; y: number }> = ({ piece, x, y }) => (
  <text
    x={x}
    y={y + 18}
    fontSize="60"
    fontWeight="bold"
    textAnchor="middle"
    fill={
      piece.player === Player.RED ? '#D61539' :
      piece.player === Player.WHITE ? '#F0F0F0' :
      '#0A0A0A'
    }
    style={{ 
      userSelect: 'none', 
      pointerEvents: 'none',
      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
    }}
  >
    {pieceSymbols[piece.type]}
  </text>
);

interface HexBoardProps {
  state: BoardState;
  onSquareClick: (node: string) => void;
}

const HexBoard: React.FC<HexBoardProps> = ({ state, onSquareClick }) => {
  const nodeMapping = useMemo(() => createNodeMapping(), []);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Create cells for all positions
  const cells = useMemo(() => {
    const cellMap = new Map<string, Cell>();
    
    for (const [node, [x, y]] of nodeMapping.entries()) {
      const cell = new Cell(x, y);
      if (cell.points.length > 0) {
        cellMap.set(node, cell);
      }
    }
    
    return cellMap;
  }, [nodeMapping]);
  
  const handleDragStart = (node: string, event: React.MouseEvent) => {
    const piece = state.pieces.get(node);
    if (piece && piece.player === state.currentPlayer) {
      event.preventDefault();
      setDraggedNode(node);
      onSquareClick(node); // Select the piece
      
      // Track mouse position for dragging
      const handleMouseMove = (e: MouseEvent) => {
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 900;
          const y = ((e.clientY - rect.top) / rect.height) * 900;
          setDragPosition({ x, y });
        }
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        if (svgRef.current && draggedNode) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 900;
          const y = ((e.clientY - rect.top) / rect.height) * 900;
          
          // Find which square was dropped on
          for (const [node, cell] of cells.entries()) {
            const dist = Math.sqrt(
              Math.pow(cell.center.x - x, 2) + 
              Math.pow(cell.center.y - y, 2)
            );
            if (dist < 30) { // Within reasonable distance of center
              onSquareClick(node);
              break;
            }
          }
        }
        
        setDraggedNode(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  return (
    <div className="hex-board-container">
      <svg 
        ref={svgRef}
        width="900" 
        height="900" 
        viewBox="0 0 900 900"
        className="hex-board"
      >
        {/* Dark background */}
        <rect width="900" height="900" fill="#191919" />
        
        {/* Render all squares */}
        {Array.from(cells.entries()).map(([node, cell]) => {
          const piece = state.pieces.get(node);
          const isSelected = state.selectedNode === node;
          const selectedPiece = state.selectedNode ? state.pieces.get(state.selectedNode) : null;
          const isCurrentPlayerPiece = selectedPiece?.player === state.currentPlayer;
          const isPossibleMove = state.possibleMoves.includes(node) && isCurrentPlayerPiece;
          const isGrayMove = state.possibleMoves.includes(node) && !isCurrentPlayerPiece;
          const isDragging = draggedNode === node;
          
          return (
            <HexSquare
              key={node}
              node={node}
              cell={cell}
              piece={!isDragging ? piece : undefined}
              isSelected={isSelected}
              isPossibleMove={isPossibleMove}
              isGrayMove={isGrayMove}
              onClick={() => onSquareClick(node)}
              onMouseDown={(e) => handleDragStart(node, e)}
            />
          );
        })}
        
        {/* Dragged piece */}
        {draggedNode && state.pieces.get(draggedNode) && (
          <DraggedPiece 
            piece={state.pieces.get(draggedNode)!}
            x={dragPosition.x}
            y={dragPosition.y}
          />
        )}
      </svg>
    </div>
  );
};

export default HexBoard;