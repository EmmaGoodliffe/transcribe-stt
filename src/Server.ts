import { server } from "typescript";

const delay = async (time: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, time));

class Server {
  el: HTMLElement;
  isSpinning: boolean;
  angle: number;
  constructor(el: Server["el"]) {
    this.el = el;
    this.isSpinning = false;
    this.angle = 0;
  }
  start() {
    this.isSpinning = true;
    this.run();
  }
  stop() {
    this.isSpinning = false;
  }
  async run() {
    if (this.isSpinning) {
      this.el.style.transform = `rotate(${this.angle}deg)`;
      this.angle++;
      await delay(10);
      await this.run();
    }
  }
}

export default Server;
