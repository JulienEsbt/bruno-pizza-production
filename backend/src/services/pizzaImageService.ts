import fs from "node:fs";
import path from "node:path";

import { config } from "../config.js";

import {
    getPizzaImage,
    removePizzaImage,
    upsertPizzaImage,
    type PizzaImageRecord,
} from "../repositories/pizzaImageRepository.js";

import {
    pizzaExists,
} from "../repositories/catalogRepository.js";

const MIME_TYPE_EXTENSIONS: Record<
    string,
    string
> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const ensureImagesDirectory = (): void => {
    fs.mkdirSync(
        config.pizzaImagesDirectory,
        {
            recursive: true,
        },
    );
};

const assertPizzaExists = (
    pizzaId: string,
): void => {
    if (!pizzaExists(pizzaId)) {
        throw new Error("Pizza introuvable.");
    }
};

const removeStoredFile = (
    filename: string,
): void => {
    const filePath = path.join(
        config.pizzaImagesDirectory,
        filename,
    );

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

export interface PizzaImageUpload {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
}

export const savePizzaImage = (
    pizzaId: string,
    file: PizzaImageUpload,
): PizzaImageRecord => {
    assertPizzaExists(pizzaId);

    const extension =
        MIME_TYPE_EXTENSIONS[file.mimetype];

    if (!extension) {
        throw new Error(
            "Le fichier doit être une image JPEG, PNG ou WebP.",
        );
    }

    if (!file.buffer.length || file.size <= 0) {
        throw new Error(
            "Le fichier envoyé est vide.",
        );
    }

    ensureImagesDirectory();

    const previousImage =
        getPizzaImage(pizzaId);

    const filename = `${pizzaId}${extension}`;

    const filePath = path.join(
        config.pizzaImagesDirectory,
        filename,
    );

    fs.writeFileSync(
        filePath,
        file.buffer,
    );

    if (
        previousImage &&
        previousImage.filename !== filename
    ) {
        removeStoredFile(
            previousImage.filename,
        );
    }

    upsertPizzaImage({
        pizzaId,
        filename,
        mimeType: file.mimetype,
        originalName: file.originalname,
        sizeBytes: file.size,
    });

    const savedImage =
        getPizzaImage(pizzaId);

    if (!savedImage) {
        throw new Error(
            "Impossible d’enregistrer la photo de la pizza.",
        );
    }

    return savedImage;
};

export const findPizzaImage = (
    pizzaId: string,
): PizzaImageRecord | undefined => {
    assertPizzaExists(pizzaId);

    return getPizzaImage(pizzaId);
};

export const getPizzaImageFilePath = (
    image: PizzaImageRecord,
): string => {
    return path.join(
        config.pizzaImagesDirectory,
        image.filename,
    );
};

export const deletePizzaImage = (
    pizzaId: string,
): void => {
    assertPizzaExists(pizzaId);

    const image = getPizzaImage(pizzaId);

    if (!image) {
        return;
    }

    removeStoredFile(image.filename);
    removePizzaImage(pizzaId);
};
