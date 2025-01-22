export declare class IStack<T> {
  constructor(...values: T[]);

  [i: number]: T;
  readonly length: number;
  push(...items: T[]): void;
  pop(): T;
  peek(): T;
}

export declare const __Any: any;

/**
 * Сущность (например, коллекция), которая имеет метку (некое название).
 */
export type Labelled<_Ty extends object> = _Ty & { xLabel: string };

/**
 * **Мутирует** указанный объект, добавляя ему поле с меткой - `xLabel`.
 */
export function Labelled<_Ty extends object>(xLabel: string, Origin: _Ty): Labelled<_Ty>;
