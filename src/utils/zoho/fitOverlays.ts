// Zoho's Lyte framework renders modals and side sheets (help panel, notifications, quick create) into
// <lyte-wormhole> elements and computes their position in JavaScript from the window width. Narrowing the body
// does not change that width, so a right-aligned sheet still ends at the window edge, under the side panel.
// This shifts such overlays left with the CSS `translate` property, which adds to the `transform` Lyte sets
// inline, until they end at the right edge of the body.

const SHIFT_ATTRIBUTE = "data-zoho-sidekick-shift";
const MAX_DEPTH = 6;

let active = false;
let frameRequested = false;
let bodyObserver: MutationObserver | null = null;
let wormholeObserver: MutationObserver | null = null;
const observedWormholes = new WeakSet<Element>();

/** Starts or stops keeping Zoho's overlays inside the body. Call it whenever the reserved width changes. */
export function setFitOverlaysActive(isActive: boolean) {
    active = isActive;
    if (active) {
        observe();
    } else {
        disconnect();
    }
    scheduleFit();
}

function observe() {
    if (bodyObserver) return;
    wormholeObserver = new MutationObserver(scheduleFit);
    // Wormholes are added to the body when a modal opens for the first time
    bodyObserver = new MutationObserver(() => {
        observeWormholes();
        scheduleFit();
    });
    bodyObserver.observe(document.body, { childList: true });
    observeWormholes();
    window.addEventListener("resize", scheduleFit);
}

function observeWormholes() {
    document.querySelectorAll("lyte-wormhole").forEach((wormhole) => {
        if (observedWormholes.has(wormhole)) return;
        observedWormholes.add(wormhole);
        wormholeObserver?.observe(wormhole, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class"]
        });
    });
}

function disconnect() {
    bodyObserver?.disconnect();
    wormholeObserver?.disconnect();
    bodyObserver = null;
    wormholeObserver = null;
    window.removeEventListener("resize", scheduleFit);
}

function scheduleFit() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
        frameRequested = false;
        fit();
    });
}

function fit() {
    const limit = document.body.getBoundingClientRect().right;
    document.querySelectorAll("lyte-wormhole").forEach((wormhole) => fitChildren(wormhole, limit, 0));
    if (!active) {
        document.querySelectorAll<HTMLElement>(`[${SHIFT_ATTRIBUTE}]`).forEach((element) => setShift(element, 0));
    }
}

function fitChildren(parent: Element, limit: number, depth: number) {
    for (const child of Array.from(parent.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (fitElement(child, limit)) continue;
        if (depth < MAX_DEPTH) fitChildren(child, limit, depth + 1);
    }
}

/** Returns true when the element was shifted, so its content needs no check of its own. */
function fitElement(element: HTMLElement, limit: number): boolean {
    const position = getComputedStyle(element).position;
    if (position !== "fixed" && position !== "absolute") return false;

    const currentShift = Number(element.getAttribute(SHIFT_ATTRIBUTE) ?? 0);
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return currentShift !== 0;

    // Where the element would be without our shift
    const left = rect.left - currentShift;
    const right = rect.right - currentShift;

    let shift = 0;
    if (active && right > limit + 0.5) {
        // Move it left until it ends at the body edge, but never past the left edge of the window
        shift = -Math.min(right - limit, Math.max(left, 0));
    }
    setShift(element, shift);
    return shift !== 0;
}

function setShift(element: HTMLElement, shift: number) {
    const rounded = Math.round(shift);
    const current = Number(element.getAttribute(SHIFT_ATTRIBUTE) ?? 0);
    if (rounded === current) return;
    if (rounded === 0) {
        element.style.removeProperty("translate");
        element.removeAttribute(SHIFT_ATTRIBUTE);
    } else {
        element.style.setProperty("translate", `${rounded}px 0`, "important");
        element.setAttribute(SHIFT_ATTRIBUTE, String(rounded));
    }
}
