import { Vec } from '../utils/Vec';
import type { CellData, Piece } from '../types';

const WIDTH = 800;
const HEIGHT = 800;

const cos30 = Math.cos(Math.PI / 6);
const sin30 = Math.sin(Math.PI / 6);
const cos60 = Math.cos(Math.PI / 3);

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
    [[0, 4], [0, 4]], // First sextan
    [[0, 4], [4, 8]], // Second sextan
    [[8, 12], [4, 8]], // Third sextan
    [[8, 12], [8, 12]], // Fourth sextan
    [[4, 8], [8, 12]], // Fifth sextan
    [[4, 8], [0, 4]], // Sixth sextan
  ];

  static DARK = '#362720';
  static LIGHT = '#e5d2aa';

  x: number;
  y: number;
  piece: Piece | null;
  points: [number, number][] | null = null;
  center: Vec;
  color: string;

  constructor(x: number, y: number, piece: Piece | null) {
    this.x = x;
    this.y = y;
    this.piece = piece;
    this.center = new Vec(0, 0);
    this.color = Cell.LIGHT;

    for (let i = 0; i < Cell.intervals.length; i++) {
      const interval = Cell.intervals[i];

      if (
        interval[0][0] <= x &&
        x < interval[0][1] &&
        interval[1][0] <= y &&
        y < interval[1][1]
      ) {
        const ratioX1 = (x % 4) / 4;
        const ratioY1 = (y % 4) / 4;
        const ratioX2 = ((x % 4) + 1) / 4;
        const ratioY2 = ((y % 4) + 1) / 4;

        const midRatioX = (ratioX2 + ratioX1) / 2;
        const midRatioY = (ratioY2 + ratioY1) / 2;

        const s1 = Cell.v123[i].mul(0.5) as Vec;
        const s2 = Cell.v123[(i + 2) % 6].mul(0.5) as Vec;

        const corner = Cell.mid.add(Cell.v123[(i + 4) % 6]);

        const U1 = (Cell.vabc[(i + 1) % 6]
          .mul(ratioY1) as Vec)
          .sub(s1.mul(ratioY1) as Vec)
          .add(s2);
        const U2 = (Cell.vabc[(i + 1) % 6]
          .mul(ratioY2) as Vec)
          .sub(s1.mul(ratioY2) as Vec)
          .add(s2);
        const midU = (Cell.vabc[(i + 1) % 6]
          .mul(midRatioY) as Vec)
          .sub(s1.mul(midRatioY) as Vec)
          .add(s2);

        const p1 = (s1.mul(ratioY1) as Vec).add(U1.mul(ratioX1) as Vec);
        const p2 = (s1.mul(ratioY1) as Vec).add(U1.mul(ratioX2) as Vec);
        const p3 = (s1.mul(ratioY2) as Vec).add(U2.mul(ratioX2) as Vec);
        const p4 = (s1.mul(ratioY2) as Vec).add(U2.mul(ratioX1) as Vec);

        this.center = corner.add(s1.mul(midRatioY) as Vec).add(midU.mul(midRatioX) as Vec);

        this.points = [
          corner.add(p1).toArray(),
          corner.add(p2).toArray(),
          corner.add(p3).toArray(),
          corner.add(p4).toArray(),
        ];

        this.color = [Cell.DARK, Cell.LIGHT][(x + y + i) % 2];
        break;
      }
    }
  }

  toCellData(): CellData {
    return {
      x: this.x,
      y: this.y,
      piece: this.piece,
      points: this.points || [],
      center: { x: this.center.x, y: this.center.y },
      color: this.color,
    };
  }
}