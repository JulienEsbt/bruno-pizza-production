import assert from "node:assert/strict";
import test from "node:test";

import {
    getMainWindowOptions,
} from "../windowOptions.mjs";

test("ouvre l’application en plein écran sans bordure", () => {
    const options = getMainWindowOptions(
        "Appli Montage",
    );

    assert.equal(options.fullscreen, true);
    assert.equal(options.autoHideMenuBar, true);
    assert.equal(options.show, false);
    assert.equal(
        options.webPreferences.contextIsolation,
        true,
    );
    assert.equal(
        options.webPreferences.nodeIntegration,
        false,
    );
});
