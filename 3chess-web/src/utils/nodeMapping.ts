// EXACT PORT OF unified_chess.py node mapping with rotations

export function createNodeMapping(): Map<string, [number, number]> {
  const mapping = new Map<string, [number, number]>();
  
  // Sextant 1 (bottom-left): A-D ranks 1-4 - NO ROTATION
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'ABCD'[fileIdx];
    for (let rank = 1; rank <= 4; rank++) {
      const x = fileIdx;  // 0-3
      const y = rank - 1;  // 0-3
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 2 (left): A-D ranks 5-8 - FIXED WITH 180° ROTATION
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'ABCD'[fileIdx];
    for (let rank = 5; rank <= 8; rank++) {
      const x = 3 - (rank - 5);  // 3-0
      const y = fileIdx + 4;     // 4-7
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 3 (top-left): I-L ranks 5-8 - ROTATE 180°
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'IJKL'[fileIdx];
    for (let rank = 5; rank <= 8; rank++) {
      const x = 3 - fileIdx + 8;   // 11-8
      const y = 3 - (rank - 5) + 4; // 7-4
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 4 (top-right): I-L ranks 9-12 - ROTATE 90° CW + FLIP VERTICAL
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'IJKL'[fileIdx];
    for (let rank = 9; rank <= 12; rank++) {
      const x = 3 - (rank - 9) + 8;  // 11-8
      const y = 3 - fileIdx + 8;     // 11-8
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 5 (right): E-H ranks 9-12 - ROTATE 180°
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'EFGH'[fileIdx];
    for (let rank = 9; rank <= 12; rank++) {
      const x = 3 - fileIdx + 4;     // 7-4
      const y = 3 - (rank - 9) + 8;  // 11-8
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  // Sextant 6 (bottom-right): E-H ranks 1-4 - FIXED WITH 180° ROTATION
  for (let fileIdx = 0; fileIdx < 4; fileIdx++) {
    const file = 'EFGH'[fileIdx];
    for (let rank = 1; rank <= 4; rank++) {
      const x = rank - 1 + 4;  // 4-7
      const y = 3 - fileIdx;    // 3-0
      mapping.set(`${file}${rank}`, [x, y]);
    }
  }
  
  return mapping;
}