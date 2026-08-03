import assert from "node:assert/strict";
import test from "node:test";

import { detectImageType } from "../src/services/imageFileValidation.js";

test("détecte les signatures JPEG, PNG et WebP", () => {
    assert.deepEqual(
        detectImageType(
            Buffer.from([0xff, 0xd8, 0xff, 0x00]),
        ),
        {
            mimeType: "image/jpeg",
            extension: ".jpg",
        },
    );

    assert.deepEqual(
        detectImageType(
            Buffer.from([
                0x89,
                0x50,
                0x4e,
                0x47,
                0x0d,
                0x0a,
                0x1a,
                0x0a,
            ]),
        ),
        {
            mimeType: "image/png",
            extension: ".png",
        },
    );

    assert.deepEqual(
        detectImageType(
            Buffer.from(
                "RIFF0000WEBP",
                "ascii",
            ),
        ),
        {
            mimeType: "image/webp",
            extension: ".webp",
        },
    );
});

test("refuse un contenu qui ment sur son extension", () => {
    assert.equal(
        detectImageType(
            Buffer.from("not an image"),
        ),
        undefined,
    );
});
