import React, { useMemo } from 'react';
import type { BoardState, Piece } from '../types/game';
import { Cell } from '../utils/hexMath';
import { createNodeMapping } from '../utils/nodeMapping';
import HexSquare from './HexSquare';
import './HexBoard.css';

interface HexBoardProps {
  state: BoardState;
  onSquareClick: (node: string) => void;
}

const HexBoard: React.FC<HexBoardProps> = ({ state, onSquareClick }) => {
  const nodeMapping = useMemo(() => createNodeMapping(), []);
  
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
  
  return (
    <div className="hex-board-container">
      <svg 
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
          
          return (
            <HexSquare
              key={node}
              node={node}
              cell={cell}
              piece={piece}
              isSelected={isSelected}
              isPossibleMove={isPossibleMove}
              isGrayMove={isGrayMove}
              onClick={() => onSquareClick(node)}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default HexBoard;