import React, { useState } from 'react';
import HexBoard from './components/HexBoard';
import MoveHistory from './components/MoveHistory';
import PromotionPopup from './components/PromotionPopup';
import { GameEngine } from './engine/gameEngine';
import { Player, PieceType } from './types/game';
import './App.css';

function App() {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState(() => gameEngine.getState());
  
  const handleSquareClick = (node: string, isDebugMode: boolean = false) => {
    if (isDebugMode) {
      gameEngine.selectNodeDebug(node);
    } else {
      gameEngine.selectNode(node);
    }
    setGameState({ ...gameEngine.getState() });
  };
  
  const handlePromotion = (pieceType: PieceType) => {
    gameEngine.promotePawn(pieceType);
    setGameState({ ...gameEngine.getState() });
  };
  
  
  return (
    <div className="app">
      <div className="game-container">
        <HexBoard 
          state={gameState} 
          onSquareClick={handleSquareClick}
        />
        <div className="sidebar">
          <h2>CH3SS</h2>
          <MoveHistory moves={gameState.moveHistory} currentPlayer={gameState.currentPlayer} />
        </div>
      </div>
      {gameState.promotionPending && (
        <PromotionPopup 
          player={gameState.promotionPending.player}
          square={gameState.promotionPending.to}
          onPromote={handlePromotion}
        />
      )}
    </div>
  );
}

export default App
