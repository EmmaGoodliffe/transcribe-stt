class Progress {
  el: HTMLDivElement;
  constructor(el: Progress["el"]) {
    this.el = el;
    this.set(0);
  }
  set(percentage: number) {
    this.el.style.width = `${percentage}%`;
  }
}

export default Progress;
