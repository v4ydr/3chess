import React from 'react';
import { Player, PieceType } from '../types/game';
import type { Move } from '../types/game';
import './MoveHistory.css';

interface MoveHistoryProps {
  moves: Move[];
  currentPlayer: Player;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, currentPlayer }) => {
  const getPieceSymbol = (type: PieceType): string => {
    switch (type) {
      case PieceType.KING: return '♚';
      case PieceType.QUEEN: return '♛';
      case PieceType.ROOK: return '♜';
      case PieceType.BISHOP: return '♝';
      case PieceType.KNIGHT: return '♞';
      case PieceType.PAWN: return '♟';
      default: return '';
    }
  };

  const getPlayerColor = (player: Player): string => {
    switch (player) {
      case Player.RED: return '#d61539';
      case Player.WHITE: return '#ffffff';
      case Player.BLACK: return '#1a1a1a';
      default: return '#000';
    }
  };

  const formatMove = (move: Move | undefined): string => {
    if (!move) return '';
    const piece = getPieceSymbol(move.piece);
    const capture = move.captured ? 'x' : '-';
    return `${piece} ${move.from}${capture}${move.to}`;
  };

  // Group moves by move number (every 3 moves is one complete turn)
  const groupedMoves: (Move | undefined)[][] = [];
  let currentGroup: (Move | undefined)[] = [undefined, undefined, undefined];
  let moveCount = 0;
  
  for (const move of moves) {
    // Place move in correct position based on player
    if (move.player === Player.RED) {
      currentGroup[0] = move;
    } else if (move.player === Player.WHITE) {
      currentGroup[1] = move;
    } else if (move.player === Player.BLACK) {
      currentGroup[2] = move;
    }
    
    moveCount++;
    
    // After every 3 moves, start a new group
    if (moveCount % 3 === 0) {
      groupedMoves.push([...currentGroup]);
      currentGroup = [undefined, undefined, undefined];
    }
  }
  
  // Add the last incomplete group if it has any moves
  if (moveCount % 3 !== 0) {
    groupedMoves.push(currentGroup);
  }

  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="move-history-header">
        <div className={`header-cell ${currentPlayer === Player.RED ? 'active-player' : ''}`} 
             style={{ color: getPlayerColor(Player.RED) }}>♚</div>
        <div className={`header-cell ${currentPlayer === Player.WHITE ? 'active-player' : ''}`}
             style={{ color: getPlayerColor(Player.WHITE) }}>♚</div>
        <div className={`header-cell ${currentPlayer === Player.BLACK ? 'active-player' : ''}`}
             style={{ color: getPlayerColor(Player.BLACK) }}>♚</div>
      </div>
      <div className="move-history-scroll">
        {groupedMoves.map((group, index) => (
          <div key={index} className="move-row">
            <div className="move-number">{index + 1}.</div>
            <div className="move-cells-container">
              <div className="move-cell">
                {group[0] && (
                  <span className="move-text">
                    <span className="piece-icon" style={{ 
                      color: getPlayerColor(Player.RED),
                      WebkitTextStrokeColor: '#808080'
                    }}>
                      {getPieceSymbol(group[0].piece)}
                    </span>
                    <span className="move-notation">
                      {group[0].from} {group[0].captured ? '×' : '→'} {group[0].to}
                    </span>
                  </span>
                )}
              </div>
              <div className="move-cell">
                {group[1] && (
                  <span className="move-text">
                    <span className="piece-icon" style={{ 
                      color: getPlayerColor(Player.WHITE),
                      WebkitTextStrokeColor: '#000000'
                    }}>
                      {getPieceSymbol(group[1].piece)}
                    </span>
                    <span className="move-notation">
                      {group[1].from} {group[1].captured ? '×' : '→'} {group[1].to}
                    </span>
                  </span>
                )}
              </div>
              <div className="move-cell">
                {group[2] && (
                  <span className="move-text">
                    <span className="piece-icon" style={{ 
                      color: getPlayerColor(Player.BLACK),
                      WebkitTextStrokeColor: '#FFFFFF'
                    }}>
                      {getPieceSymbol(group[2].piece)}
                    </span>
                    <span className="move-notation">
                      {group[2].from} {group[2].captured ? '×' : '→'} {group[2].to}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveHistory;