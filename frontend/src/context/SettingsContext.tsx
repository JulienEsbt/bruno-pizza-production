/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    createDistributor as createDistributorFromApi,
    deleteDistributor as deleteDistributorFromApi,
    createIngredient as createIngredientFromApi,
    createPizza as createPizzaFromApi,
    deleteIngredient as deleteIngredientFromApi,
    deletePizza as deletePizzaFromApi,
    getCatalog,
    updateDistributor as updateDistributorFromApi,
    updateIngredient as updateIngredientFromApi,
    updatePizza as updatePizzaFromApi,
} from "../features/settings/services/settingsApi";
import { updatePizzaImageUpdatedAt } from "../features/settings/domain/imageCatalogState";

import type {
    CreateDistributorInput,
    CreatePizzaInput,
    DistributorCatalogUpdate,
    IngredientCatalogUpdate,
    PizzaCatalogUpdate,
    ProductionSettings,
} from "../types/settings";

const EMPTY_SETTINGS: ProductionSettings = {
    ingredients: [],
    pizzas: [],
    distributors: [],
};

interface SettingsContextValue {
    settings: ProductionSettings;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    reloadSettings: () => Promise<void>;

    addIngredient: (
        ingredientName: string,
    ) => Promise<void>;

    updateIngredient: (
        ingredientId: string,
        update: IngredientCatalogUpdate,
    ) => Promise<void>;

    deleteIngredient: (
        ingredientId: string,
    ) => Promise<void>;

    addPizza: (
        input: CreatePizzaInput,
    ) => Promise<void>;

    updatePizza: (
        pizzaId: string,
        update: PizzaCatalogUpdate,
    ) => Promise<void>;

    deletePizza: (
        pizzaId: string,
    ) => Promise<void>;

    addDistributor: (
        input: CreateDistributorInput,
    ) => Promise<void>;

    updateDistributor: (
        distributorId: string,
        update: DistributorCatalogUpdate,
    ) => Promise<void>;

    deleteDistributor: (
        distributorId: string,
    ) => Promise<void>;

    setPizzaImageUpdatedAt: (
        pizzaId: string,
        imageUpdatedAt: string | null,
    ) => void;

    clearError: () => void;
}

export const SettingsContext =
    createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
    children: ReactNode;
}

const getErrorMessage = (
    error: unknown,
): string => {
    return error instanceof Error
        ? error.message
        : "Une erreur inconnue est survenue.";
};

export function SettingsProvider({
    children,
}: SettingsProviderProps) {
    const [settings, setSettings] =
        useState<ProductionSettings>(
            EMPTY_SETTINGS,
        );

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);

    const [error, setError] = useState<
        string | null
    >(null);
    const mutationQueueRef = useRef<
        Promise<void>
    >(Promise.resolve());

    const reloadSettings =
        useCallback(async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const catalog = await getCatalog();

                setSettings(catalog);
            } catch (requestError) {
                setError(
                    getErrorMessage(requestError),
                );
            } finally {
                setIsLoading(false);
            }
        }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void reloadSettings();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [reloadSettings]);

    const executeCatalogMutation = useCallback(
        (
            mutation: () =>
                Promise<ProductionSettings>,
        ): Promise<void> => {
            const pendingMutation =
                mutationQueueRef.current.then(
                    async () => {
                        try {
                            setIsSaving(true);
                            setError(null);

                            const updatedCatalog =
                                await mutation();

                            setSettings(
                                updatedCatalog,
                            );
                        } catch (requestError) {
                            setError(
                                getErrorMessage(
                                    requestError,
                                ),
                            );

                            throw requestError;
                        } finally {
                            setIsSaving(false);
                        }
                    },
                );

            mutationQueueRef.current =
                pendingMutation.catch(() => undefined);

            return pendingMutation;
        },
        [],
    );

    const addIngredient = useCallback(
        async (
            ingredientName: string,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                createIngredientFromApi({
                    name: ingredientName,
                }),
            );
        },
        [executeCatalogMutation],
    );

    const updateIngredient = useCallback(
        async (
            ingredientId: string,
            update: IngredientCatalogUpdate,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                updateIngredientFromApi(
                    ingredientId,
                    update,
                ),
            );
        },
        [executeCatalogMutation],
    );

    const deleteIngredient = useCallback(
        async (
            ingredientId: string,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                deleteIngredientFromApi(
                    ingredientId,
                ),
            );
        },
        [executeCatalogMutation],
    );

    const addPizza = useCallback(
        async (
            input: CreatePizzaInput,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                createPizzaFromApi(input),
            );
        },
        [executeCatalogMutation],
    );

    const updatePizza = useCallback(
        async (
            pizzaId: string,
            update: PizzaCatalogUpdate,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                updatePizzaFromApi(
                    pizzaId,
                    update,
                ),
            );
        },
        [executeCatalogMutation],
    );

    const deletePizza = useCallback(
        async (
            pizzaId: string,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                deletePizzaFromApi(
                    pizzaId,
                ),
            );
        },
        [executeCatalogMutation],
    );

    const addDistributor = useCallback(
        async (
            input: CreateDistributorInput,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                createDistributorFromApi(input),
            );
        },
        [executeCatalogMutation],
    );

    const updateDistributor = useCallback(
        async (
            distributorId: string,
            update: DistributorCatalogUpdate,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                updateDistributorFromApi(
                    distributorId,
                    update,
                ),
            );
        },
        [executeCatalogMutation],
    );

    const deleteDistributor = useCallback(
        async (
            distributorId: string,
        ): Promise<void> => {
            await executeCatalogMutation(() =>
                deleteDistributorFromApi(
                    distributorId,
                ),
            );
        },
        [executeCatalogMutation],
    );

    const setPizzaImageUpdatedAt = useCallback(
        (
            pizzaId: string,
            imageUpdatedAt: string | null,
        ): void => {
            setSettings((currentSettings) =>
                updatePizzaImageUpdatedAt(
                    currentSettings,
                    pizzaId,
                    imageUpdatedAt,
                ),
            );
        },
        [],
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = useMemo(
        () => ({
            settings,
            isLoading,
            isSaving,
            error,
            reloadSettings,
            addIngredient,
            updateIngredient,
            deleteIngredient,
            addPizza,
            updatePizza,
            deletePizza,
            addDistributor,
            updateDistributor,
            deleteDistributor,
            setPizzaImageUpdatedAt,
            clearError,
        }),
        [
            addDistributor,
            addIngredient,
            addPizza,
            clearError,
            deleteIngredient,
            deletePizza,
            error,
            isLoading,
            isSaving,
            reloadSettings,
            settings,
            setPizzaImageUpdatedAt,
            updateDistributor,
            deleteDistributor,
            updateIngredient,
            updatePizza,
        ],
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}
