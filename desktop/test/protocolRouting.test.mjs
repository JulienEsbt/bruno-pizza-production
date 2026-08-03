import assert from "node:assert/strict";
import test from "node:test";

import {
    DESKTOP_ENTRY_URL,
    getBackendProxyUrl,
    isDesktopNavigation,
} from "../protocolRouting.mjs";

test("conserve une origine desktop fixe avec un port backend dynamique", () => {
    assert.equal(
        DESKTOP_ENTRY_URL,
        "bruno-pizza://app/",
    );
    assert.equal(
        getBackendProxyUrl(
            "bruno-pizza://app/api/catalog?fresh=1",
            "http://127.0.0.1:49152",
        ),
        "http://127.0.0.1:49152/api/catalog?fresh=1",
    );
    assert.equal(
        getBackendProxyUrl(
            "bruno-pizza://app/production",
            "http://127.0.0.1:57321",
        ),
        "http://127.0.0.1:57321/production",
    );
});

test("refuse toute navigation hors de l’origine desktop", () => {
    assert.equal(
        isDesktopNavigation(
            "bruno-pizza://app/settings",
        ),
        true,
    );
    assert.equal(
        isDesktopNavigation("https://example.com"),
        false,
    );
    assert.equal(
        isDesktopNavigation(
            "bruno-pizza://other/settings",
        ),
        false,
    );
    assert.throws(() => {
        getBackendProxyUrl(
            "bruno-pizza://other/api/catalog",
            "http://127.0.0.1:49152",
        );
    });
});
