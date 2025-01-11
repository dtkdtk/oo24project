export declare class IStack<T> {
  constructor(...values: T[]);

  [i: number]: T;
  readonly length: number;
  push(...items: T[]): void;
  pop(): T;
  peek(): T;
}

export declare const __Any: any;
