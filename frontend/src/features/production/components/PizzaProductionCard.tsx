import type { PizzaProduction } from "../../../types/production";

import {
    getPizzaImageUrl,
} from "../../../services/settings/pizzaImageApi";

import {
    normalizeIngredientName,
    normalizePizzaName,
} from "../../../utils/productionFormatting";

interface PizzaProductionCardProps {
    pizza: PizzaProduction;
    previousPizza?: PizzaProduction;
    nextPizza?: PizzaProduction;
    currentIndex: number;
    totalPizzas: number;
    catalogPizzaId?: string;
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
                <header className="production-sequence__header">
                    <span>Ordre de production</span>

                    <strong>
                        {currentIndex + 1}
                        <small> / {totalPizzas}</small>
                    </strong>
                </header>

                <div className="production-sequence__preview production-sequence__preview--previous">
                    <small>Précédente</small>

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
                    <span>Pizza affichée</span>

                    <h1>
                        {normalizePizzaName(pizza.name)}
                    </h1>

                    <div className="production-sequence__quantity">
                        <strong>{pizza.quantity}</strong>

                        <small>
                            pizza
                            {pizza.quantity > 1 ? "s" : ""}
                            {" "}à produire
                        </small>
                    </div>
                </div>

                <div className="production-sequence__preview production-sequence__preview--next">
                    <small>Suivante</small>

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
                <header className="production-recipe__heading">
                    <div>
                        <span>Recette de la pizza</span>

                        <h2>Ingrédients</h2>
                    </div>

                    <strong>
                        {pizza.ingredients.length}
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

            <section className="production-visual">
                <div className="production-visual__content">
                    {catalogPizzaId ? (
                        <img
                            className="production-visual__image"
                            src={getPizzaImageUrl(
                                catalogPizzaId,
                            )}
                            alt={`Photo de ${normalizePizzaName(
                                pizza.name,
                            )}`}
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    "none";

                                event.currentTarget
                                    .nextElementSibling
                                    ?.removeAttribute(
                                        "hidden",
                                    );
                            }}
                        />
                    ) : null}

                    <div
                        className="production-visual__fallback"
                        hidden={Boolean(
                            catalogPizzaId,
                        )}
                    >
                        <div className="production-visual__placeholder">
                            <span aria-hidden="true">
                                ◎
                            </span>
                        </div>

                        <strong>
                            Visuel de la pizza
                        </strong>

                        <small>
                            Aucune photo n’est configurée
                            pour cette pizza.
                        </small>
                    </div>
                </div>
            </section>
        </article>
    );
}
