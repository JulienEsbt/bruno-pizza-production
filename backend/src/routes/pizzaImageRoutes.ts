import fs from "node:fs";

import {
    Router,
    type Response,
} from "express";

import multer from "multer";

import {
    deletePizzaImage,
    findPizzaImages, savePizzaImages, reorderPizzaImages, MAX_IMAGE_SIZE, MAX_PIZZA_IMAGES,
    findPizzaImage,
    getPizzaImageFilePath,
    PizzaImageError,
    savePizzaImage,
} from "../services/pizzaImageService.js";

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: MAX_PIZZA_IMAGES,
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
                new PizzaImageError(
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

    if (error instanceof multer.MulterError) {
        response.status(400).json({error: "Trop de fichiers ou champ d’envoi invalide (20 images maximum)."});
        return;
    }
    if (error instanceof PizzaImageError) {
        response.status(error.status).json({
            error: error.message,
        });
        return;
    }

    response.status(500).json({
        error:
            "Une erreur interne est survenue pendant la gestion de la photo.",
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
                "private, no-cache",
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

// Public metadata never exposes the internal storage filename.
const galleryResponse = (pizzaId: string) => findPizzaImages(pizzaId).map(({filename: _filename, ...image}) => image);

pizzaImageRouter.get("/:pizzaId/images", (request, response) => {
    try {
        response.setHeader("Cache-Control", "no-store");
        response.json(galleryResponse(request.params.pizzaId));
    } catch (error) { sendImageError(response, error); }
});
pizzaImageRouter.get("/:pizzaId/images/:imageId", (request, response) => {
    try {
        const image = findPizzaImages(request.params.pizzaId).find((item) => item.id === request.params.imageId);
        if (!image || !fs.existsSync(getPizzaImageFilePath(image))) throw new PizzaImageError("Image introuvable.", 404);
        response.setHeader("Content-Type", image.mimeType);
        response.setHeader("Cache-Control", "private, no-cache");
        response.sendFile(getPizzaImageFilePath(image));
    } catch (error) { sendImageError(response, error); }
});
pizzaImageRouter.post("/:pizzaId/images", (request, response) => {
    upload.array("images", MAX_PIZZA_IMAGES)(request, response, (error) => {
        if (error) { sendImageError(response, error); return; }
        try {
            savePizzaImages(request.params.pizzaId, Array.isArray(request.files) ? request.files : []);
            response.status(201).json(galleryResponse(request.params.pizzaId));
        } catch (saveError) { sendImageError(response, saveError); }
    });
});
pizzaImageRouter.put("/:pizzaId/images/order", (request, response) => {
    try {
        reorderPizzaImages(request.params.pizzaId, request.body?.imageIds);
        response.json(galleryResponse(request.params.pizzaId));
    } catch (error) { sendImageError(response, error); }
});
pizzaImageRouter.delete("/:pizzaId/images/:imageId", (request, response) => {
    try {
        deletePizzaImage(request.params.pizzaId, request.params.imageId);
        response.json(galleryResponse(request.params.pizzaId));
    } catch (error) { sendImageError(response, error); }
});
