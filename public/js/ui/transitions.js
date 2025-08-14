/** Utility helpers for simple CSS based transitions. */
function run(el, cls) {
    return new Promise(res => {
        el.classList.add(cls);
        el.addEventListener('animationend', () => {
            el.classList.remove(cls);
            res();
        }, { once: true });
    });
}
export function fadeIn(el) {
    return run(el, 'fade-in');
}
export function slideUp(el) {
    return run(el, 'slide-up');
}
export function popIn(el) {
    return run(el, 'pop-in');
}
