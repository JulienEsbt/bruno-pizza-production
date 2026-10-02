import { useEffect, useReducer, useState } from "react";
import type { PizzaImage } from "../../../types/pizzaImage";
import { getPizzaImages, getPizzaGalleryImageUrl } from "../../settings/services/pizzaImageApi";
import { createSlideshowState, slideshowReducer, SLIDESHOW_SPEEDS, normalizeSlideshowSpeed } from "../domain/slideshow";
import "./PizzaVisual.css";

const SPEED_STORAGE_KEY = "bruno-pizza-slideshow-seconds";
const readSpeed = (): number => {
    try { return normalizeSlideshowSpeed(Number(localStorage.getItem(SPEED_STORAGE_KEY))); }
    catch { return 3; }
};

function GalleryPlayer({images, pizzaId, pizzaName}: {images: PizzaImage[]; pizzaId: string; pizzaName: string}) {
    const [state, dispatch] = useReducer(slideshowReducer, images.length, createSlideshowState);
    const [seconds, setSeconds] = useState(readSpeed);
    const [loadedId, setLoadedId] = useState<string | null>(null);
    const [failedId, setFailedId] = useState<string | null>(null);
    const current = images[state.index];
    const hasError = failedId === current.id;
    useEffect(() => {
        if (!state.playing || loadedId !== current.id || hasError) return;
        const timer = window.setTimeout(() => dispatch("tick"), seconds * 1000);
        return () => window.clearTimeout(timer);
    }, [state.playing, loadedId, current.id, seconds, hasError]);

    return <>
        <div className="production-visual__content">
            {hasError ? <p className="production-panel__empty" role="alert">Image indisponible. Vérifiez cette étape dans les paramètres ou passez à une autre image.</p> : <img
                key={current.id} className="production-visual__image"
                src={getPizzaGalleryImageUrl(pizzaId, current.id)}
                alt={`${pizzaName} — ${state.index === images.length - 1 ? "pizza terminée" : `étape ${state.index + 1}`}`}
                onLoad={() => setLoadedId(current.id)}
                onError={() => { setFailedId(current.id); dispatch("pause"); }} />}
        </div>
        <div className="pizza-slideshow">
            <div className="pizza-slideshow__status" role="status">
                {state.index === images.length - 1 ? "Pizza terminée" : `Étape ${state.index + 1}`} · {state.index + 1}/{images.length}
                {state.playing ? " · Lecture" : " · Image fixe"}
            </div>
            {images.length > 1 && <div className="pizza-slideshow__controls">
                <button type="button" aria-label="Image précédente" disabled={state.index === 0} onClick={() => dispatch("previous")}>‹</button>
                <button type="button" className="pizza-slideshow__play" disabled={hasError}
                    onClick={() => dispatch("toggle")}>{state.playing ? "Ⅱ Pause" : "▶ Lire les étapes"}</button>
                <button type="button" aria-label="Image suivante" disabled={state.index === images.length - 1} onClick={() => dispatch("next")}>›</button>
                <label>Vitesse <select aria-label="Durée par image" value={seconds} onChange={(event) => {
                    const value = normalizeSlideshowSpeed(Number(event.target.value));
                    setSeconds(value);
                    try { localStorage.setItem(SPEED_STORAGE_KEY, String(value)); } catch { /* Preference remains usable for this session. */ }
                }}>{SLIDESHOW_SPEEDS.map((speed) => <option key={speed} value={speed}>{speed} s</option>)}</select></label>
                <button type="button" onClick={() => dispatch("final")}>Image finale</button>
            </div>}
        </div>
    </>;
}

export default function PizzaVisual({catalogPizzaId, pizzaName}: {catalogPizzaId?: string; pizzaName: string}) {
    const [images, setImages] = useState<PizzaImage[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        if (!catalogPizzaId) return;
        const controller = new AbortController();
        getPizzaImages(catalogPizzaId, controller.signal).then((result) => {
            if (!controller.signal.aborted) { setImages(result); setError(null); }
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Impossible de charger les images.");
        });
        return () => controller.abort();
    }, [catalogPizzaId, retry]);
    return <section className="production-visual production-visual--gallery">
        <header className="production-panel-heading"><div><span>Contrôle visuel</span><h2>Visuel de la pizza</h2></div><strong aria-hidden="true">◉</strong></header>
        {catalogPizzaId && images && images.length > 0 ? <GalleryPlayer images={images} pizzaId={catalogPizzaId} pizzaName={pizzaName} /> : <div className="production-visual__content">
            <div className="production-visual__fallback">
                <div className="production-visual__placeholder"><span aria-hidden="true">◎</span></div>
                {error ? <><strong>Images indisponibles</strong><small role="alert">{error}</small>
                    <button type="button" onClick={() => {setError(null); setRetry((value) => value + 1);}}>Réessayer</button></>
                    : catalogPizzaId && images === null ? <strong role="status">Chargement des images…</strong>
                    : <><strong>Photos à configurer</strong><small>Aucune photo n’est configurée pour cette pizza.</small></>}
            </div>
        </div>}
    </section>;
}
