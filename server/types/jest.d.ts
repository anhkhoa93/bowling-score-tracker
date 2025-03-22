import '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveLength(length: number): R;
      toBe(value: any): R;
      toEqual(value: any): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toContain(value: any): R;
      toContainEqual(value: any): R;
      toHaveProperty(key: string, value?: any): R;
      toBeNull(): R;
      toBeGreaterThan(value: number): R;
      toBeGreaterThanOrEqual(value: number): R;
      toBeLessThan(value: number): R;
      toBeLessThanOrEqual(value: number): R;
      toMatch(value: string | RegExp): R;
      toMatchObject(value: object): R;
      toStrictEqual(value: any): R;
      toThrow(value?: string | RegExp | Error): R;
      toThrowError(value?: string | RegExp | Error): R;
    }
  }
}
