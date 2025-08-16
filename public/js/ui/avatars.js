/** List of available avatar image paths. */
export const AVATARS = Array.from({ length: 8 }, (_, i) => `/assets/img/avatars/a${i + 1}.png`);
/** Pick a random avatar path. Useful for debug/bots. */
export function randomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)]; // Non-null assertion - array is guaranteed to have elements
}
