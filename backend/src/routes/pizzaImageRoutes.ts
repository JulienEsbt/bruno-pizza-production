import fs from "node:fs";

import {
    Router,
    type Response,
} from "express";

import multer from "multer";

import {
    deletePizzaImage,
    findPizzaImage,
    getPizzaImageFilePath,
    savePizzaImage,
} from "../services/pizzaImageService.js";

const MAX_IMAGE_SIZE =
    8 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
    },

    fileFilter: (
        _request,
        file,
        callback,
    ) => {
        const acceptedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !acceptedMimeTypes.includes(
                file.mimetype,
            )
        ) {
            callback(
                new Error(
                    "Le fichier doit être une image JPEG, PNG ou WebP.",
                ),
            );

            return;
        }

        callback(null, true);
    },
});

export const pizzaImageRouter = Router();

const sendImageError = (
    response: Response,
    error: unknown,
): void => {
    console.error(
        "Erreur photo pizza :",
        error,
    );

    const message =
        error instanceof Error
            ? error.message
            : "Erreur inconnue lors de la gestion de la photo.";

    if (message === "Pizza introuvable.") {
        response.status(404).json({
            error: message,
        });

        return;
    }

    if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
    ) {
        response.status(413).json({
            error:
                "La photo ne peut pas dépasser 8 Mo.",
        });

        return;
    }

    response.status(400).json({
        error: message,
    });
};

pizzaImageRouter.get(
    "/:pizzaId/image",
    (request, response) => {
        try {
            const image = findPizzaImage(
                request.params.pizzaId,
            );

            if (!image) {
                response.status(404).json({
                    error:
                        "Aucune photo n’est configurée pour cette pizza.",
                });

                return;
            }

            const filePath =
                getPizzaImageFilePath(image);

            if (!fs.existsSync(filePath)) {
                response.status(404).json({
                    error:
                        "Le fichier de la photo est introuvable.",
                });

                return;
            }

            response.setHeader(
                "Content-Type",
                image.mimeType,
            );

            response.setHeader(
                "Cache-Control",
                "public, max-age=3600",
            );

            response.sendFile(filePath);
        } catch (error) {
            sendImageError(
                response,
                error,
            );
        }
    },
);

pizzaImageRouter.put(
    "/:pizzaId/image",
    (request, response, next) => {
        upload.single("image")(
            request,
            response,
            (error) => {
                if (error) {
                    sendImageError(
                        response,
                        error,
                    );

                    return;
                }

                next();
            },
        );
    },
    (request, response) => {
        try {
            if (!request.file) {
                response.status(400).json({
                    error:
                        "Aucune image n’a été envoyée.",
                });

                return;
            }

            const image = savePizzaImage(
                request.params.pizzaId,
                request.file,
            );

            response.json({
                pizzaId: image.pizzaId,
                originalName:
                    image.originalName,
                mimeType: image.mimeType,
                sizeBytes: image.sizeBytes,
                updatedAt: image.updatedAt,
            });
        } catch (error) {
            sendImageError(
                response,
                error,
            );
        }
    },
);

pizzaImageRouter.delete(
    "/:pizzaId/image",
    (request, response) => {
        try {
            deletePizzaImage(
                request.params.pizzaId,
            );

            response.status(204).send();
        } catch (error) {
            sendImageError(
                response,
                error,
            );
        }
    },
);
