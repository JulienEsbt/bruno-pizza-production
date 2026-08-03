import type { ProductionSettings } from "../../../types/settings";

export const updatePizzaImageUpdatedAt = (
    settings: ProductionSettings,
    pizzaId: string,
    imageUpdatedAt: string | null,
): ProductionSettings => ({
    ...settings,
    pizzas: settings.pizzas.map((pizza) => {
        if (pizza.id !== pizzaId) {
            return pizza;
        }

        if (imageUpdatedAt) {
            return {
                ...pizza,
                imageUpdatedAt,
            };
        }

        const pizzaWithoutImage = { ...pizza };
        delete pizzaWithoutImage.imageUpdatedAt;

        return pizzaWithoutImage;
    }),
});
