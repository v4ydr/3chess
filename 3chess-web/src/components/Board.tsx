import React from 'react';
import type { BoardState } from '../types/game';
import Square from './Square';
import './Board.css';

interface BoardProps {
  state: BoardState;
  onSquareClick: (node: string) => void;
}

// Node to hexagon coordinate mapping (matching Python version)
const createNodeMapping = (): Map<string, [number, number]> => {
  const mapping = new Map<string, [number, number]>();
  
  // Sextant 1 (bottom-left): A-D ranks 1-4
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'ABCD'[fileIdx];
    for (let rank = 1; rank <= 4; rank++) {
      mapping.set(`${file}${rank}`, [fileIdx, rank - 1]);
    }
  }
  
  // Sextant 2 (left): A-D ranks 5-8 - ROTATE 180° from Python fix
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'ABCD'[fileIdx];
    for (let rank = 5; rank <= 8; rank++) {
      const x = 3 - (rank - 5);
      const y = fileIdx + 4;
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 3 (top-left): I-L ranks 5-8 - ROTATE 180°
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'IJKL'[fileIdx];
    for (let rank = 5; rank <= 8; rank++) {
      const x = 3 - fileIdx + 8;
      const y = 3 - (rank - 5) + 4;
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 4 (top-right): I-L ranks 9-12 - ROTATE 90° CW + FLIP VERTICAL
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'IJKL'[fileIdx];
    for (let rank = 9; rank <= 12; rank++) {
      const x = 3 - (rank - 9) + 8;
      const y = 3 - fileIdx + 8;
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 5 (right): E-H ranks 9-12 - ROTATE 180°
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'EFGH'[fileIdx];
    for (let rank = 9; rank <= 12; rank++) {
      const x = 3 - fileIdx + 4;
      const y = 3 - (rank - 9) + 8;
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 6 (bottom-right): E-H ranks 1-4 - ROTATE 180° from Python fix
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'EFGH'[fileIdx];
    for (let rank = 1; rank <= 4; rank++) {
      const x = rank - 1 + 4;
      const y = 3 - fileIdx;
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  return mapping;
};

const Board: React.FC<BoardProps> = ({ state, onSquareClick }) => {
  const nodeMapping = React.useMemo(() => createNodeMapping(), []);
  
  // Calculate hexagon positions for CSS
  const getHexPosition = (gridX: number, gridY: number) => {
    // Hexagon positioning logic
    const size = 60; // Size of hexagon
    const width = size * 2;
    const height = Math.sqrt(3) * size;
    
    // Calculate position based on grid coordinates
    const x = gridX * width * 0.75;
    const y = gridY * height + (gridX % 2 ? height / 2 : 0);
    
    return { x, y };
  };
  
  // Create squares for all nodes
  const squares = Array.from(nodeMapping.entries()).map(([node, [gridX, gridY]]) => {
    const piece = state.pieces.get(node);
    const isSelected = state.selectedNode === node;
    const isPossibleMove = state.possibleMoves.includes(node);
    const position = getHexPosition(gridX, gridY);
    
    // Determine if square is dark or light based on coordinates
    const isDark = ((gridX + gridY) % 2) === 0;
    
    return (
      <Square
        key={node}
        node={node}
        piece={piece}
        isSelected={isSelected}
        isPossibleMove={isPossibleMove}
        isDark={isDark}
        position={position}
        onClick={() => onSquareClick(node)}
      />
    );
  });
  
  return (
    <div className="board-container">
      <div className="board">
        {squares}
      </div>
    </div>
  );
};

export default Board;