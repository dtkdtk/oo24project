import { Writable } from "node:stream";

export class TransparentWritableStream {
  
  /** @type {Writable} */
  Stream;

  Output = "";

  AsInjection() {
    return (Message) => this.Stream.write(Message);
  }

  constructor() {
    this.Stream = new Writable();
    this.Stream._write = (Chunk) => {
      this.Output = Chunk;
    };
  }
}
