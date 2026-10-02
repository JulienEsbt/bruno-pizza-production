import assert from "node:assert/strict";
import {mkdtempSync, rmSync, readdirSync, readFileSync, existsSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import test, {after} from "node:test";

const dir = mkdtempSync(path.join(tmpdir(), "bruno-gallery-"));
process.env.DATABASE_PATH = path.join(dir, "catalog.sqlite");
process.env.PIZZA_IMAGES_DIRECTORY = path.join(dir, "images");
process.env.FRONTEND_DIST_PATH = path.join(dir, "no-frontend");
const {database, initializeDatabase} = await import("../src/database/database.js");
const {createApp} = await import("../src/app.js");
const {savePizzaImages, findPizzaImages, getPizzaImageFilePath, deletePizzaImage, reorderPizzaImages} = await import("../src/services/pizzaImageService.js");
initializeDatabase();
const server = createApp().listen(0, "127.0.0.1");
await new Promise<void>((resolve, reject) => {server.once("listening", resolve); server.once("error", reject);});
const address = server.address();
if (!address || typeof address === "string") throw new Error("Port unavailable");
const base = `http://127.0.0.1:${address.port}/api/catalog/pizzas`;
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFZkAAAAASUVORK5CYII=", "base64");
const file = (name: string) => ({buffer: png, size: png.length, originalname: name, mimetype: "image/png"});
const names = (id: string) => findPizzaImages(id).map((image) => image.originalName);
after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    database.close(); rmSync(dir, {recursive: true, force: true});
});

test("trie numériquement les étapes et conserve la photo finale existante", () => {
    savePizzaImages("reine", [file("finale.png")]);
    const original = findPizzaImages("reine")[0];
    savePizzaImages("reine", [file("10.png"), file("2.png"), file("1.png")]);
    assert.deepEqual(names("reine"), ["1.png", "2.png", "10.png", "finale.png"]);
    assert.deepEqual(findPizzaImages("reine").at(-1), original);
    assert.deepEqual(readFileSync(getPizzaImageFilePath(original)), png);
});

test("un lot invalide ou trop volumineux ne modifie ni galerie ni fichiers", () => {
    const before = findPizzaImages("reine");
    const filesBefore = readdirSync(path.join(dir, "images")).sort();
    assert.throws(() => savePizzaImages("reine", [file("ok.png"), {...file("bad.png"), buffer: Buffer.from("not an image")}]), /valide/);
    assert.throws(() => savePizzaImages("reine", Array.from({length: 21}, (_, i) => file(`${i}.png`))), /maximum/);
    assert.throws(() => savePizzaImages("absente", [file("1.png")]), /introuvable/);
    assert.deepEqual(findPizzaImages("reine"), before);
    assert.deepEqual(readdirSync(path.join(dir, "images")).sort(), filesBefore);
});

test("un échec SQLite annule le lot et nettoie uniquement les fichiers nouvellement écrits", () => {
    const before = findPizzaImages("reine");
    const filesBefore = readdirSync(path.join(dir, "images")).sort();
    database.exec(`CREATE TRIGGER fail_gallery BEFORE INSERT ON pizza_images
        WHEN NEW.original_name = 'db-fail.png' BEGIN SELECT RAISE(ABORT, 'simulated disk failure'); END;`);
    try { assert.throws(() => savePizzaImages("reine", [file("db-fail.png")]), /simulated/); }
    finally {database.exec("DROP TRIGGER fail_gallery");}
    assert.deepEqual(findPizzaImages("reine"), before);
    assert.deepEqual(readdirSync(path.join(dir, "images")).sort(), filesBefore);
    before.forEach((image) => assert.deepEqual(readFileSync(getPizzaImageFilePath(image)), png));
});

test("l'ordre est persistant et refuse doublons, images étrangères et galerie périmée", () => {
    const current = findPizzaImages("reine");
    const reversed = current.map((image) => image.id).reverse();
    reorderPizzaImages("reine", reversed);
    assert.deepEqual(findPizzaImages("reine").map((image) => image.id), reversed);
    assert.throws(() => reorderPizzaImages("reine", [reversed[0], reversed[0]]), /invalide/);
    assert.throws(() => reorderPizzaImages("reine", reversed.slice(1)), /galerie a changé/);
    assert.throws(() => reorderPizzaImages("reine", ["foreign", ...reversed.slice(1)]), /galerie a changé/);
    assert.deepEqual(findPizzaImages("reine").map((image) => image.id), reversed);
    initializeDatabase();
    assert.deepEqual(findPizzaImages("reine").map((image) => image.id), reversed);
});

