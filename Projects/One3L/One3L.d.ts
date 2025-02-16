declare global {
  export function One3L_EXECUTE(...params: unknown[]): unknown;
  export class One3L_STATE implements Record<string, unknown> {
    [s: string]: unknown;
  }
}
export {}
