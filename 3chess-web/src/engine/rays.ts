import { ChessGraph } from './graph';
import { EdgeType } from '../types/game';

export class RaySystem {
  private graph: ChessGraph;
  private bishopRays: Map<string, string[][]> = new Map();
  private rookRays: Map<string, string[][]> = new Map();
  private knightMoves: Map<string, string[]> = new Map();
  
  constructor(graph: ChessGraph) {
    this.graph = graph;
    this.initializeBishopRays();
    this.calculateRookRays();
    this.calculateKnightMoves();
  }
  
  private calculateRookRays() {
    // For each node, calculate rays along ranks and files
    for (const node of this.graph.getNodes()) {
      const rays: string[][] = [];
      
      // Get rank and file neighbors
      const neighbors = [
        ...this.graph.getNeighbors(node, EdgeType.RANK),
        ...this.graph.getNeighbors(node, EdgeType.FILE)
      ];
      
      // For each neighbor, follow that direction as far as possible
      for (const firstNeighbor of neighbors) {
        const ray: string[] = [];
        let current = firstNeighbor;
        const visited = new Set<string>([node]);
        
        // Determine the edge type between node and firstNeighbor
        const edgeType = this.graph.getNeighbors(node, EdgeType.RANK).includes(firstNeighbor)
          ? EdgeType.RANK
          : EdgeType.FILE;
        
        while (current && !visited.has(current)) {
          ray.push(current);
          visited.add(current);
          
          // Find next node in same direction
          const nextNodes = this.graph.getNeighbors(current, edgeType)
            .filter(n => !visited.has(n));
          
          current = nextNodes[0] || null;
        }
        
        if (ray.length > 0) {
          rays.push(ray);
        }
      }
      
      this.rookRays.set(node, rays);
    }
  }
  
  private calculateKnightMoves() {
    // Knight moves: 2 squares in one direction, 1 in perpendicular
    for (const node of this.graph.getNodes()) {
      const moves = new Set<string>();
      
      // Pattern 1: 2 steps rank/file, then 1 step perpendicular
      const rankNeighbors = this.graph.getNeighbors(node, EdgeType.RANK);
      const fileNeighbors = this.graph.getNeighbors(node, EdgeType.FILE);
      
      // 2 steps along rank
      for (const rank1 of rankNeighbors) {
        const rank2Neighbors = this.graph.getNeighbors(rank1, EdgeType.RANK)
          .filter(n => n !== node);
        
        for (const rank2 of rank2Neighbors) {
          // 1 step along file from rank2
          const fileFromRank2 = this.graph.getNeighbors(rank2, EdgeType.FILE)
            .filter(n => n !== rank1);
          fileFromRank2.forEach(n => moves.add(n));
        }
      }
      
      // 2 steps along file
      for (const file1 of fileNeighbors) {
        const file2Neighbors = this.graph.getNeighbors(file1, EdgeType.FILE)
          .filter(n => n !== node);
        
        for (const file2 of file2Neighbors) {
          // 1 step along rank from file2
          const rankFromFile2 = this.graph.getNeighbors(file2, EdgeType.RANK)
            .filter(n => n !== file1);
          rankFromFile2.forEach(n => moves.add(n));
        }
      }
      
      // Pattern 2: 1 step rank/file, then 2 steps perpendicular
      for (const rank1 of rankNeighbors) {
        // 2 steps along file from rank1
        const file1FromRank = this.graph.getNeighbors(rank1, EdgeType.FILE)
          .filter(n => n !== node);
        
        for (const file1 of file1FromRank) {
          const file2FromFile1 = this.graph.getNeighbors(file1, EdgeType.FILE)
            .filter(n => n !== rank1);
          file2FromFile1.forEach(n => moves.add(n));
        }
      }
      
      for (const file1 of fileNeighbors) {
        // 2 steps along rank from file1
        const rank1FromFile = this.graph.getNeighbors(file1, EdgeType.RANK)
          .filter(n => n !== node);
        
        for (const rank1 of rank1FromFile) {
          const rank2FromRank1 = this.graph.getNeighbors(rank1, EdgeType.RANK)
            .filter(n => n !== file1);
          rank2FromRank1.forEach(n => moves.add(n));
        }
      }
      
      this.knightMoves.set(node, Array.from(moves));
    }
  }
  
