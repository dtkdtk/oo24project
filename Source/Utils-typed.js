export class IStack extends Array {
  peek() {
    return this[this.length - 1];
  }
}