test("le retrait de la finale promeut l'image précédente et ne retire pas les autres fichiers", () => {
    const current = findPizzaImages("reine");
    const final = current.at(-1)!;
    deletePizzaImage("reine", final.id);
    assert.equal(existsSync(getPizzaImageFilePath(final)), false);
    assert.deepEqual(findPizzaImages("reine"), current.slice(0, -1));
    current.slice(0, -1).forEach((image) => assert.equal(existsSync(getPizzaImageFilePath(image)), true));
});

test("les routes HTTP permettent le cycle complet et ne doublonnent pas les pizzas du catalogue", async () => {
    const data = new FormData();
    data.append("images", new Blob([png], {type: "image/png"}), "2.png");
    data.append("images", new Blob([png], {type: "image/png"}), "1.png");
    const upload = await fetch(`${base}/royale/images`, {method: "POST", body: data});
    assert.equal(upload.status, 201);
    const images = await upload.json() as Array<{id: string; originalName: string; filename?: string}>;
    assert.deepEqual(images.map((image) => image.originalName), ["1.png", "2.png"]);
    assert.equal(images[0].filename, undefined);
    const list = await fetch(`${base}/royale/images`);
    assert.equal(list.headers.get("cache-control"), "no-store");
    assert.deepEqual(await list.json(), images);
    const frame = await fetch(`${base}/royale/images/${images[0].id}`);
    assert.equal(frame.status, 200);
    assert.equal(frame.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await frame.arrayBuffer()), png);
    assert.equal((await fetch(`${base}/reine/images/${images[0].id}`)).status, 404);
    const order = await fetch(`${base}/royale/images/order`, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({imageIds: images.map((image) => image.id).reverse()})});
    assert.equal(order.status, 200);
    const legacy = await fetch(`${base}/royale/image`);
    assert.equal(legacy.status, 200);
    const catalog = await (await fetch(base.replace('/pizzas', ''))).json() as {pizzas: {id: string; imageUpdatedAt?: string}[]};
    assert.equal(catalog.pizzas.filter((pizza) => pizza.id === "royale").length, 1);
    assert.ok(catalog.pizzas.find((pizza) => pizza.id === "royale")?.imageUpdatedAt);
    const deletion = await fetch(`${base}/royale/images/${images[0].id}`, {method: "DELETE"});
    assert.equal(deletion.status, 200);
    assert.equal((await deletion.json() as unknown[]).length, 1);
    await fetch(`${base}/royale/images/${images[1].id}`, {method: "DELETE"});
    assert.deepEqual(await (await fetch(`${base}/royale/images`)).json(), []);
    assert.equal((await fetch(`${base}/royale/image`)).status, 404);
});

test("refuse les corps et fichiers invalides par HTTP en préservant la galerie", async () => {
    const before = findPizzaImages("reine");
    assert.equal((await fetch(`${base}/reine/images/order`, {method: "PUT", headers: {"Content-Type": "application/json"}, body: '{"imageIds":[]}'})).status, 409);
    const form = new FormData(); form.append("images", new Blob(["bad"], {type: "image/png"}), "bad.png");
    assert.equal((await fetch(`${base}/reine/images`, {method: "POST", body: form})).status, 400);
    assert.deepEqual(findPizzaImages("reine"), before);
});

test("l'ancien endpoint remplace la finale sans perdre les étapes", async () => {
    savePizzaImages("burger", [file("1.png"), file("2.png")]);
    const before = findPizzaImages("burger");
    const data = new FormData(); data.append("image", new Blob([png], {type: "image/png"}), "nouvelle-finale.png");
    assert.equal((await fetch(`${base}/burger/image`, {method: "PUT", body: data})).status, 200);
    assert.deepEqual(names("burger"), ["1.png", "nouvelle-finale.png"]);
    assert.equal(findPizzaImages("burger")[0].id, before[0].id);
    assert.equal(existsSync(getPizzaImageFilePath(before[1])), false);
});

test("supprimer une pizza nettoie toutes ses étapes sans toucher aux autres pizzas", async () => {
    const removed = findPizzaImages("burger");
    const preserved = findPizzaImages("reine");
    assert.equal((await fetch(`${base}/burger`, {method: "DELETE"})).status, 200);
    removed.forEach((image) => assert.equal(existsSync(getPizzaImageFilePath(image)), false));
    preserved.forEach((image) => assert.equal(existsSync(getPizzaImageFilePath(image)), true));
    assert.equal(database.prepare("SELECT count(*) AS count FROM pizza_images WHERE pizza_id = 'burger'").get()?.count, 0);
});
