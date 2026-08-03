export type SettingsShortcutAction =
    | "dashboard"
    | "production"
    | "pizzas"
    | "ingredients"
    | "distributors"
    | "search"
    | "create"
    | "reload";

export type ProductionCompleteShortcutAction =
    | "restart"
    | "dashboard"
    | "close"
    | "theme";

const SETTINGS_SHORTCUTS_BY_CODE: Record<
    string,
    SettingsShortcutAction
> = {
    Digit1: "pizzas",
    Numpad1: "pizzas",
    Digit2: "ingredients",
    Numpad2: "ingredients",
    Digit3: "distributors",
    Numpad3: "distributors",
    Slash: "search",
};

const SETTINGS_SHORTCUTS_BY_KEY: Record<
    string,
    SettingsShortcutAction
> = {
    escape: "dashboard",
    enter: "production",
    f: "search",
    n: "create",
    r: "reload",
};

export const resolveSettingsShortcut = (
    key: string,
    code = "",
): SettingsShortcutAction | null =>
    SETTINGS_SHORTCUTS_BY_CODE[code] ??
    SETTINGS_SHORTCUTS_BY_KEY[
        key.toLocaleLowerCase("fr-FR")
    ] ??
    null;

const PRODUCTION_COMPLETE_SHORTCUTS_BY_KEY: Record<
    string,
    ProductionCompleteShortcutAction
> = {
    r: "restart",
    backspace: "restart",
    enter: "dashboard",
    escape: "close",
    t: "theme",
};

export const resolveProductionCompleteShortcut = (
    key: string,
): ProductionCompleteShortcutAction | null =>
    PRODUCTION_COMPLETE_SHORTCUTS_BY_KEY[
        key.toLocaleLowerCase("fr-FR")
    ] ?? null;

export const isInteractiveKeyboardTarget = (
    target: EventTarget | null,
): boolean => {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return Boolean(
        target.closest(
            [
                "input",
                "textarea",
                "select",
                "button",
                "a[href]",
                "[contenteditable='true']",
            ].join(","),
        ),
    );
};

export const canUseAppShortcut = (
    event: KeyboardEvent,
    options: {
        allowDialog?: boolean;
        allowInteractiveTarget?: boolean;
    } = {},
): boolean =>
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    (options.allowInteractiveTarget ||
        !isInteractiveKeyboardTarget(event.target)) &&
    (options.allowDialog ||
        !document.querySelector(
            '[role="dialog"]',
        ));
