import assert from "node:assert/strict";
import test from "node:test";
import {createSlideshowState, slideshowReducer, normalizeSlideshowSpeed, SLIDESHOW_SPEEDS} from "../src/features/production/domain/slideshow.ts";

test("démarre automatiquement à la première étape, sauf pour une image unique", () => {
    assert.deepEqual(createSlideshowState(4), {count: 4, index: 0, playing: true});
    assert.deepEqual(createSlideshowState(1), {count: 1, index: 0, playing: false});
    assert.equal(slideshowReducer(createSlideshowState(1), "toggle").playing, false);
});
test("boucle, reste immobile en pause et reprend exactement l'image courante", () => {
    let state = slideshowReducer(createSlideshowState(3), "tick");
    assert.equal(state.index, 1);
    state = slideshowReducer(state, "toggle");
    assert.equal(state.playing, false);
    assert.equal(slideshowReducer(state, "tick"), state);
    state = slideshowReducer(state, "toggle");
    assert.equal(state.index, 1);
    state = slideshowReducer(state, "tick");
    assert.equal(state.index, 2);
    state = slideshowReducer(slideshowReducer(state, "pause"), "toggle");
    assert.equal(state.index, 2);
    assert.equal(slideshowReducer(state, "tick").index, 0);
});
test("les flèches et la finale préservent la lecture, et préservent aussi la pause", () => {
    for (const playing of [true, false]) {
        const state = {...createSlideshowState(3), index: 1, playing};
        assert.deepEqual(slideshowReducer(state, "next"), {...state, index: 2});
        assert.deepEqual(slideshowReducer(state, "previous"), {...state, index: 0});
        assert.deepEqual(slideshowReducer(state, "final"), {...state, index: 2});
        assert.equal(slideshowReducer({...state, index: 0}, "previous").index, 0);
        assert.equal(slideshowReducer({...state, index: 2}, "next").index, 2);
    }
    assert.equal(slideshowReducer(createSlideshowState(3), "pause").playing, false);
});
test("accepte les huit vitesses proposées et restaure trois secondes si la préférence est invalide", () => {
    assert.deepEqual(SLIDESHOW_SPEEDS, [1, 2, 3, 5, 8, 10, 12, 15]);
    for (const value of [null, undefined, NaN, -1, 0, 4, 100, "5"]) assert.equal(normalizeSlideshowSpeed(value), 3);
    for (const value of SLIDESHOW_SPEEDS) assert.equal(normalizeSlideshowSpeed(value), value);
});
