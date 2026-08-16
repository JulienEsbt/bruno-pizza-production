export const DEFAULT_ZOOM_FACTOR = 1;
export const MIN_ZOOM_FACTOR = 0.7;
export const MAX_ZOOM_FACTOR = 1.3;
export const ZOOM_STEP = 0.1;

const roundZoomFactor = (factor) =>
    Math.round(factor * 10) / 10;

export const getZoomAction = (input) => {
    if (
        input.type !== "keyDown" ||
        (!input.control && !input.meta)
    ) {
        return undefined;
    }

    const key = input.key.toLowerCase();

    if (["+", "=", "add"].includes(key)) {
        return "in";
    }

    if (["-", "_", "subtract"].includes(key)) {
        return "out";
    }

    if (key === "0") {
        return "reset";
    }

    return undefined;
};

export const getNextZoomFactor = (
    currentFactor,
    action,
) => {
    if (action === "reset") {
        return DEFAULT_ZOOM_FACTOR;
    }

    const delta = action === "in"
        ? ZOOM_STEP
        : -ZOOM_STEP;

    return Math.min(
        MAX_ZOOM_FACTOR,
        Math.max(
            MIN_ZOOM_FACTOR,
            roundZoomFactor(currentFactor + delta),
        ),
    );
};
