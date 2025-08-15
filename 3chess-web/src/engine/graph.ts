import { EdgeType } from '../types/game';
import type { GraphEdge } from '../types/game';

export class ChessGraph {
  private nodes: Set<string> = new Set();
  private edges: Map<string, GraphEdge[]> = new Map();
  
  constructor() {
    this.createNodes();
    this.createEdges();
  }
  
  private createNodes() {
    // Section 1: Files A-H, Ranks 1-4
    for (const file of 'ABCDEFGH') {
      for (let rank = 1; rank <= 4; rank++) {
        this.nodes.add(`${file}${rank}`);
      }
    }
    
    // Section 2: Files A-D and I-L, Ranks 5-8
    for (const file of 'ABCD') {
      for (let rank = 5; rank <= 8; rank++) {
        this.nodes.add(`${file}${rank}`);
      }
    }
    for (const file of 'IJKL') {
      for (let rank = 5; rank <= 8; rank++) {
        this.nodes.add(`${file}${rank}`);
      }
    }
    
    // Section 3: Files E-H and I-L, Ranks 9-12
    for (const file of 'EFGH') {
      for (let rank = 9; rank <= 12; rank++) {
        this.nodes.add(`${file}${rank}`);
      }
    }
    for (const file of 'IJKL') {
      for (let rank = 9; rank <= 12; rank++) {
        this.nodes.add(`${file}${rank}`);
      }
    }
  }
  
  private createEdges() {
    // Add rank edges (horizontal connections)
    this.addRankEdges();
    // Add file edges (vertical connections)
    this.addFileEdges();
    // Add diagonal edges
    this.addDiagonalEdges();
  }
  
  private addEdge(from: string, to: string, type: EdgeType) {
    if (!this.edges.has(from)) {
      this.edges.set(from, []);
    }
    if (!this.edges.has(to)) {
      this.edges.set(to, []);
    }
    
    this.edges.get(from)!.push({ from, to, type });
    this.edges.get(to)!.push({ from: to, to: from, type });
  }
  
  private addRankEdges() {
    // Section 1: Ranks 1-4
    const files1 = 'ABCDEFGH';
    for (let rank = 1; rank <= 4; rank++) {
      for (let i = 0; i < files1.length - 1; i++) {
        this.addEdge(`${files1[i]}${rank}`, `${files1[i + 1]}${rank}`, EdgeType.RANK);
      }
    }
    
    // Section 2: Ranks 5-8 (left side)
    const files2a = 'ABCD';
    for (let rank = 5; rank <= 8; rank++) {
      for (let i = 0; i < files2a.length - 1; i++) {
        this.addEdge(`${files2a[i]}${rank}`, `${files2a[i + 1]}${rank}`, EdgeType.RANK);
      }
      // Connect D to I
      this.addEdge(`D${rank}`, `I${rank}`, EdgeType.RANK);
      
      // Right side: I-L
      const files2b = 'IJKL';
      for (let i = 0; i < files2b.length - 1; i++) {
        this.addEdge(`${files2b[i]}${rank}`, `${files2b[i + 1]}${rank}`, EdgeType.RANK);
      }
    }
    
    // Section 3: Ranks 9-12 (left side E-H)
    const files3a = 'EFGH';
    for (let rank = 9; rank <= 12; rank++) {
      for (let i = 0; i < files3a.length - 1; i++) {
        this.addEdge(`${files3a[i]}${rank}`, `${files3a[i + 1]}${rank}`, EdgeType.RANK);
      }
      
      // Connect H to I (wrapping around)
      this.addEdge(`E${rank}`, `I${rank}`, EdgeType.RANK);
      
      // Right side: I-L
      const files3b = 'IJKL';
      for (let i = 0; i < files3b.length - 1; i++) {
        this.addEdge(`${files3b[i]}${rank}`, `${files3b[i + 1]}${rank}`, EdgeType.RANK);
      }
    }
  }
  
  private addFileEdges() {
    // Files A-H ranks 1-3
    for (const file of 'ABCDEFGH') {
      for (let rank = 1; rank <= 3; rank++) {
        this.addEdge(`${file}${rank}`, `${file}${rank + 1}`, EdgeType.FILE);
      }
    }
    
    // Files A-D ranks 4-7
    for (const file of 'ABCD') {
      // Connect 4 to 5
      this.addEdge(`${file}4`, `${file}5`, EdgeType.FILE);
      // Connect 5-8
      for (let rank = 5; rank <= 7; rank++) {
        this.addEdge(`${file}${rank}`, `${file}${rank + 1}`, EdgeType.FILE);
      }
    }
    
    // Files E-H connect 4 to 9
    for (const file of 'EFGH') {
      this.addEdge(`${file}4`, `${file}9`, EdgeType.FILE);
      // Connect 9-12
      for (let rank = 9; rank <= 11; rank++) {
        this.addEdge(`${file}${rank}`, `${file}${rank + 1}`, EdgeType.FILE);
      }
    }
    
    // Files I-L ranks 5-7
    for (const file of 'IJKL') {
      for (let rank = 5; rank <= 7; rank++) {
        this.addEdge(`${file}${rank}`, `${file}${rank + 1}`, EdgeType.FILE);
      }
      // Connect 5 to 9
      this.addEdge(`${file}5`, `${file}9`, EdgeType.FILE);
      // Connect 9-12
      for (let rank = 9; rank <= 11; rank++) {
        this.addEdge(`${file}${rank}`, `${file}${rank + 1}`, EdgeType.FILE);
      }
    }
  }
  
  private addDiagonalEdges() {
    // For each node, find diagonal connections
    // A diagonal is where you can reach by going one rank edge then one file edge
    // or one file edge then one rank edge
    for (const node of this.nodes) {
      const neighbors = this.edges.get(node) || [];
      
      // Find rank neighbors
      const rankNeighbors = neighbors.filter(e => e.type === EdgeType.RANK);
      for (const rankNeighbor of rankNeighbors) {
        const fileNeighbors = (this.edges.get(rankNeighbor.to) || [])
          .filter(e => e.type === EdgeType.FILE && e.to !== node);
        
        for (const fileNeighbor of fileNeighbors) {
          // Check if we already have this diagonal
          const existingEdges = this.edges.get(node) || [];
          const hasEdge = existingEdges.some(e => 
            e.to === fileNeighbor.to && e.type === EdgeType.DIAGONAL
          );
          
          if (!hasEdge) {
            this.addEdge(node, fileNeighbor.to, EdgeType.DIAGONAL);
          }
        }
      }
    }
  }
  
  getNodes(): string[] {
    return Array.from(this.nodes);
  }
  
  getNeighbors(node: string, edgeType?: EdgeType): string[] {
    const edges = this.edges.get(node) || [];
    const filtered = edgeType 
      ? edges.filter(e => e.type === edgeType)
      : edges;
    return filtered.map(e => e.to);
  }
  
  hasNode(node: string): boolean {
    return this.nodes.has(node);
  }
}