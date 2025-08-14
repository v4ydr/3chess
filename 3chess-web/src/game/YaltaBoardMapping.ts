import type { Position } from '../types';

// The Yalta board consists of three 4x8 sections stitched together
// We need to map how pieces transition between sections

export class YaltaBoardMapping {
  
  // Map logical board sections to our 12x12 grid representation
  // White section: bottom (maps to grid positions)
  // Red left: left side
  // Red right: right side  
  // Black section: top
  // Center: where sections meet
  
  // Define the three sections in our 12x12 grid
  static readonly WHITE_SECTION = {
    // Main 4x4 area
    main: { minX: 0, maxX: 3, minY: 0, maxY: 3 },
    // Extensions into center
    extensions: [
      { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
      { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 },
    ]
  };
  
  static readonly RED_LEFT_SECTION = {
    // Main 4x4 area
    main: { minX: 0, maxX: 3, minY: 4, maxY: 7 },
    // Extensions
    extensions: [
      { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 },
    ]
  };
  
  static readonly RED_RIGHT_SECTION = {
    // Main 4x4 area
    main: { minX: 8, maxX: 11, minY: 4, maxY: 7 },
    // Extensions
    extensions: [
      { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 }, { x: 11, y: 3 },
    ]
  };
  
  static readonly BLACK_SECTION = {
    // Main 4x4 area
    main: { minX: 8, maxX: 11, minY: 8, maxY: 11 },
    // Extensions into center
    extensions: [
      { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 },
      { x: 6, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 },
    ]
  };
  
  static readonly CENTER = {
    minX: 4, maxX: 7, minY: 4, maxY: 7
  };
  
  // Get which section a position belongs to
  static getSection(pos: Position): string {
    // Check white section
    if ((pos.x <= 3 && pos.y <= 3) || 
        (pos.x <= 5 && pos.y <= 3)) {
      return 'white';
    }
    
    // Check black section  
    if ((pos.x >= 8 && pos.y >= 8) ||
        (pos.x >= 6 && pos.y >= 8)) {
      return 'black';
    }
    
    // Check red sections
    if (pos.x <= 3 && pos.y >= 4 && pos.y <= 8) {
      return 'red-left';
    }
    if (pos.x >= 8 && pos.y >= 3 && pos.y <= 7) {
      return 'red-right';
    }
    
    // Must be center
    return 'center';
  }
  
  // Get the next position when moving in a direction, handling section transitions
  static getNextPosition(from: Position, direction: Position): Position | null {
    const section = this.getSection(from);
    let next = { x: from.x + direction.x, y: from.y + direction.y };
    
    // Handle transitions between sections
    if (section === 'white' && next.y >= 4 && next.x <= 3) {
      // Moving from white to red-left
      return next;
    }
    if (section === 'white' && next.x >= 6) {
      // Moving from white toward black through center
      // Need to map the path correctly
      if (direction.x > 0 && direction.y === 0) {
        // Moving right - continue into black section
        if (from.y === 0) next = { x: 8, y: 8 };
        if (from.y === 1) next = { x: 8, y: 9 };
        if (from.y === 2) next = { x: 8, y: 10 };
        if (from.y === 3) next = { x: 8, y: 11 };
      }
    }
    
    if (section === 'black' && next.y <= 7 && next.x >= 8) {
      // Moving from black to red-right
      return next;
    }
    if (section === 'black' && next.x <= 5) {
      // Moving from black toward white through center
      if (direction.x < 0 && direction.y === 0) {
        // Moving left - continue into white section
        if (from.y === 8) next = { x: 3, y: 0 };
        if (from.y === 9) next = { x: 3, y: 1 };
        if (from.y === 10) next = { x: 3, y: 2 };
        if (from.y === 11) next = { x: 3, y: 3 };
      }
    }
    
    if (section === 'red-left' && next.x >= 4) {
      // Moving from red-left through center to red-right
      if (direction.x > 0 && direction.y === 0) {
        if (from.y === 4) next = { x: 8, y: 4 };
        if (from.y === 5) next = { x: 8, y: 5 };
        if (from.y === 6) next = { x: 8, y: 6 };
        if (from.y === 7) next = { x: 8, y: 7 };
      }
    }
    
    if (section === 'red-right' && next.x <= 7) {
      // Moving from red-right through center to red-left
      if (direction.x < 0 && direction.y === 0) {
        if (from.y === 4) next = { x: 3, y: 4 };
        if (from.y === 5) next = { x: 3, y: 5 };
        if (from.y === 6) next = { x: 3, y: 6 };
        if (from.y === 7) next = { x: 3, y: 7 };
      }
    }
    
    return next;
  }
  
  // Get a straight line path handling section transitions
  static getLinePath(from: Position, direction: Position, maxSteps: number = 12): Position[] {
    const path: Position[] = [];
    let current = from;
    
    for (let i = 0; i < maxSteps; i++) {
      const next = this.getNextPosition(current, direction);
      if (!next) break;
      
      // Check if position is valid (on the board)
      if (next.x < 0 || next.x >= 12 || next.y < 0 || next.y >= 12) break;
      
      path.push(next);
      current = next;
      
      // If we've transitioned sections, we might need to adjust direction
      // This handles the "bending" of paths through the center
      const currentSection = this.getSection(current);
      const prevSection = this.getSection(from);
      
      if (currentSection !== prevSection && currentSection !== 'center') {
        // We've transitioned through center to another section
        // Keep the logical direction but in the new section's coordinates
        break; // For now, stop at section boundaries to keep it simple
      }
    }
    
    return path;
  }
}