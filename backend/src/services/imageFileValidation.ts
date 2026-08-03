export interface ValidatedImageType {
    mimeType: "image/jpeg" | "image/png" | "image/webp";
    extension: ".jpg" | ".png" | ".webp";
}

const hasBytes = (
    buffer: Buffer,
    expectedBytes: number[],
    offset = 0,
): boolean => {
    return expectedBytes.every(
        (byte, index) =>
            buffer[offset + index] === byte,
    );
};

export const detectImageType = (
    buffer: Buffer,
): ValidatedImageType | undefined => {
    if (
        buffer.length >= 3 &&
        hasBytes(buffer, [0xff, 0xd8, 0xff])
    ) {
        return {
            mimeType: "image/jpeg",
            extension: ".jpg",
        };
    }

    if (
        buffer.length >= 8 &&
        hasBytes(
            buffer,
            [
                0x89,
                0x50,
                0x4e,
                0x47,
                0x0d,
                0x0a,
                0x1a,
                0x0a,
            ],
        )
    ) {
        return {
            mimeType: "image/png",
            extension: ".png",
        };
    }

    if (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
        return {
            mimeType: "image/webp",
            extension: ".webp",
        };
    }

    return undefined;
};
