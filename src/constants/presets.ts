import type {NoiseSettings, SessionsSettings} from "../types/audio";
import {DEFAULT_SESSION} from "./audioDefaults";

export type PresetId = "recommended" | "relax" | "focus" | "sleep";

export type PresetValues = {
    baseFrequency: number;
    beatFrequency: number;
    volume: number;
    duration: number;
    session: SessionsSettings;
    noise: NoiseSettings;
};

export const DEFAULT_PRESET_ID: PresetId = "recommended";

const buildSession = (session: SessionsSettings) => ({...session});
const buildNoise = (noise: NoiseSettings) => ({...noise});

export const PRESETS: Record<PresetId, PresetValues> = {
    recommended: {
        baseFrequency: 220,
        beatFrequency: 6,
        volume: 30,
        duration: 1500,
        session: buildSession(DEFAULT_SESSION),
        noise: buildNoise({enabled: true, type: "pink", level: 15}),
    },
    relax: {
        baseFrequency: 220,
        beatFrequency: 6,
        volume: 30,
        duration: 1500,
        session: buildSession(DEFAULT_SESSION),
        noise: buildNoise({enabled: true, type: "pink", level: 15}),
    },
    focus: {
        baseFrequency: 250,
        beatFrequency: 10,
        volume: 30,
        duration: 1200,
        session: buildSession({
            enabled: true,
            introDuration: 120,
            plateauDuration: 960,
            outroDuration: 120,
            applyToVolume: true,
            applyToBeat: true,
        }),
        noise: buildNoise({enabled: true, type: "white", level: 10}),
    },
    sleep: {
        baseFrequency: 200,
        beatFrequency: 4,
        volume: 25,
        duration: 1800,
        session: buildSession({
            enabled: true,
            introDuration: 180,
            plateauDuration: 1440,
            outroDuration: 180,
            applyToVolume: true,
            applyToBeat: true,
        }),
        noise: buildNoise({enabled: true, type: "pink", level: 20}),
    },
};

export const applyPreset = (presetId: PresetId): PresetValues => {
    const preset = PRESETS[presetId];
    return {
        baseFrequency: preset.baseFrequency,
        beatFrequency: preset.beatFrequency,
        volume: preset.volume,
        duration: preset.duration,
        session: buildSession(preset.session),
        noise: buildNoise(preset.noise),
    };
};
