import { Writable } from "node:stream";

export class TransparentWritableStream {
  
  /** @type {Writable} */
  Stream;

  Output = "";

  constructor() {
    this.Stream = new Writable();
    this.Stream._write = (Chunk, Encoding, Callback) => {
      this.Output = Chunk;
    };
  }
}
