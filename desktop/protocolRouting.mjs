export const DESKTOP_SCHEME = "bruno-pizza";
export const DESKTOP_HOST = "app";
export const DESKTOP_ORIGIN =
    `${DESKTOP_SCHEME}://${DESKTOP_HOST}`;
export const DESKTOP_ENTRY_URL =
    `${DESKTOP_ORIGIN}/`;

const parseDesktopUrl = (candidateUrl) => {
    const parsedUrl = new URL(candidateUrl);

    if (
        parsedUrl.protocol !== `${DESKTOP_SCHEME}:` ||
        parsedUrl.hostname !== DESKTOP_HOST
    ) {
        throw new Error(
            "L’URL ne correspond pas à l’origine desktop Bruno Pizza.",
        );
    }

    return parsedUrl;
};

export const getBackendProxyUrl = (
    desktopUrl,
    backendOrigin,
) => {
    const parsedDesktopUrl =
        parseDesktopUrl(desktopUrl);
    const backendUrl = new URL(
        parsedDesktopUrl.pathname,
        `${backendOrigin}/`,
    );

    backendUrl.search = parsedDesktopUrl.search;

    return backendUrl.toString();
};

export const isDesktopNavigation = (
    candidateUrl,
) => {
    try {
        parseDesktopUrl(candidateUrl);
        return true;
    } catch {
        return false;
    }
};
