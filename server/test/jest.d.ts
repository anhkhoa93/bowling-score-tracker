import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      not: Matchers<R>;
    }
  }
}

declare namespace jest {
  interface Expect extends jest.Expect {
    stringContaining(str: string): any;
    arrayContaining<T>(arr: T[]): any;
  }
}

export {};
