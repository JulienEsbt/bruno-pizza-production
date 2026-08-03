import assert from "node:assert/strict";
import test from "node:test";

import { createBackendRequestInit } from "../requestForwarding.mjs";

test("transmet intégralement le corps JSON des écritures", async () => {
    const request = new Request(
        "https://desktop.local/api/catalog/pizzas/reine",
        {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                name: "REINE TEST",
                active: true,
            }),
        },
    );

    const init = await createBackendRequestInit(request);

    assert.equal(init.method, "PATCH");
    assert.equal(
        init.headers.get("content-type"),
        "application/json",
    );
    assert.equal(
        new TextDecoder().decode(init.body),
        JSON.stringify({
            name: "REINE TEST",
            active: true,
        }),
    );
});

test("n’ajoute pas de corps aux lectures", async () => {
    const init = await createBackendRequestInit(
        new Request("https://desktop.local/api/catalog"),
    );

    assert.equal(init.method, "GET");
    assert.equal("body" in init, false);
});
