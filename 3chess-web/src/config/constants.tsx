// Centralized configuration for all constants used throughout the application

// SVG and Board Dimensions
export const BOARD_SIZE = 900;
export const BOARD_VIEWBOX = `0 0 ${BOARD_SIZE} ${BOARD_SIZE}`;

// Colors - Board
export const COLORS = {
  board: {
    darkSquare: '#769656',  // Forest green
    lightSquare: '#EEEED2', // Beige
    background: '#aaa',     // Gray background
    darkSquareText: '#EEEED2',
    lightSquareText: '#769656',
    darkSquareEdge: '#14321900', // Transparent edge
    lightSquareEdge: '#C8B88B00', // Transparent edge
  },
  
  // Colors - Players
  players: {
    red: {
      piece: '#D61539',
      pieceStroke: '#808080',
      moveIndicator: 'rgba(214, 100, 120, 0.5)',
    },
    white: {
      piece: '#F0F0F0',
      pieceStroke: '#000000',
      moveIndicator: 'rgba(200, 200, 200, 0.5)',
    },
    black: {
      piece: '#0A0A0A',
      pieceStroke: '#FFFFFF',
      moveIndicator: 'rgba(80, 80, 80, 0.5)',
    },
    eliminated: {
      piece: '#808080',
      pieceStroke: '#404040',
      opacity: 0.6,
    }
  },
  
  // Colors - UI Elements
  ui: {
    sidebar: '#555',
    sidebarBorder: '#555',
    titleGold: '#ffd700',
    selectionHighlight: '#FFFF00',
    selectionHighlightOpacity: 0.4,
    dragHoverStroke: 'rgba(200, 200, 200, 0.8)',
    defaultMoveIndicator: 'rgba(180, 180, 180, 0.5)',
  }
};

// Sizes and Dimensions
export const SIZES = {
  // Board
  boardWidth: 900,
  boardHeight: 900,
  
  // Sidebar
  sidebarWidth: 500,
  sidebarPadding: 30,
  
  // Pieces
  pieceFontSize: 60,
  pieceStrokeWidth: 1,
  pieceOffsetY: 18,
  
  // Square labels
  squareLabelFontSize: 18,
  squareLabelOffsetY: 5,
  squareLabelOpacityHover: 0.8,
  squareLabelOpacityNormal: 0.3,
  
  // Move indicators
  moveIndicatorRadius: 12,      // Empty square dot
  captureIndicatorRadius: 28,   // Capture ring
  captureIndicatorStrokeWidth: 5,
  previewMoveLineOffset: 8,     // X mark offset for empty squares
  previewMoveLineOffsetPiece: 15, // X mark offset for pieces
  previewMoveStrokeWidth: 4,
  
  // Drag and drop
  dragHoverStrokeWidth: 6,
  dragHoverInsetScale: 0.97,    // Scale for inner border
  dragDetectionRadius: 30,      // Distance to detect drop target
  draggedPieceShadow: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
  
  // Animations
  transitionDuration: '0.2s',
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontWeightBold: 'bold',
  
  // Title
  titleSize: '2.5rem',
  titleShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  
  // Move history
  moveHistoryHeader: '1rem',
  eliminatedPlayerSize: '1.1rem',
};

// Layout
export const LAYOUT = {
  sidebarPosition: {
    position: 'fixed' as const,
    right: 0,
    top: 0,
  },
  
  hexBoardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flex: 1,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
  },
  
  moveHistoryGap: 20,
  moveHistoryPadding: {
    row: 0,
    cells: '0.1rem',
  },
};

// Game Constants
export const GAME = {
  boardFiles: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
  boardRanks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  
  // Board sections
  sections: {
    bottom: { minRank: 1, maxRank: 4 },  // Red's starting area
    middle: { minRank: 5, maxRank: 8 },  // Transition area
    top: { minRank: 9, maxRank: 12 },    // Black's starting area
  },
  
  // Transition ranks
  transitions: {
    bottomToMiddle: 4,
    middleToBottom: 5,
    middleToTop: 8,
    topToMiddle: 9,
  },
  
  // File groups
  fileGroups: {
    leftMiddle: ['A', 'B', 'C', 'D'],
    rightMiddle: ['I', 'J', 'K', 'L'],
    bottom: ['E', 'F', 'G', 'H'],
    allBottom: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  },
  
  // Starting positions
  startingRanks: {
    red: { pieces: 1, pawns: 2 },
    white: { pieces: 8, pawns: 7 },
    black: { pieces: 12, pawns: 11 },
  },
  
  // Promotion squares
  promotionRanks: {
    red: [8, 12],
    white: [1, 12],
    black: [1, 8],
  },
  promotionFiles: {
    red: ['L'],
    white: ['H'],
    black: ['A'],
  },
};

// Piece Symbols
export const PIECE_SYMBOLS = {
  KING: '♚',
  QUEEN: '♛',
  ROOK: '♜',
  BISHOP: '♝',
  KNIGHT: '♞',
  PAWN: '♟',
};

// Helper functions to get colors based on player
import { Player, PieceType } from '../types/game';

export const getPlayerColor = (player: Player): string => {
  switch (player) {
    case Player.RED:
      return COLORS.players.red.piece;
    case Player.WHITE:
      return COLORS.players.white.piece;
    case Player.BLACK:
      return COLORS.players.black.piece;
    default:
      return '#000';
  }
};

export const getPlayerStrokeColor = (player: Player): string => {
  switch (player) {
    case Player.RED:
      return COLORS.players.red.pieceStroke;
    case Player.WHITE:
      return COLORS.players.white.pieceStroke;
    case Player.BLACK:
      return COLORS.players.black.pieceStroke;
    default:
      return '#000';
  }
};

export const getMoveIndicatorColor = (player?: Player): string => {
  if (!player) return COLORS.ui.defaultMoveIndicator;
  
  switch (player) {
    case Player.RED:
      return COLORS.players.red.moveIndicator;
    case Player.WHITE:
      return COLORS.players.white.moveIndicator;
    case Player.BLACK:
      return COLORS.players.black.moveIndicator;
    default:
      return COLORS.ui.defaultMoveIndicator;
  }
};

// Map PieceType enum to symbols
export const pieceSymbols: Record<PieceType, string> = {
  [PieceType.KING]: PIECE_SYMBOLS.KING,
  [PieceType.QUEEN]: PIECE_SYMBOLS.QUEEN,
  [PieceType.ROOK]: PIECE_SYMBOLS.ROOK,
  [PieceType.BISHOP]: PIECE_SYMBOLS.BISHOP,
  [PieceType.KNIGHT]: PIECE_SYMBOLS.KNIGHT,
  [PieceType.PAWN]: PIECE_SYMBOLS.PAWN,
};