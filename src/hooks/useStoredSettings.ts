import {useCallback, useMemo} from "react";
import {DEFAULT_NOISE, DEFAULT_SESSION} from "../constants/audioDefaults";
import {DEFAULT_PRESET_ID, PresetId} from "../constants/presets";
import type {NoiseSettings, SessionsSettings} from "../types/audio";

export type StoredSettings = {
    baseFrequency: number;
    beatFrequency: number;
    volume: number;
    duration: number;
    notes: string;
    session: SessionsSettings;
    noise: NoiseSettings;
    activePreset: PresetId | null;
    isWarningVisible: boolean;
};

const STORAGE_KEY = "binaural-maker-settings-v1";

const safeNumber = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
const safeBoolean = (value: unknown, fallback: boolean) =>
    typeof value === "boolean" ? value : fallback;
const safePreset = (value: unknown): PresetId | null =>
    value === "recommended" ||
    value === "relax" ||
    value === "focus" ||
    value === "sleep"
        ? value
        : null;
const safeNoiseType = (value: unknown) =>
    value === "white" || value === "pink" ? value : DEFAULT_NOISE.type;
const safeNotes = (value: unknown) => (typeof value === "string" ? value : "");

const loadStoredSettings = (): StoredSettings | null => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const sessionValue = parsed.session;
        const noiseValue = parsed.noise;

        return {
            baseFrequency: safeNumber(parsed.baseFrequency, 220),
            beatFrequency: safeNumber(parsed.beatFrequency, 6),
            volume: safeNumber(parsed.volume, 30),
            duration: safeNumber(parsed.duration, 1500),
            notes: safeNotes(parsed.notes),
            session:
                sessionValue && typeof sessionValue === "object"
                    ? {
                        enabled: safeBoolean(
                            (sessionValue as Record<string, unknown>).enabled,
                            DEFAULT_SESSION.enabled,
                        ),
                        introDuration: safeNumber(
                            (sessionValue as Record<string, unknown>).introDuration,
                            DEFAULT_SESSION.introDuration,
                        ),
                        plateauDuration: safeNumber(
                            (sessionValue as Record<string, unknown>).plateauDuration,
                            DEFAULT_SESSION.plateauDuration,
                        ),
                        outroDuration: safeNumber(
                            (sessionValue as Record<string, unknown>).outroDuration,
                            DEFAULT_SESSION.outroDuration,
                        ),
                        applyToVolume: safeBoolean(
                            (sessionValue as Record<string, unknown>).applyToVolume,
                            DEFAULT_SESSION.applyToVolume,
                        ),
                        applyToBeat: safeBoolean(
                            (sessionValue as Record<string, unknown>).applyToBeat,
                            DEFAULT_SESSION.applyToBeat,
                        ),
                    }
                    : DEFAULT_SESSION,
            noise:
                noiseValue && typeof noiseValue === "object"
                    ? {
                        enabled: safeBoolean(
                            (noiseValue as Record<string, unknown>).enabled,
                            DEFAULT_NOISE.enabled,
                        ),
                        type: safeNoiseType((noiseValue as Record<string, unknown>).type),
                        level: safeNumber(
                            (noiseValue as Record<string, unknown>).level,
                            DEFAULT_NOISE.level,
                        ),
                    }
                    : DEFAULT_NOISE,
            activePreset: safePreset(parsed.activePreset) ?? DEFAULT_PRESET_ID,
            isWarningVisible: safeBoolean(parsed.isWarningVisible, true),
        };
    } catch {
        return null;
    }
};

export const useStoredSettings = () => {
    const storedSettings = useMemo(() => loadStoredSettings(), []);

    const persistSettings = useCallback((settings: StoredSettings) => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            // ignore storage errors (quota, private mode)
        }
    }, []);

    return {storedSettings, persistSettings};
};
