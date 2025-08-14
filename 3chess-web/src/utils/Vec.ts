export class Vec {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vec): Vec {
    return new Vec(this.x + v.x, this.y + v.y);
  }

  sub(v: Vec): Vec {
    return new Vec(this.x - v.x, this.y - v.y);
  }

  mul(m: number | Vec): number | Vec {
    if (m instanceof Vec) {
      return this.x * m.x + this.y * m.y;
    }
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

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  toString(): string {
    return `(${this.x};${this.y})`;
  }
}