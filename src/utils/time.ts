export const formatTime = (value: number) => {
    const safe = Math.max(0, Math.floor(value));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
