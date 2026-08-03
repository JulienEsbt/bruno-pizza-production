import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

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
import { detectImageType } from "./imageFileValidation.js";

export class PizzaImageError extends Error {
    readonly status: 400 | 404;

    constructor(
        message: string,
        status: 400 | 404 = 400,
    ) {
        super(message);
        this.name = "PizzaImageError";
        this.status = status;
    }
}

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
        throw new PizzaImageError(
            "Pizza introuvable.",
            404,
        );
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

const sanitizeOriginalName = (
    originalName: string,
): string => {
    return path
        .basename(originalName)
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .slice(0, 255);
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

    const detectedImageType =
        detectImageType(file.buffer);

    if (!detectedImageType) {
        throw new PizzaImageError(
            "Le contenu du fichier ne correspond pas à une image JPEG, PNG ou WebP valide.",
        );
    }

    if (!file.buffer.length || file.size <= 0) {
        throw new PizzaImageError(
            "Le fichier envoyé est vide.",
        );
    }

    ensureImagesDirectory();

    const previousImage =
        getPizzaImage(pizzaId);

    const filename =
        `${pizzaId}${detectedImageType.extension}`;

    const filePath = path.join(
        config.pizzaImagesDirectory,
        filename,
    );

    const temporaryPath = path.join(
        config.pizzaImagesDirectory,
        `${pizzaId}-${randomUUID()}.upload`,
    );

    const backupPath = path.join(
        config.pizzaImagesDirectory,
        `${pizzaId}-${randomUUID()}.backup`,
    );

    const hadExistingTarget =
        fs.existsSync(filePath);

    fs.writeFileSync(
        temporaryPath,
        file.buffer,
        {
            flag: "wx",
            mode: 0o600,
        },
    );

    let imageSaved = false;

    try {
        if (hadExistingTarget) {
            fs.renameSync(
                filePath,
                backupPath,
            );
        }

        fs.renameSync(
            temporaryPath,
            filePath,
        );

        try {
            upsertPizzaImage({
                pizzaId,
                filename,
                mimeType:
                    detectedImageType.mimeType,
                originalName:
                    sanitizeOriginalName(
                        file.originalname,
                    ),
                sizeBytes: file.buffer.length,
            });
        } catch (error) {
            removeStoredFile(filename);

            if (hadExistingTarget) {
                fs.renameSync(
                    backupPath,
                    filePath,
                );
            }

            throw error;
        }

        if (
            previousImage &&
            previousImage.filename !== filename
        ) {
            removeStoredFile(
                previousImage.filename,
            );
        }
        imageSaved = true;
    } catch (error) {
        if (
            fs.existsSync(backupPath) &&
            !fs.existsSync(filePath)
        ) {
            fs.renameSync(
                backupPath,
                filePath,
            );
        }

        throw error;
    } finally {
        if (fs.existsSync(temporaryPath)) {
            fs.unlinkSync(temporaryPath);
        }

        if (
            imageSaved &&
            fs.existsSync(backupPath)
        ) {
            fs.unlinkSync(backupPath);
        }
    }

    const savedImage =
        getPizzaImage(pizzaId);

    if (!savedImage) {
        throw new PizzaImageError(
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

    removePizzaImage(pizzaId);
    removeStoredFile(image.filename);
};

export const preparePizzaImageFileCleanup = (
    pizzaId: string,
): (() => void) => {
    const image = getPizzaImage(pizzaId);

    return () => {
        if (image) {
            removeStoredFile(image.filename);
        }
    };
};