  private initializeBishopRays() {
    // Initialize the full bishop ray dictionary from the Python version
    // This is the ground truth from me.py
    const rays: { [key: string]: string[][] } = {
      'A1': [['B2', 'C3', 'D4', 'E9', 'F10', 'G11', 'H12'], ['B2', 'C3', 'D4', 'I5', 'J6', 'K7', 'L8']],
      'A2': [['B1'], ['B3', 'C4', 'D5', 'I6', 'J7', 'K8']],
      'A3': [['B2', 'C1'], ['B4', 'C5', 'D6', 'I7', 'J8']],
      'A4': [['B3', 'C2', 'D1'], ['B5', 'C6', 'D7', 'I8']],
      'A5': [['B4', 'C3', 'D2', 'E1'], ['B6', 'C7', 'D8']],
      'A6': [['B5', 'C4', 'D3', 'E2', 'F1'], ['B7', 'C8']],
      'A7': [['B6', 'C5', 'D4', 'E3', 'F2', 'G1'], ['B8']],
      'A8': [['B7', 'C6', 'D5', 'E4', 'F3', 'G2', 'H1'], ['B7', 'C6', 'D5', 'I9', 'J10', 'K11', 'L12']],
      'B1': [['A2'], ['C2', 'D3', 'E4', 'F9', 'G10', 'H11']],
      'B2': [['A1'], ['A3'], ['C1'], ['C3', 'D4', 'E9', 'F10', 'G11', 'H12'], ['C3', 'D4', 'I5', 'J6', 'K7', 'L8']],
      'B3': [['A2'], ['A4'], ['C2', 'D1'], ['C4', 'D5', 'I6', 'J7', 'K8']],
      'B4': [['A3'], ['A5'], ['C3', 'D2', 'E1'], ['C5', 'D6', 'I7', 'J8']],
      'B5': [['A4'], ['A6'], ['C4','D3','E2','F1'], ['C6','D7','I8']],
      'B6': [['A5'], ['A7'], ['C5','D4','E3','F2','G1'], ['C7','D8']],
      'B7': [['A6'], ['A8'], ['C8'], ['C6', 'D5', 'E4', 'F3', 'G2', 'H1'], ['C6', 'D5', 'I9', 'J10', 'K11', 'L12']],
      'B8': [['A7'], ['C7', 'D6', 'I5', 'J9', 'K10', 'L11']],
      'C1': [['B2', 'A3'], ['D2', 'E3', 'F4', 'G9', 'H10']],
      'C2': [['B1'], ['D1'], ['B3', 'A4'], ['D3', 'E4', 'F9', 'G10', 'H11']],
      'C3': [['B2', 'A1'], ['B4', 'A5'], ['D2', 'E1'], ['D4', 'E9', 'F10', 'G11', 'H12'], ['D4', 'E9', 'I5', 'J6', 'K7', 'L8']],
      'C4': [['B3', 'A2'], ['B5', 'A6'], ['D3', 'E2', 'F1'], ['D5', 'I6', 'J7', 'K8']],
      'C5': [['B4', 'A3'], ['B6', 'A7'], ['D4', 'E3', 'F2', 'G1'], ['D6', 'I7', 'J8']],
      'C6': [['B5', 'A4'], ['B7', 'A8'], ['D5', 'E4', 'F3', 'G2', 'H1'], ['D7', 'I8']],
      'C7': [['B6', 'A5'], ['B8'], ['D8'], ['D6', 'I5', 'J9', 'K10', 'L11']],
      'C8': [['B7', 'A6'], ['D7', 'I6', 'J5', 'K9', 'L10']],
      'D1': [['C2', 'B3', 'A4'], ['E2', 'F3', 'G4', 'H9']],
      'D2': [['C1'], ['E1'], ['C3', 'B4', 'A5'], ['E3', 'F4', 'G9', 'H10']],
      'D3': [['C2', 'B1'], ['C4', 'B5', 'A6'], ['E2', 'F1'], ['E4', 'F9', 'G10', 'H11']],
      'D4': [['C3', 'B2', 'A1'], ['C5', 'B6', 'A7'], ['E3', 'F2', 'G1'], ['I5', 'J6', 'K7', 'L8'], ['E9', 'F10', 'G11', 'H12']],
      'D5': [['C4', 'B3', 'A2'], ['C6', 'B7', 'A8'], ['E4', 'F3', 'G2', 'H1'], ['I6', 'J7', 'K8'], ['I9', 'J10', 'K11', 'L12']],
      'D6': [['C5', 'B4', 'A3'], ['C7', 'B8'], ['I7', 'J8'], ['I5', 'J9', 'K10', 'L11']],
      'D7': [['C6', 'B5', 'A4'], ['C8'], ['I8'], ['I6', 'J5', 'K9', 'L10']],
      'D8': [['C7', 'B6', 'A5'], ['I7', 'J6', 'K5', 'L9']],
      'E1': [['D2', 'C3', 'B4', 'A5'], ['F2', 'G3', 'H4']],
      'E2': [['D1'], ['F1'], ['D3', 'C4', 'B5', 'A6'], ['F3', 'G4', 'H9']],
      'E3': [['D2', 'C1'], ['D4', 'C5', 'B6', 'A7'], ['F2', 'G1'], ['F4', 'G9', 'H10']],
      'E4': [['D3', 'C2', 'B1'], ['D5', 'C6', 'B7', 'A8'], ['F3', 'G2', 'H1'], ['F9', 'G10', 'H11'], ['I9', 'J10', 'K11', 'L12']],
      'E9': [['D4', 'C3', 'B2', 'A1'], ['F4', 'G3', 'H2'], ['F10', 'G11', 'H12'], ['I10', 'J11', 'K12'], ['I5', 'J6', 'K7', 'L8']],
      'E10': [['F9', 'G4', 'H3'], ['F11', 'G12'], ['I11', 'J12'], ['I9', 'J5', 'K6', 'L7']],
      'E11': [['I12'], ['F12'], ['F10', 'G9', 'H4'], ['I10', 'J9', 'K5', 'L6']],
      'E12': [['F11', 'G10', 'H9'], ['I11', 'J10', 'K9', 'L5']],
      'F1': [['E2', 'D3', 'C4', 'B5', 'A6'], ['G2', 'H3']],
      'F2': [['E1'], ['G1'], ['E3', 'D4', 'C5', 'B6', 'A7'], ['G3', 'H4']],
      'F3': [['E2', 'D1'], ['E4', 'D5', 'C6', 'B7', 'A8'], ['G2', 'H1'], ['G4', 'H9'], ['E4', 'I9', 'J10', 'K11', 'L12']],
      'F4': [['E3', 'D2', 'C1'], ['E9', 'I10', 'J11', 'K12'], ['G9', 'H10'], ['G3', 'H2']],
      'F9': [['E4', 'D3', 'C2', 'B1'], ['G4', 'H3'], ['G10', 'H11'], ['E10', 'I11', 'J12']],
      'F10': [['G9', 'H4'], ['G11', 'H12'], ['E11', 'I12'], ['E9', 'I5', 'J6', 'K7', 'L8'], ['E9', 'D4', 'C3', 'B2', 'A1']],
      'F11': [['E12'], ['G12'], ['E10', 'I9', 'J5', 'K6', 'L7'], ['G10', 'H9']],
      'F12': [['G11', 'H10'], ['E11', 'I10', 'J9', 'K5', 'L6']],
      'G1': [['H2'], ['F2', 'E3', 'D4', 'C5', 'B6', 'A7']],
      'G2': [['F1'], ['H1'], ['H3'], ['F3', 'E4', 'D5', 'C6', 'B7', 'A8'], ['F3', 'E4', 'I9', 'J10', 'K11', 'L12']],
      'G3': [['F2', 'E1'], ['H2'], ['H4'], ['F4', 'E9', 'I10', 'J11', 'K12']],
      'G4': [['F3', 'E2', 'D1'], ['H3'], ['H9'], ['F9', 'E10', 'I11', 'J12']],
      'G9': [['H4'], ['H10'], ['F10', 'E11', 'I12'], ['F4', 'E3', 'D2', 'C1']],
      'G10': [['H9'], ['H11'], ['F11', 'E12'], ['F9', 'E4', 'D3', 'C2', 'B1']],
      'G11': [['H10'], ['F12'], ['H12'], ['F10', 'E9', 'D4', 'C3', 'B2', 'A1'], ['F10', 'E9', 'I5', 'J6', 'K7', 'L8']],
      'G12': [['H11'], ['F11', 'E10', 'I9', 'J5', 'K6', 'L7']],
      'H1': [['G2', 'F3', 'E4', 'D5', 'C6', 'B7', 'A8'], ['G2', 'F3', 'E4', 'D5', 'I9', 'J10', 'K11', 'L12']],
      'H2': [['G1'], ['G3', 'F4', 'E9', 'I10', 'J11', 'K12']],
      'H3': [['G2', 'F1'], ['G4', 'F9', 'E10', 'I11', 'J12']],
      'H4': [['G3', 'F2', 'E1'], ['G9', 'F10', 'E11', 'I12']],
      'H9': [['G4', 'F3', 'E2', 'D1'], ['G10', 'F11', 'E12']],
      'H10': [['G9', 'F4', 'E3', 'D2', 'C1'], ['G11', 'F12']],
      'H11': [['G10', 'F9', 'E4', 'D3', 'C2', 'B1'], ['G12']],
      'H12': [['G11', 'F10', 'E9', 'D4', 'C3', 'B2', 'A1'], ['G11', 'F10', 'E9', 'I5', 'J6', 'K7', 'L8']],
      'I8': [['J7', 'K6', 'L5'], ['D7', 'C6', 'B5', 'A4']],
      'I7': [['J8'], ['D8'], ['J6', 'K5', 'L9'], ['D6', 'C5', 'B4', 'A3']],
      'I6': [['D7', 'C8'], ['J7', 'K8'], ['D5', 'C4', 'B3', 'A2'], ['J5', 'K9', 'L10']],
      'I5': [['J6', 'K7', 'L8'], ['D6', 'C7', 'B8'], ['J9', 'K10', 'L11'], ['E9', 'F10', 'G11', 'H12'], ['D4', 'C3', 'B2', 'A1']],
      'I9': [['J5', 'K6', 'L7'], ['D5', 'C6', 'B7', 'A8'], ['J10', 'K11', 'L12'], ['E10', 'F11', 'G12'], ['E4', 'F3', 'G2', 'H1']],
      'I10': [['J11', 'K12'], ['E11', 'F12'], ['E9', 'F4', 'G3', 'H2'], ['J9', 'K5', 'L6']],
      'I11': [['J12'], ['E12'], ['E10', 'F9', 'G4', 'H3'], ['J10', 'K9', 'L5']],
      'I12': [['E11', 'F10', 'G9', 'H4'], ['J11', 'K10', 'L9']],
      'J8': [['K7', 'L6'], ['I7', 'D6', 'C5', 'B4', 'A3']],
      'J7': [['K8'], ['I8'], ['K6', 'L5'], ['I6', 'D5', 'C4', 'B3', 'A2']],
      'J6': [['I7', 'D8'], ['K7', 'L8'], ['K5', 'L9'], ['I5', 'E9', 'F10', 'G11', 'H12'], ['I5', 'D4', 'C3', 'B2', 'A1']],
      'J5': [['K6', 'L7'], ['K9', 'L10'], ['I6', 'D7', 'C8'], ['I9', 'E10', 'F11', 'G12']],
      'J9': [['K5', 'L6'], ['K10', 'L11'], ['I10', 'E11', 'F12'], ['I5', 'D6', 'C7', 'B8']],
      'J10': [['K11', 'L12'], ['I11', 'E12'], ['I9', 'E4', 'F3', 'G2', 'H1'], ['I9', 'D5', 'C6', 'B7', 'A8']],
      'J11': [['K12'], ['I12'], ['K10', 'L9'], ['I10', 'E9', 'F4', 'G3', 'H2']],
      'J12': [['K11', 'L10'], ['I11', 'E10', 'F9', 'G4', 'H3']],
      'K8': [['L7'], ['J7', 'I6', 'D5', 'C4', 'B3', 'A2']],
      'K7': [['L8'], ['J8'], ['L6'], ['J6', 'I5', 'E9', 'F10', 'G11', 'H12'], ['J6', 'I5', 'D4', 'C3', 'B2', 'A1']],
      'K6': [['L7'], ['L5'], ['J7', 'I8'], ['J5', 'I9', 'E10', 'F11', 'G12']],
      'K5': [['L6'], ['L9'], ['J6', 'I7', 'D8'], ['J9', 'I10', 'E11', 'F12']],
      'K9': [['L5'], ['L10'], ['J5', 'I6', 'D7', 'C8'], ['J10', 'I11', 'E12']],
      'K10': [['L9'], ['L11'], ['J9', 'I5', 'D6', 'C7', 'B8'], ['J11', 'I12']],
      'K11': [['L10'], ['L12'], ['J12'], ['J10', 'I9', 'D5', 'C6', 'B7', 'A8'], ['J10', 'I9', 'E4', 'F3', 'G2', 'H1']],
      'K12': [['L11'], ['J11', 'I10', 'E9', 'F4', 'G3', 'H2']],
      'L8': [['K7', 'J6', 'I5', 'D4', 'C3', 'B2', 'A1'], ['K7', 'J6', 'I5', 'E9', 'F10', 'G11', 'H12']],
      'L7': [['K8'], ['K6', 'J5', 'I9', 'E10', 'F11', 'G12']],
      'L6': [['K7', 'J8'], ['K5', 'J9', 'I10', 'E11', 'F12']],
      'L5': [['K6', 'J7', 'I8'], ['K9', 'J10', 'I11', 'E12']],
      'L9': [['K10', 'J11', 'I12'], ['K5', 'J6', 'I7', 'D8']],
      'L10': [['K11', 'J12'], ['K9', 'J5', 'I6', 'D7', 'C8']],
      'L11': [['K12'], ['K10', 'J9', 'I5', 'D6', 'C7', 'B8']],
      'L12': [['K11', 'J10', 'I9', 'D5', 'C6', 'B7', 'A8'], ['K11', 'J10', 'I9', 'E4', 'F3', 'G2', 'H1']]
    };
    
    for (const [node, nodeRays] of Object.entries(rays)) {
      this.bishopRays.set(node, nodeRays);
    }
  }
  
  getBishopRays(node: string): string[][] {
    return this.bishopRays.get(node) || [];
  }
  
  getRookRays(node: string): string[][] {
    return this.rookRays.get(node) || [];
  }
  
  getKnightMoves(node: string): string[] {
    return this.knightMoves.get(node) || [];
  }
}