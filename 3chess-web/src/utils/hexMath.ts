// EXACT PORT OF yalta.py hexagonal math

export const WIDTH = 900;
export const HEIGHT = 900;

const deg2rad = (deg: number) => deg * Math.PI / 180;

export const cos30 = Math.cos(deg2rad(30));
export const sin30 = Math.sin(deg2rad(30));
export const cos60 = Math.cos(deg2rad(60));
export const sin60 = Math.sin(deg2rad(60));

export class Vec {
  constructor(public x: number, public y: number) {}
  
  add(v: Vec): Vec {
    return new Vec(this.x + v.x, this.y + v.y);
  }
  
  sub(v: Vec): Vec {
    return new Vec(this.x - v.x, this.y - v.y);
  }
  
  mul(m: number): Vec {
    return new Vec(this.x * m, this.y * m);
  }
  
  div(n: number): Vec {
    return new Vec(this.x / n, this.y / n);
  }
  
  int(): Vec {
    return new Vec(Math.floor(this.x), Math.floor(this.y));
  }
  
  mag(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}

export class Cell {
  static mid = new Vec(WIDTH / 2, HEIGHT / 2);
  static size = WIDTH / 2;
  static side = Cell.size / 2;
  static height = Math.sqrt(Cell.size ** 2 - Cell.side ** 2);
  
  static v1 = new Vec(-Cell.size * cos60, -Cell.height);
  static v2 = new Vec(Cell.size * cos60, -Cell.height);
  static v3 = new Vec(Cell.size, 0);
  static v4 = new Vec(Cell.size * cos60, Cell.height);
  static v5 = new Vec(-Cell.size * cos60, Cell.height);
  static v6 = new Vec(-Cell.size, 0);
  
  static va = new Vec(-Cell.height * cos30, -Cell.height * sin30);
  static vb = new Vec(0, -Cell.height);
  static vc = new Vec(Cell.height * cos30, -Cell.height * sin30);
  static vd = new Vec(Cell.height * cos30, Cell.height * sin30);
  static ve = new Vec(0, Cell.height);
  static vf = new Vec(-Cell.height * cos30, Cell.height * sin30);
  
  static v123 = [Cell.v1, Cell.v2, Cell.v3, Cell.v4, Cell.v5, Cell.v6];
  static vabc = [Cell.va, Cell.vb, Cell.vc, Cell.vd, Cell.ve, Cell.vf];
  
  static intervals = [
    [[0, 4], [0, 4]],  // First sextant
    [[0, 4], [4, 8]],  // Second sextant
    [[8, 12], [4, 8]], // Third sextant
    [[8, 12], [8, 12]], // Fourth sextant
    [[4, 8], [8, 12]], // Fifth sextant
    [[4, 8], [0, 4]]   // Sixth sextant
  ];
  
  public center: Vec;
  public points: [number, number][] = [];
  public isDark: boolean = false;
  
  constructor(public x: number, public y: number) {
    // Find which sextant this cell belongs to
    for (let i = 0; i < Cell.intervals.length; i++) {
      const interval = Cell.intervals[i];
      
      if (interval[0][0] <= x && x < interval[0][1] && 
          interval[1][0] <= y && y < interval[1][1]) {
        
        const ratio_x1 = (x % 4) / 4;
        const ratio_y1 = (y % 4) / 4;
        const ratio_x2 = (x % 4 + 1) / 4;
        const ratio_y2 = (y % 4 + 1) / 4;
        
        const mid_ratio_x = (ratio_x2 + ratio_x1) / 2;
        const mid_ratio_y = (ratio_y2 + ratio_y1) / 2;
        
        const s1 = Cell.v123[i].mul(0.5);
        const s2 = Cell.v123[(i + 2) % 6].mul(0.5);
        
        const corner = Cell.mid.add(Cell.v123[(i + 4) % 6]);
        
        const U1 = Cell.vabc[(i + 1) % 6].mul(ratio_y1).sub(s1.mul(ratio_y1)).add(s2);
        const U2 = Cell.vabc[(i + 1) % 6].mul(ratio_y2).sub(s1.mul(ratio_y2)).add(s2);
        const midU = Cell.vabc[(i + 1) % 6].mul(mid_ratio_y).sub(s1.mul(mid_ratio_y)).add(s2);
        
        const p1 = s1.mul(ratio_y1).add(U1.mul(ratio_x1));
        const p2 = s1.mul(ratio_y1).add(U1.mul(ratio_x2));
        const p3 = s1.mul(ratio_y2).add(U2.mul(ratio_x2));
        const p4 = s1.mul(ratio_y2).add(U2.mul(ratio_x1));
        
        this.center = corner.add(s1.mul(mid_ratio_y)).add(midU.mul(mid_ratio_x));
        
        this.points = [
          [corner.add(p1).x, corner.add(p1).y],
          [corner.add(p2).x, corner.add(p2).y],
          [corner.add(p3).x, corner.add(p3).y],
          [corner.add(p4).x, corner.add(p4).y]
        ];
        
        this.isDark = ((x + y + i) % 2) === 0;
        break;
      }
    }
  }
}