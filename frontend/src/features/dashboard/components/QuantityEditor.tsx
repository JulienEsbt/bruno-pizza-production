import { useState } from "react";
import { isQuantityValid } from "../../production/domain/productionEditing";

interface QuantityEditorProps {
    quantity: number;
    label: string;
    disabled: boolean;
    onChange: (quantity: number) => void;
}

export default function QuantityEditor({quantity, label, disabled, onChange}: QuantityEditorProps) {
    const [isBlank, setIsBlank] = useState(false);
    return <div className="quantity-editor">
        <button type="button" aria-label={`Diminuer ${label}`} disabled={disabled || quantity === 0}
            onClick={() => { setIsBlank(false); onChange(quantity - 1); }}>−</button>
        <input aria-label={`Quantité ${label}`} type="text" inputMode="numeric" pattern="[0-9]*"
            title="Entier positif ou nul. Enregistrement immédiat."
            disabled={disabled} value={isBlank ? "" : quantity}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={() => setIsBlank(false)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault(); event.stopPropagation(); event.currentTarget.blur();
                }
            }}
            onChange={(event) => {
                const value = event.target.value;
                if (value === "") { setIsBlank(true); return; }
                if (!/^\d+$/.test(value) || !isQuantityValid(Number(value))) return;
                setIsBlank(false); onChange(Number(value));
            }} />
        <button type="button" aria-label={`Augmenter ${label}`} disabled={disabled || quantity >= Number.MAX_SAFE_INTEGER}
            onClick={() => { setIsBlank(false); onChange(quantity + 1); }}>+</button>
    </div>;
}
