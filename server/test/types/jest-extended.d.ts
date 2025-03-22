/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toContain(item: any): R;
      toContainEqual(item: any): R;
      toBeNull(): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNaN(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeGreaterThan(number: number): R;
      toBeGreaterThanOrEqual(number: number): R;
      toBeLessThan(number: number): R;
      toBeLessThanOrEqual(number: number): R;
      toBeInstanceOf(constructor: any): R;
      toMatch(regexp: RegExp | string): R;
      toMatchObject(object: any): R;
      toHaveProperty(path: string, value?: any): R;
      toHaveLength(length: number): R;
      toThrow(error?: any): R;
    }
  }
}

declare namespace jest {
  interface Expect {
    stringContaining(str: string): any;
    arrayContaining<T>(arr: T[]): any;
  }
}

export {};
