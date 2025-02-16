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

/**
 * Типизированная версия `Object.keys()`
 */
export function OKeysOf<_TyObj extends object>(O: _TyObj): (keyof _TyObj)[];

/**
 * Типизированная версия `Object.values()`
 */
export function OValuesOf<_TyObj extends object>(O: _TyObj): (_TyObj[keyof _TyObj])[];

/**
 * Типизированная версия `Object.entries()`
 */
export function OEntriesOf<_TyObj extends object>(O: _TyObj):
  | ({ [_vKey in keyof _TyObj]: [_vKey, _TyObj[_vKey]] }[keyof _TyObj])[];

/**
 * Типизированная версия `Object.assign()` без vararg и возвращаемого значения
 */
export function OAssign<_TyDest extends object, _TySource extends object>
  (Dest: _TyDest, Source: _TySource): asserts Dest is (_TyDest & _TySource);
