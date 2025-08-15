import React, { useState } from 'react';
import HexBoard from './components/HexBoard';
import MoveHistory from './components/MoveHistory';
import { GameEngine } from './engine/gameEngine';
import { Player } from './types/game';
import './App.css';

function App() {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState(() => gameEngine.getState());
  
  const handleSquareClick = (node: string) => {
    gameEngine.selectNode(node);
    setGameState({ ...gameEngine.getState() });
  };
  
  const getPlayerName = (player: Player): string => {
    switch (player) {
      case Player.RED:
        return 'Red';
      case Player.WHITE:
        return 'White';
      case Player.BLACK:
        return 'Black';
      default:
        return '';
    }
  };
  
  const getPlayerColor = (player: Player): string => {
    switch (player) {
      case Player.RED:
        return '#d61539';
      case Player.WHITE:
        return '#808080';
      case Player.BLACK:
        return '#1a1a1a';
      default:
        return '#000';
    }
  };
  
  return (
    <div className="app">
      <div className="game-container">
        <HexBoard 
          state={gameState} 
          onSquareClick={handleSquareClick}
        />
        <div className="sidebar">
          <h2>3Chess</h2>
          <div className="turn-indicator">
            <h3>Current Turn</h3>
            <div 
              className="current-player"
              style={{ color: getPlayerColor(gameState.currentPlayer) }}
            >
              {getPlayerName(gameState.currentPlayer)}
            </div>
          </div>
          <MoveHistory moves={gameState.moveHistory} />
        </div>
      </div>
    </div>
  );
}

export default App
