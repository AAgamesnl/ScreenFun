/** Small UI helper components used across the app. */
/** Show a temporary toast message. */
export function toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}
/** Display a modal dialog with a title and content. */
export function modal(title, content) {
    const wrap = document.createElement('div');
    wrap.className = 'modal card';
    const h = document.createElement('h2');
    h.textContent = title;
    const body = document.createElement('div');
    if (typeof content === 'string')
        body.textContent = content;
    else
        body.appendChild(content);
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Close';
    btn.onclick = () => wrap.remove();
    wrap.append(h, body, btn);
    document.body.appendChild(wrap);
    return wrap;
}
/** Update a progress bar element (expects an <i> child). */
export function progressBar(el, pct) {
    let bar = el.querySelector('i');
    if (!bar) {
        bar = document.createElement('i');
        el.appendChild(bar);
    }
    bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
}
/** Draw a simple countdown ring on a canvas element. */
export function ringTimer(canvas, remainingMs, totalMs = remainingMs) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const start = Date.now();
    const radius = canvas.width / 2;
    function tick() {
        const elapsed = Date.now() - start;
        const pct = Math.max(0, 1 - elapsed / totalMs);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent');
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(radius, radius, radius - 3, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pct);
        ctx.stroke();
        if (elapsed < totalMs)
            requestAnimationFrame(tick);
    }
    tick();
}
