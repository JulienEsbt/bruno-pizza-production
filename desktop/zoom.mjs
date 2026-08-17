export const DEFAULT_ZOOM_FACTOR = 1;
export const HIGH_DPI_ZOOM_FACTOR = 0.8;
export const HIGH_DPI_SCALE_FACTOR = 2.5;
export const MIN_ZOOM_FACTOR = 0.7;
export const MAX_ZOOM_FACTOR = 1.3;
export const ZOOM_STEP = 0.1;

const roundZoomFactor = (factor) =>
    Math.round(factor * 10) / 10;

export const getDefaultZoomFactor = (scaleFactor) =>
    Number.isFinite(scaleFactor) &&
    scaleFactor >= HIGH_DPI_SCALE_FACTOR
        ? HIGH_DPI_ZOOM_FACTOR
        : DEFAULT_ZOOM_FACTOR;

export const getZoomAction = (input) => {
    if (
        input.type !== "keyDown" ||
        (!input.control && !input.meta)
    ) {
        return undefined;
    }

    const key = input.key.toLowerCase();
    const code = input.code?.toLowerCase();

    if (["+", "=", "add"].includes(key)) {
        return "in";
    }

    if (["-", "_", "subtract"].includes(key)) {
        return "out";
    }

    if (
        key === "0" ||
        code === "digit0" ||
        code === "numpad0"
    ) {
        return "reset";
    }

    return undefined;
};

export const getNextZoomFactor = (
    currentFactor,
    action,
    defaultFactor = DEFAULT_ZOOM_FACTOR,
) => {
    if (action === "reset") {
        return defaultFactor;
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
