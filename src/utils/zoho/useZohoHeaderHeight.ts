import { useEffect, useState } from "react";

const MIN_HEADER_HEIGHT = 32;
const MAX_HEADER_HEIGHT = 120;

/**
 * Finds Zoho's top bar: the widest element at the top edge of the page that is as high as a header bar.
 * Returns the height above its bottom border, so content of that height ends where Zoho's line starts.
 */
export function measureZohoHeaderHeight(): number | null {
    const bodyRect = document.body.getBoundingClientRect();
    if (bodyRect.width === 0) return null;

    let element: Element | null = document.elementFromPoint(bodyRect.left + bodyRect.width / 2, 2);
    const candidates: Element[] = [];
    while (element && element !== document.body && element !== document.documentElement) {
        const rect = element.getBoundingClientRect();
        if (
            rect.top <= 0.5 &&
            rect.width >= bodyRect.width * 0.6 &&
            rect.height >= MIN_HEADER_HEIGHT &&
            rect.height <= MAX_HEADER_HEIGHT
        ) {
            candidates.push(element);
        }
        element = element.parentElement;
    }
    if (candidates.length === 0) return null;

    // The outermost match is the bar. Zoho draws the bottom line on a nested element of the same height
    // (div.crmNextGenTopMenu inside div.nextGenUITopBar), so take the border from any match ending there.
    const bottom = candidates[candidates.length - 1].getBoundingClientRect().bottom;
    let borderBottom = 0;
    for (const candidate of candidates) {
        if (Math.abs(candidate.getBoundingClientRect().bottom - bottom) > 0.5) continue;
        borderBottom = Math.max(borderBottom, parseFloat(getComputedStyle(candidate).borderBottomWidth) || 0);
    }
    return Math.round(bottom - borderBottom);
}

/** Height of Zoho's top bar, or the fallback until it is rendered */
export function useZohoHeaderHeight(fallback: number): number {
    const [height, setHeight] = useState<number>(fallback);

    useEffect(() => {
        const update = () => {
            const measured = measureZohoHeaderHeight();
            if (measured !== null) setHeight(measured);
            return measured !== null;
        };

        // Zoho renders its top bar after the page has loaded, so keep looking for a while
        let attempts = 0;
        const interval = window.setInterval(() => {
            attempts++;
            if (update() || attempts >= 30) window.clearInterval(interval);
        }, 500);
        update();

        window.addEventListener("resize", update);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener("resize", update);
        };
    }, []);

    return height;
}
