import React from 'react';
import type { Piece } from '../types/game';
import { Player, PieceType } from '../types/game';
import './Piece.css';

interface PieceProps {
  piece: Piece;
}

const pieceSymbols: Record<PieceType, string> = {
  [PieceType.KING]: '♔',
  [PieceType.QUEEN]: '♕',
  [PieceType.ROOK]: '♖',
  [PieceType.BISHOP]: '♗',
  [PieceType.KNIGHT]: '♘',
  [PieceType.PAWN]: '♙',
};

const PieceComponent: React.FC<PieceProps> = ({ piece }) => {
  const symbol = pieceSymbols[piece.type];
  const className = `piece ${piece.player}`;
  
  return (
    <div className={className}>
      {symbol}
    </div>
  );
};

export default PieceComponent;