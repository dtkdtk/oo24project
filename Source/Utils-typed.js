export class IStack extends Array {
  static createSized(size) {
    return new IStack(size);
  }
  static createAndFill(...values) {
    const S = new IStack();
    S.push(...values);
    return S;
  }
  static create() {
    return new IStack();
  }
  peek() {
    return this[this.length - 1];
  }
  push(...values) {
    super.push(...values);
    return this;
  }
}

export const __Any = undefined;

export function Labelled(xLabel, Origin) {
  Origin.xLabel = xLabel;
  return Origin;
}
