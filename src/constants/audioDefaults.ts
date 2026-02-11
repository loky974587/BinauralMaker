import type {AutomationState, NoiseSettings, SessionsSettings,} from "../types/audio";

export const DEFAULT_SESSION: SessionsSettings = {
    enabled: true,
    introDuration: 180,
    plateauDuration: 1140,
    outroDuration: 180,
    applyToVolume: true,
    applyToBeat: true,
};

export const DEFAULT_NOISE: NoiseSettings = {
    enabled: false,
    type: "pink",
    level: 20,
};

export const DEFAULT_AUTOMATION: AutomationState = {
    baseFrequency: {
        enabled: false,
        start: 220,
        end: 220,
        duration: 30,
        curve: "linear",
    },
    beatFrequency: {
        enabled: false,
        start: 6,
        end: 6,
        duration: 30,
        curve: "linear",
    },
    volume: {enabled: false, start: 30, end: 30, duration: 30, curve: "linear"},
};
