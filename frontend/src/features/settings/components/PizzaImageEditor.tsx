import { useEffect, useRef, useState } from "react";
import type { PizzaImage } from "../../../types/pizzaImage";
import {
    getPizzaImages, getPizzaGalleryImageUrl, uploadPizzaImages,
    reorderPizzaImages, removePizzaGalleryImage,
} from "../services/pizzaImageApi";
import "./PizzaImageEditor.css";

interface PizzaImageEditorProps {
    pizzaId: string;
    pizzaName: string;
    onImageChange?: (version: string | number | null) => void;
}

export default function PizzaImageEditor({pizzaId, pizzaName, onImageChange}: PizzaImageEditorProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<PizzaImage[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const inFlight = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        getPizzaImages(pizzaId, controller.signal).then((value) => {
            if (!controller.signal.aborted) { setImages(value); setError(null); }
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Impossible de charger les images.");
        });
        return () => controller.abort();
    }, [pizzaId, retry]);

    const mutate = async (action: () => Promise<PizzaImage[]>): Promise<void> => {
        if (inFlight.current) return;
        inFlight.current = true;
        setIsSaving(true); setError(null); setDeletingId(null);
        try {
            const next = await action();
            setImages(next);
            onImageChange?.(next.length ? next.map((image) => image.id).join("-") : null);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Impossible d’enregistrer les images.");
            // Refetch after an uncertain response (e.g. a timeout after server commit).
            try {
                const current = await getPizzaImages(pizzaId);
                setImages(current); onImageChange?.(current.length ? current.map((image) => image.id).join("-") : null);
            } catch { /* Keep the last known gallery and the actionable error. */ }
        } finally {
            inFlight.current = false; setIsSaving(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };
    const move = (index: number, offset: number): void => {
        if (!images || index + offset < 0 || index + offset >= images.length) return;
        const next = images.map((image) => image.id);
        [next[index], next[index + offset]] = [next[index + offset], next[index]];
        void mutate(() => reorderPizzaImages(pizzaId, next));
    };

    return <div className="pizza-image-editor" aria-busy={isSaving}>
        <p className="pizza-image-editor__help">Ajoutez les étapes dans l’ordre. La dernière image est la pizza terminée. En production, le diaporama démarre automatiquement à la première étape.</p>
        <input ref={inputRef} className="pizza-image-editor__input" type="file" multiple
            aria-label={`Ajouter des images à ${pizzaName}`} accept="image/jpeg,image/png,image/webp" disabled={isSaving || images === null}
            onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length) void mutate(() => uploadPizzaImages(pizzaId, files));
            }} />
        {images === null && !error && <p role="status">Chargement des images…</p>}
        {images?.length === 0 && <p>Aucune image. Ajoutez les photos de montage.</p>}
        {images && images.length > 0 && <ol className="pizza-image-editor__gallery" aria-label={`Images de ${pizzaName}`}>
            {images.map((image, index) => <li key={image.id}>
                <img src={getPizzaGalleryImageUrl(pizzaId, image.id)} alt={`Étape ${index + 1} de ${pizzaName}`} />
                <div className="pizza-image-editor__details">
                    <strong>{index === images.length - 1 ? "Pizza terminée" : `Étape ${index + 1}`}</strong>
                    <span title={image.originalName}>{image.originalName}</span>
                    {deletingId === image.id ? <div className="pizza-image-editor__confirmation" role="group" aria-label="Confirmer le retrait de l’image">
                        <span>Retirer cette image ?</span>
                        <button type="button" onClick={() => setDeletingId(null)}>Annuler</button>
                        <button type="button" disabled={isSaving} onClick={() => void mutate(() => removePizzaGalleryImage(pizzaId, image.id))}>Confirmer le retrait</button>
                    </div> : <div className="pizza-image-editor__actions">
                        <button type="button" disabled={isSaving || index === 0} aria-label={`Avancer l’image ${index + 1}`} title="Déplacer avant"
                            onClick={() => move(index, -1)}>↑</button>
                        <button type="button" disabled={isSaving || index === images.length - 1} aria-label={`Reculer l’image ${index + 1}`} title="Déplacer après"
                            onClick={() => move(index, 1)}>↓</button>
                        <button type="button" disabled={isSaving} aria-label={`Retirer l’image ${index + 1}`} onClick={() => setDeletingId(image.id)}>Retirer</button>
                    </div>}
                </div>
            </li>)}
        </ol>}
        <button type="button" className="pizza-image-editor__add" disabled={isSaving || images === null || images.length >= 20}
            onClick={() => inputRef.current?.click()}>{isSaving ? "Enregistrement…" : "Ajouter des images"}</button>
        <small className="pizza-image-editor__help">{images?.length ?? 0}/20 images · JPEG, PNG, WebP · 8 Mo par image. Tri numérique des nouveaux fichiers (1, 2, 10…). Les ajouts précèdent la photo finale existante.</small>
        {error && <div className="pizza-image-editor__error" role="alert">{error}
            <button type="button" disabled={isSaving} onClick={() => { setError(null); setRetry((value) => value + 1); }}>Recharger la galerie</button>
        </div>}
    </div>;
}
