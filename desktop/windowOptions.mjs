export const getMainWindowOptions = (title) => ({
    title,
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    fullscreen: true,
    backgroundColor: "#111827",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webviewTag: false,
    },
});
