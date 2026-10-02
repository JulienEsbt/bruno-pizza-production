import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installDemoPhotos } from "../demoPhotos.mjs";

function fixture(t, names = []) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "pizza-demo-"));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const directory = path.join(root, "desktop", "demo-images");
    fs.mkdirSync(directory, { recursive: true });
    for (let i = 1; i <= 4; i++) fs.writeFileSync(path.join(directory, `DEMO-V2-${i}.png`), "test");
    let gallery = names.map((originalName) => ({ originalName }));
    const options = {
        appPath: root, userDataPath: path.join(root, "user"),
        findPizzaImages: () => gallery,
        savePizzaImages: (_id, files) => { gallery = [...files.map((f) => ({ originalName: f.originalname })), ...gallery]; },
    };
    return { options, get: () => gallery, clear: () => { gallery = []; }, directory };
}

test("adds four demo photos once, preserves existing photos and respects later deletion", (t) => {
    const f = fixture(t, ["photo-client.jpg"]);
    installDemoPhotos(f.options);
    assert.equal(f.get().length, 5);
    assert.equal(f.get().at(-1).originalName, "photo-client.jpg");
    installDemoPhotos(f.options);
    assert.equal(f.get().length, 5);
    f.clear();
    installDemoPhotos(f.options);
    assert.equal(f.get().length, 0);
});

test("does not duplicate files after interrupted marker creation and skips full galleries", (t) => {
    const f = fixture(t, ["DEMO-V2-1.png"]);
    installDemoPhotos(f.options);
    assert.equal(f.get().length, 4);
    const full = fixture(t, Array.from({ length: 18 }, (_, i) => `client-${i}.jpg`));
    installDemoPhotos(full.options);
    assert.equal(full.get().length, 18);
});

test("normal packages without demo assets leave user data untouched", (t) => {
    const f = fixture(t);
    fs.rmSync(f.directory, { recursive: true });
    installDemoPhotos(f.options);
    assert.equal(fs.existsSync(f.options.userDataPath), false);
});
