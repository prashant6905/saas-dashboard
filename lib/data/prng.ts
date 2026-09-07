/**
 * Mulberry32 32-bit deterministic Pseudo-Random Number Generator.
 * Guarantees identical dataset output for any identical seed.
 */
export class PRNG {
  private state: number;

  constructor(seed: number = 133742) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1).
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a random integer in [min, max] inclusive.
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random float rounded to precision decimal places.
   */
  nextFloat(min: number, max: number, precision: number = 2): number {
    const val = this.next() * (max - min) + min;
    const factor = Math.pow(10, precision);
    return Math.round(val * factor) / factor;
  }

  /**
   * Returns a randomly chosen element from the array.
   */
  choice<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }

  /**
   * Returns an element chosen according to weights.
   */
  weightedChoice<T>(items: readonly T[], weights: readonly number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      if (random < weights[i]) {
        return items[i];
      }
      random -= weights[i];
    }

    return items[items.length - 1];
  }
}
