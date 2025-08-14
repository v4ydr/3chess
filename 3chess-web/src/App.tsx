import { useState, useCallback } from 'react';
import './App.css';
import { HexBoardComponent } from './components/HexBoard';
import { HexBoard, HexSquare } from './game/HexBoard';
import { Player } from './types';

const PLAYER_NAMES = {
  [Player.White]: 'White',
  [Player.Red]: 'Red',
  [Player.Black]: 'Black',
};

const PLAYER_COLORS = {
  [Player.White]: '#FFFFFF',
  [Player.Red]: '#D61541',
  [Player.Black]: '#000000',
};

function App() {
  const [board] = useState(() => new HexBoard());
  const [currentPlayer, setCurrentPlayer] = useState(Player.White);
  const [gameKey, setGameKey] = useState(0);

  const handleMove = useCallback((from: HexSquare, to: HexSquare) => {
    // For now, just move the piece without validation
    if (from.piece && from.piece.player === currentPlayer) {
      to.piece = from.piece;
      from.piece = null;
      
      // Advance turn
      setCurrentPlayer((currentPlayer + 1) % 3 as Player);
      setGameKey(prev => prev + 1);
    }
  }, [currentPlayer]);

  const handleReset = useCallback(() => {
    // Reset the board
    board.constructor.call(board);
    setCurrentPlayer(Player.White);
    setGameKey(prev => prev + 1);
  }, [board]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Three Player Chess (Hexagonal Board)</h1>
        <div className="game-info">
          <h2 style={{ color: PLAYER_COLORS[currentPlayer] }}>
            {PLAYER_NAMES[currentPlayer]}'s Turn
          </h2>
        </div>
      </header>
      
      <main className="game-container">
        <HexBoardComponent 
          key={gameKey} 
          board={board} 
          currentPlayer={currentPlayer}
          onMove={handleMove} 
        />
        
        <div className="controls">
          <button onClick={handleReset} className="control-btn">
            Reset Game
          </button>
        </div>
        
        <div className="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Click a piece to select it</li>
            <li>Click another square to move</li>
            <li>Three players take turns: White → Red → Black</li>
            <li>Board uses hexagonal layout with A-L columns and 1-12 rows</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App