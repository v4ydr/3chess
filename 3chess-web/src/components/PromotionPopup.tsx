import React from 'react';
import { Player, PieceType } from '../types/game';
import './PromotionPopup.css';

interface PromotionPopupProps {
  player: Player;
  square: string;
  onPromote: (pieceType: PieceType) => void;
}

const PromotionPopup: React.FC<PromotionPopupProps> = ({ player, square, onPromote }) => {
  
  const getPieceSymbol = (type: PieceType): string => {
    const symbols = {
      [PieceType.QUEEN]: player === Player.WHITE ? '♛' : player === Player.RED ? '♛' : '♛',
      [PieceType.ROOK]: player === Player.WHITE ? '♜' : player === Player.RED ? '♜' : '♜',
      [PieceType.BISHOP]: player === Player.WHITE ? '♝' : player === Player.RED ? '♝' : '♝',
      [PieceType.KNIGHT]: player === Player.WHITE ? '♞' : player === Player.RED ? '♞' : '♞',
    };
    return symbols[type] || '';
  };

  const promotionOptions = [
    PieceType.QUEEN,
    PieceType.KNIGHT,
    PieceType.ROOK,
    PieceType.BISHOP
  ];

  return (
    <div className="promotion-popup">
      {promotionOptions.map(type => (
        <button
          key={type}
          className={`promotion-option ${player}`}
          onClick={() => onPromote(type)}
        >
          {getPieceSymbol(type)}
        </button>
      ))}
    </div>
  );
};

export default PromotionPopup;