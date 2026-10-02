import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { getPizzaImage, getPizzaImages, replacePizzaImages, type PizzaImageRecord } from "../repositories/pizzaImageRepository.js";
import { pizzaExists } from "../repositories/catalogRepository.js";
import { detectImageType } from "./imageFileValidation.js";

export const MAX_PIZZA_IMAGES = 20;
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export class PizzaImageError extends Error {
    constructor(message: string, readonly status: 400 | 404 | 409 = 400) {
        super(message); this.name = "PizzaImageError";
    }
}
const assertPizzaExists = (pizzaId: string): void => {
    if (!pizzaExists(pizzaId)) throw new PizzaImageError("Pizza introuvable.", 404);
};
const removeStoredFile = (filename: string): void => {
    try { fs.rmSync(path.join(config.pizzaImagesDirectory, filename), {force: true}); }
    catch (error) { console.warn("Photo retirée du catalogue, nettoyage du fichier à reprendre :", filename, error); }
};
const sanitizeOriginalName = (name: string): string =>
    path.basename(name.replaceAll("\\", "/")).replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255);

export interface PizzaImageUpload {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
}

export function savePizzaImages(
    pizzaId: string, files: PizzaImageUpload[], replaceFinal = false,
): PizzaImageRecord[] {
    assertPizzaExists(pizzaId);
    const previous = getPizzaImages(pizzaId);
    if (!files.length) throw new PizzaImageError("Aucune image n’a été envoyée.");
    if (previous.length + files.length - (replaceFinal && previous.length ? 1 : 0) > MAX_PIZZA_IMAGES) {
        throw new PizzaImageError(`Une pizza peut contenir au maximum ${MAX_PIZZA_IMAGES} images.`);
    }
    // Validate the whole batch before creating files; one invalid image rejects all.
    const uploads = [...files].sort((a, b) =>
        a.originalname.localeCompare(b.originalname, "fr", {numeric: true, sensitivity: "base"}),
    ).map((file) => {
        const detected = detectImageType(file.buffer);
        if (!detected || !file.buffer.length || file.buffer.length > MAX_IMAGE_SIZE) {
            throw new PizzaImageError("Chaque fichier doit être une image JPEG, PNG ou WebP valide de 8 Mo maximum.");
        }
        const id = randomUUID();
        const record: PizzaImageRecord = {
            id, pizzaId, filename: `${id}${detected.extension}`, mimeType: detected.mimeType,
            originalName: sanitizeOriginalName(file.originalname), sizeBytes: file.buffer.length,
            updatedAt: new Date().toISOString(),
        };
        return {file, record};
    });
    fs.mkdirSync(config.pizzaImagesDirectory, {recursive: true});
    const created: string[] = [];
    try {
        for (const {file, record} of uploads) {
            const fd = fs.openSync(path.join(config.pizzaImagesDirectory, record.filename), "wx", 0o600);
            created.push(record.filename);
            try { fs.writeFileSync(fd, file.buffer); }
            finally { fs.closeSync(fd); }
        }
        const added = uploads.map(({record}) => record);
        const next = previous.length
            ? [...previous.slice(0, -1), ...added, ...(replaceFinal ? [] : previous.slice(-1))]
            : added;
        replacePizzaImages(pizzaId, next);
    } catch (error) {
        created.forEach(removeStoredFile);
        throw error;
    }
    if (replaceFinal && previous.length) removeStoredFile(previous.at(-1)!.filename);
    return getPizzaImages(pizzaId);
}

// Compatibility with the original single-photo endpoint: replace only the final frame.
export const savePizzaImage = (pizzaId: string, file: PizzaImageUpload): PizzaImageRecord =>
    savePizzaImages(pizzaId, [file], true).at(-1)!;
export const findPizzaImages = (pizzaId: string): PizzaImageRecord[] => {
    assertPizzaExists(pizzaId); return getPizzaImages(pizzaId);
};
export const findPizzaImage = (pizzaId: string): PizzaImageRecord | undefined => {
    assertPizzaExists(pizzaId); return getPizzaImage(pizzaId);
};
export const getPizzaImageFilePath = (image: PizzaImageRecord): string =>
    path.join(config.pizzaImagesDirectory, image.filename);

export function reorderPizzaImages(pizzaId: string, ids: unknown): PizzaImageRecord[] {
    const current = findPizzaImages(pizzaId);
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string") || new Set(ids).size !== ids.length) {
        throw new PizzaImageError("La liste des images est invalide.");
    }
    if (ids.length !== current.length || ids.some((id) => !current.some((image) => image.id === id))) {
        throw new PizzaImageError("La galerie a changé. Rechargez-la avant de modifier son ordre.", 409);
    }
    const next = ids.map((id) => current.find((image) => image.id === id)!);
    replacePizzaImages(pizzaId, next);
    return next;
}

export function deletePizzaImage(pizzaId: string, imageId?: string): void {
    const images = findPizzaImages(pizzaId);
    if (imageId && !images.some((image) => image.id === imageId)) {
        throw new PizzaImageError("Image introuvable.", 404);
    }
    replacePizzaImages(pizzaId, imageId ? images.filter((image) => image.id !== imageId) : []);
    images.filter((image) => !imageId || image.id === imageId).forEach((image) => removeStoredFile(image.filename));
}
export const preparePizzaImageFileCleanup = (pizzaId: string): (() => void) => {
    const images = getPizzaImages(pizzaId);
    return () => images.forEach((image) => removeStoredFile(image.filename));
};
