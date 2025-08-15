import React from 'react';
import type { Piece } from '../types/game';
import PieceComponent from './Piece';
import './Square.css';

interface SquareProps {
  node: string;
  piece?: Piece;
  isSelected: boolean;
  isPossibleMove: boolean;
  isDark: boolean;
  position: { x: number; y: number };
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({
  node,
  piece,
  isSelected,
  isPossibleMove,
  isDark,
  position,
  onClick,
}) => {
  const classNames = [
    'square',
    isDark ? 'dark' : 'light',
    isSelected ? 'selected' : '',
    isPossibleMove ? 'possible-move' : '',
  ].filter(Boolean).join(' ');
  
  return (
    <div
      className={classNames}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={onClick}
      data-node={node}
    >
      {piece && <PieceComponent piece={piece} />}
      {isPossibleMove && <div className="move-indicator" />}
    </div>
  );
};

export default Square;