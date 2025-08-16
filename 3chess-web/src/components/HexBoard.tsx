import React, { useMemo, useState, useRef } from 'react';
import type { BoardState, Piece } from '../types/game';
import { Cell } from '../utils/hexMath';
import { createNodeMapping } from '../utils/nodeMapping';
import HexSquare from './HexSquare';
import './HexBoard.css';
import { 
  BOARD_SIZE, 
  BOARD_VIEWBOX, 
  COLORS, 
  SIZES, 
  pieceSymbols,
  getPlayerColor,
  getPlayerStrokeColor 
} from '../config/constants';


const DraggedPiece: React.FC<{ piece: Piece; x: number; y: number }> = ({ piece, x, y }) => (
  <text
    x={x}
    y={y + SIZES.pieceOffsetY}
    fontSize={SIZES.pieceFontSize}
    fontWeight="bold"
    textAnchor="middle"
    fill={getPlayerColor(piece.player)}
    stroke={getPlayerStrokeColor(piece.player)}
    strokeWidth={SIZES.pieceStrokeWidth}
    style={{ 
      userSelect: 'none', 
      pointerEvents: 'none',
      filter: SIZES.draggedPieceShadow
    }}
  >
    {pieceSymbols[piece.type]}
  </text>
);

interface HexBoardProps {
  state: BoardState;
  onSquareClick: (node: string, isDebugMode?: boolean) => void;
}

const HexBoard: React.FC<HexBoardProps> = ({ state, onSquareClick }) => {
  const nodeMapping = useMemo(() => createNodeMapping(), []);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
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
  
  const handleClick = (node: string, event: React.MouseEvent) => {
    // Don't handle click if we're dragging
    if (!isDraggingRef.current) {
      onSquareClick(node, event.shiftKey);
    }
  };

  const handleDragStart = (node: string, event: React.MouseEvent) => {
    // Don't start drag in debug mode - just use clicks
    if (event.shiftKey) {
      return;
    }
    
    const piece = state.pieces.get(node);
    
    // Only allow current player's pieces to drag in normal mode
    if (piece && piece.player === state.currentPlayer) {
      event.preventDefault();
      event.stopPropagation();
      
      // Mark that we're starting a drag
      isDraggingRef.current = true;
      
      // Get initial mouse position
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const initialX = ((event.clientX - rect.left) / rect.width) * BOARD_SIZE;
        const initialY = ((event.clientY - rect.top) / rect.height) * BOARD_SIZE;
        
        // Set initial drag position to current mouse position
        setDragPosition({ x: initialX, y: initialY });
        setDraggedNode(node);
        
        // Select the piece to show valid moves
        onSquareClick(node, false);
      }
      
      // Track mouse position for dragging
      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * BOARD_SIZE;
          const y = ((e.clientY - rect.top) / rect.height) * BOARD_SIZE;
          setDragPosition({ x, y });
          
          // Find which square we're hovering over
          let foundHover = false;
          for (const [hoverNode, cell] of cells.entries()) {
            const dist = Math.sqrt(
              Math.pow(cell.center.x - x, 2) + 
              Math.pow(cell.center.y - y, 2)
            );
            if (dist < SIZES.dragDetectionRadius) { // Within reasonable distance of center
              setHoveredSquare(hoverNode);
              foundHover = true;
              break;
            }
          }
          if (!foundHover) {
            setHoveredSquare(null);
          }
        }
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * BOARD_SIZE;
          const y = ((e.clientY - rect.top) / rect.height) * BOARD_SIZE;
          
          // Find which square was dropped on
          for (const [dropNode, cell] of cells.entries()) {
            const dist = Math.sqrt(
              Math.pow(cell.center.x - x, 2) + 
              Math.pow(cell.center.y - y, 2)
            );
            if (dist < SIZES.dragDetectionRadius) { // Within reasonable distance of center
              // Normal drag - never in debug mode
              onSquareClick(dropNode, false);
              break;
            }
          }
        }
        
        setDraggedNode(null);
        setHoveredSquare(null);
        isDraggingRef.current = false;
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
        width={BOARD_SIZE} 
        height={BOARD_SIZE} 
        viewBox={BOARD_VIEWBOX}
        className="hex-board"
      >
        {/* Dark background */}
        <rect width={BOARD_SIZE} height={BOARD_SIZE} fill={COLORS.board.background} />
        
        {/* Render all squares */}
        {Array.from(cells.entries()).map(([node, cell]) => {
          const piece = state.pieces.get(node);
          const isSelected = state.selectedNode === node;
          const selectedPiece = state.selectedNode ? state.pieces.get(state.selectedNode) : null;
          const isCurrentPlayerPiece = selectedPiece?.player === state.currentPlayer;
          const isPossibleMove = state.possibleMoves.includes(node) && isCurrentPlayerPiece;
          const isGrayMove = state.possibleMoves.includes(node) && !isCurrentPlayerPiece;
          const isDragging = draggedNode === node;
          const isLastMoveSquare = node === state.lastMoveFrom || node === state.lastMoveTo;
          
          return (
            <HexSquare
              key={node}
              node={node}
              cell={cell}
              piece={!isDragging ? piece : undefined}
              isSelected={isSelected}
              isPossibleMove={isPossibleMove}
              isGrayMove={isGrayMove}
              isLastMove={isLastMoveSquare}
              selectedPiecePlayer={selectedPiece?.player}
              isDragHovered={draggedNode !== null && hoveredSquare === node}
              onClick={(e) => handleClick(node, e)}
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