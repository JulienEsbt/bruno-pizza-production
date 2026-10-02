import fs from "node:fs";
import path from "node:path";

// Only test packages include this directory. Never replace an existing photo.
export function installDemoPhotos({ appPath, userDataPath, findPizzaImages, savePizzaImages }) {
    const directory = path.join(appPath, "desktop", "demo-images");
    const marker = path.join(userDataPath, "data", "demo-reine-v2.json");
    if (!fs.existsSync(directory) || fs.existsSync(marker)) return;
    const previous = findPizzaImages("reine");
    const files = fs.readdirSync(directory).filter((name) => /^DEMO-V2-.*\.png$/.test(name)).sort();
    if (files.length !== 4) throw new Error("Les quatre photos de démonstration sont requises.");
    // Avoid duplicates if an earlier launch saved the images but not the marker.
    const missing = files.filter((name) => !previous.some((image) => image.originalName === name));
    const status = previous.length + missing.length > 20 ? "skipped-full-gallery" : "installed";
    if (status === "installed" && missing.length) {
        savePizzaImages("reine", missing.map((name) => {
            const buffer = fs.readFileSync(path.join(directory, name));
            return { buffer, size: buffer.length, mimetype: "image/png", originalname: name };
        }));
    }
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, JSON.stringify({ status, date: new Date().toISOString() }) + "\n", { mode: 0o600 });
}
