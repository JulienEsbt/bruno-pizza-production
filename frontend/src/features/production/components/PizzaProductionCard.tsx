import { useState } from "react";

import type { PizzaProduction } from "../../../types/production";

import {
    getPizzaImageUrl,
} from "../../settings/services/pizzaImageApi";

import {
    normalizeIngredientName,
    normalizePizzaName,
} from "../../../utils/productionFormatting";

import "./PizzaProductionCard.css";

interface PizzaProductionCardProps {
    pizza: PizzaProduction;
    previousPizza?: PizzaProduction;
    nextPizza?: PizzaProduction;
    currentIndex: number;
    totalPizzas: number;
    catalogPizzaId?: string;
}

interface PizzaVisualProps {
    catalogPizzaId?: string;
    pizzaName: string;
}

function PizzaVisual({
    catalogPizzaId,
    pizzaName,
}: PizzaVisualProps) {
    const [hasImageError, setHasImageError] =
        useState(!catalogPizzaId);

    return (
        <section className="production-visual">
            <header className="production-panel-heading">
                <div>
                    <span>Contrôle visuel</span>
                    <h2>Visuel de la pizza</h2>
                </div>

                <strong aria-hidden="true">◉</strong>
            </header>

            <div className="production-visual__content">
                {catalogPizzaId && !hasImageError && (
                    <img
                        className="production-visual__image"
                        src={getPizzaImageUrl(
                            catalogPizzaId,
                        )}
                        alt={`Photo de ${normalizePizzaName(
                            pizzaName,
                        )}`}
                        onError={() =>
                            setHasImageError(true)
                        }
                    />
                )}

                {hasImageError && (
                    <div className="production-visual__fallback">
                        <div className="production-visual__placeholder">
                            <span aria-hidden="true">◎</span>
                        </div>
                        <strong>Photo à configurer</strong>
                        <small>
                            Aucune photo n’est configurée
                            pour cette pizza.
                        </small>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function PizzaProductionCard({
    pizza,
    previousPizza,
    nextPizza,
    currentIndex,
    totalPizzas,
    catalogPizzaId,
}: PizzaProductionCardProps) {
    return (
        <article className="production-workspace">
            <aside className="production-sequence">
                <header className="production-panel-heading">
                    <div>
                        <span>Ordre de production</span>
                        <h2>Pizza en cours</h2>
                    </div>

                    <strong className="production-panel-step">
                        {currentIndex + 1}
                        <small>/{totalPizzas}</small>
                    </strong>
                </header>

                <div className="production-sequence__preview production-sequence__preview--previous">
                    <small>
                        <span aria-hidden="true">←</span>
                        Précédente
                    </small>

                    {previousPizza ? (
                        <>
                            <span>
                                {normalizePizzaName(
                                    previousPizza.name,
                                )}
                            </span>

                            <strong>
                                {previousPizza.quantity}
                            </strong>
                        </>
                    ) : (
                        <span>Début de production</span>
                    )}
                </div>

                <div className="production-sequence__current">
                    <span className="production-sequence__live">
                        <i aria-hidden="true" />
                        En cours
                    </span>

                    <h1>
                        {normalizePizzaName(pizza.name)}
                    </h1>

                    <div className="production-sequence__quantity">
                        <strong>{pizza.quantity}</strong>

                        <small>
                            pizza{pizza.quantity > 1 ? "s" : ""}
                            <span>à produire</span>
                        </small>
                    </div>
                </div>

                <div className="production-sequence__preview production-sequence__preview--next">
                    <small>
                        Suivante
                        <span aria-hidden="true">→</span>
                    </small>

                    {nextPizza ? (
                        <>
                            <span>
                                {normalizePizzaName(
                                    nextPizza.name,
                                )}
                            </span>

                            <strong>
                                {nextPizza.quantity}
                            </strong>
                        </>
                    ) : (
                        <span>Fin de production</span>
                    )}
                </div>
            </aside>

            <section className="production-recipe">
                <header className="production-panel-heading">
                    <div>
                        <span>Recette de la pizza</span>

                        <h2>Ingrédients</h2>
                    </div>

                    <strong className="production-recipe__count">
                        {pizza.ingredients.length}
                        <small>étapes</small>
                    </strong>
                </header>

                {pizza.ingredients.length > 0 ? (
                    <ol className="production-ingredient-list">
                        {pizza.ingredients.map(
                            (ingredient, index) => (
                                <li
                                    key={`${ingredient}-${index}`}
                                >
                                    <span>{index + 1}</span>

                                    <strong>
                                        {normalizeIngredientName(
                                            ingredient,
                                        )}
                                    </strong>
                                </li>
                            ),
                        )}
                    </ol>
                ) : (
                    <p className="production-panel__empty">
                        Aucune recette trouvée dans le
                        catalogue pour cette pizza.
                    </p>
                )}
            </section>

            <PizzaVisual
                key={catalogPizzaId ?? pizza.id}
                catalogPizzaId={catalogPizzaId}
                pizzaName={pizza.name}
            />
        </article>
    );
}
