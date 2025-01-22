export class IStack extends Array {
  peek() {
    return this[this.length - 1];
  }
}

export const __Any = undefined;

export function Labelled(xLabel, Origin) {
  Origin.xLabel = xLabel;
  return Origin;
}
