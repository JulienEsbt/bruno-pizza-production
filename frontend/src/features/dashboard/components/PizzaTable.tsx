import type { PizzaProduction } from "../../../types/production";

interface PizzaTableProps {
    pizzas: PizzaProduction[];
}

export default function PizzaTable({
    pizzas,
}: PizzaTableProps) {
    if (pizzas.length === 0) {
        return (
            <section className="pizza-table pizza-table--empty">
                <h2>Aucune pizza à produire</h2>

                <p>
                    La production du jour ne contient aucune
                    quantité.
                </p>
            </section>
        );
    }

    const totalQuantity = pizzas.reduce(
        (total, pizza) => total + pizza.quantity,
        0,
    );

    return (
        <section className="pizza-table">
            <div className="pizza-table__header">
                <h2>Détail de la production</h2>

                <span>{pizzas.length} recettes</span>
            </div>

            <div className="pizza-table__content">
                {pizzas.map((pizza) => (
                    <div
                        className="pizza-table__row"
                        key={pizza.id}
                    >
                        <div>
                            <strong className="pizza-table__pizza-name">
                                {pizza.name}
                            </strong>

                            <span className="pizza-table__pizza-details">
                                {pizza.ingredients.length} ingrédient
                                {pizza.ingredients.length > 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        <div className="pizza-table__quantity">
                            <strong>{pizza.quantity}</strong>
                            <span>pizzas</span>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="pizza-table__footer">
                <span>Total</span>

                <strong>{totalQuantity} pizzas</strong>
            </footer>
        </section>
    );
}