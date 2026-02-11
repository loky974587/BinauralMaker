export const maxNotesLength = 500;

export const sanitizeNotes = (notes?: string) => {
    if (!notes) {
        return "";
    }
    const trimmed = notes.trim();
    if (!trimmed) {
        return "";
    }
    return trimmed.slice(0, maxNotesLength);
};
