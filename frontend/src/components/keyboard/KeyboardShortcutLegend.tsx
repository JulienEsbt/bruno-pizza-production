import "./KeyboardShortcutLegend.css";

export interface KeyboardShortcutItem {
    key: string;
    label: string;
}

interface KeyboardShortcutLegendProps {
    items: KeyboardShortcutItem[];
    title?: string;
}

export default function KeyboardShortcutLegend({
    items,
    title = "Raccourcis clavier",
}: KeyboardShortcutLegendProps) {
    return (
        <aside
            className="keyboard-shortcut-legend"
            aria-label={title}
        >
            <div className="keyboard-shortcut-legend__items">
                {items.map((item) => (
                    <span key={`${item.key}-${item.label}`}>
                        <kbd>{item.key}</kbd>
                        {item.label}
                    </span>
                ))}
            </div>
        </aside>
    );
}
