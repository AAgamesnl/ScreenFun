/** Utility helpers for simple CSS based transitions. */
function run(el: HTMLElement, cls: string): Promise<void> {
  return new Promise(res => {
    el.classList.add(cls);
    el.addEventListener('animationend', () => {
      el.classList.remove(cls);
      res();
    }, { once: true });
  });
}

export function fadeIn(el: HTMLElement): Promise<void> {
  return run(el, 'fade-in');
}

export function slideUp(el: HTMLElement): Promise<void> {
  return run(el, 'slide-up');
}

export function popIn(el: HTMLElement): Promise<void> {
  return run(el, 'pop-in');
}
