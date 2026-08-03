import {
    useRef,
    useState,
} from "react";

import {
    deletePizzaImage,
    getPizzaImageUrl,
    uploadPizzaImage,
} from "../services/pizzaImageApi";

import "./PizzaImageEditor.css";

interface PizzaImageEditorProps {
    pizzaId: string;
    pizzaName: string;
    initialHasImage: boolean;
    onImageChange?: (
        version: number | null,
    ) => void;
}

export default function PizzaImageEditor({
    pizzaId,
    pizzaName,
    initialHasImage,
    onImageChange,
}: PizzaImageEditorProps) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    const [version, setVersion] =
        useState(() => Date.now());

    const [hasImage, setHasImage] =
        useState(initialHasImage);

    const [isSaving, setIsSaving] =
        useState(false);

    const [error, setError] = useState<
        string | null
    >(null);

    const handleSelectImage = async (
        file: File | undefined,
    ): Promise<void> => {
        if (!file) {
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await uploadPizzaImage(
                pizzaId,
                file,
            );

            const nextVersion = Date.now();
            setHasImage(true);
            setVersion(nextVersion);
            onImageChange?.(nextVersion);
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : "Impossible d’envoyer la photo.",
            );
        } finally {
            setIsSaving(false);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const handleDeleteImage =
        async (): Promise<void> => {
            if (
                !window.confirm(
                    `Supprimer la photo de « ${pizzaName} » ?`,
                )
            ) {
                return;
            }

            try {
                setIsSaving(true);
                setError(null);

                await deletePizzaImage(pizzaId);

                const nextVersion = Date.now();
                setHasImage(false);
                setVersion(nextVersion);
                onImageChange?.(null);
            } catch (deleteError) {
                setError(
                    deleteError instanceof Error
                        ? deleteError.message
                        : "Impossible de supprimer la photo.",
                );
            } finally {
                setIsSaving(false);
            }
        };

    return (
        <div className="pizza-image-editor">
            <input
                ref={inputRef}
                className="pizza-image-editor__input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isSaving}
                onChange={(event) =>
                    void handleSelectImage(
                        event.target.files?.[0],
                    )
                }
            />

            <button
                className={[
                    "pizza-image-editor__preview",
                    hasImage
                        ? "pizza-image-editor__preview--filled"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                type="button"
                disabled={isSaving}
                title={
                    hasImage
                        ? `Remplacer la photo de ${pizzaName}`
                        : `Ajouter une photo à ${pizzaName}`
                }
                onClick={() =>
                    inputRef.current?.click()
                }
            >
                {hasImage ? (
                    <img
                        src={getPizzaImageUrl(
                            pizzaId,
                            version,
                        )}
                        alt={`Photo de ${pizzaName}`}
                        onLoad={() =>
                            setHasImage(true)
                        }
                        onError={() =>
                            setHasImage(false)
                        }
                    />
                ) : (
                    <>
                        <span aria-hidden="true">
                            ◎
                        </span>

                        <small>
                            {isSaving
                                ? "Envoi…"
                                : "Photo"}
                        </small>
                    </>
                )}

                {isSaving && (
                    <span className="pizza-image-editor__loading">
                        …
                    </span>
                )}
            </button>

            <div className="pizza-image-editor__actions">
                <button
                    type="button"
                    disabled={isSaving}
                    title={
                        hasImage
                            ? "Remplacer la photo"
                            : "Ajouter une photo"
                    }
                    onClick={() =>
                        inputRef.current?.click()
                    }
                >
                    {hasImage
                        ? "Remplacer"
                        : "Ajouter une photo"}
                </button>

                {hasImage && (
                    <button
                        className="pizza-image-editor__delete"
                        type="button"
                        disabled={isSaving}
                        title="Supprimer la photo"
                        aria-label={`Supprimer la photo de ${pizzaName}`}
                        onClick={() =>
                            void handleDeleteImage()
                        }
                    >
                        ×
                    </button>
                )}
            </div>

            {error && (
                <small className="pizza-image-editor__error">
                    {error}
                </small>
            )}
        </div>
    );
}
