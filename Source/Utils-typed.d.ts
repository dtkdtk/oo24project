export declare class IStack<T> {
  /** Для создания используйте статические методы */
  private constructor();
  static createSized<T>(size: number): IStack<T>;
  static createAndFill<T>(...items: T[]): IStack<T>;
  static createFrom<T>(origin: IStack<T> | T[]): IStack<T>;
  static create<T>(): IStack<T>;

  [i: number]: T;
  readonly length: number;
  push(...items: T[]): this;
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
