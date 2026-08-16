import assert from "node:assert/strict";
import test from "node:test";

import {
    DEFAULT_ZOOM_FACTOR,
    getNextZoomFactor,
    getZoomAction,
} from "../zoom.mjs";

test("reconnaît les raccourcis de zoom Windows et macOS", () => {
    assert.equal(
        getZoomAction({
            type: "keyDown",
            control: true,
            meta: false,
            key: "+",
        }),
        "in",
    );
    assert.equal(
        getZoomAction({
            type: "keyDown",
            control: false,
            meta: true,
            key: "-",
        }),
        "out",
    );
    assert.equal(
        getZoomAction({
            type: "keyDown",
            control: true,
            meta: false,
            key: "0",
        }),
        "reset",
    );
});

test("borne le zoom et restaure le niveau lisible par défaut", () => {
    assert.equal(getNextZoomFactor(1, "in"), 1.1);
    assert.equal(getNextZoomFactor(1, "out"), 0.9);
    assert.equal(getNextZoomFactor(1.3, "in"), 1.3);
    assert.equal(getNextZoomFactor(0.7, "out"), 0.7);
    assert.equal(
        getNextZoomFactor(1.2, "reset"),
        DEFAULT_ZOOM_FACTOR,
    );
});
