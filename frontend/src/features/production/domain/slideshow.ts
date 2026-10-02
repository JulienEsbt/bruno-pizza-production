export interface SlideshowState { index: number; playing: boolean; count: number; }
export type SlideshowAction = "toggle" | "pause" | "next" | "previous" | "final" | "tick";
export const createSlideshowState = (count: number): SlideshowState => ({count, index: 0, playing: count > 1});
export function slideshowReducer(state: SlideshowState, action: SlideshowAction): SlideshowState {
    const last = Math.max(0, state.count - 1);
    switch (action) {
        case "toggle": return state.count < 2 ? state : {...state, playing: !state.playing};
        case "pause": return {...state, playing: false};
        case "final": return {...state, index: last};
        case "next": return {...state, index: Math.min(last, state.index + 1)};
        case "previous": return {...state, index: Math.max(0, state.index - 1)};
        case "tick": return !state.playing || state.count < 2 ? state : {...state, index: (state.index + 1) % state.count};
    }
}
export const SLIDESHOW_SPEEDS = [1, 2, 3, 5, 8, 10, 12, 15] as const;
export const normalizeSlideshowSpeed = (value: unknown): number =>
    typeof value === "number" && SLIDESHOW_SPEEDS.some((speed) => speed === value) ? value : 3;
