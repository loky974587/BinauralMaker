import {useCallback, useMemo, useState} from "react";
import {DEFAULT_AUTOMATION, DEFAULT_NOISE, DEFAULT_SESSION,} from "../constants/audioDefaults";
import {applyPreset as applyPresetValues, DEFAULT_PRESET_ID, PresetId,} from "../constants/presets";
import type {NoiseSettings, SessionsSettings} from "../types/audio";
import type {StoredSettings} from "./useStoredSettings";

export const useAudioSettings = (storedSettings: StoredSettings | null) => {
    const [baseFrequency, setBaseFrequency] = useState(
        () => storedSettings?.baseFrequency ?? 220,
    );
    const [beatFrequency, setBeatFrequency] = useState(
        () => storedSettings?.beatFrequency ?? 6,
    );
    const [volume, setVolume] = useState(() => storedSettings?.volume ?? 30);
    const [duration, setDuration] = useState(
        () => storedSettings?.duration ?? 1500,
    );
    const [notes, setNotes] = useState(() => storedSettings?.notes ?? "");
    const [session, setSession] = useState<SessionsSettings>(
        () => storedSettings?.session ?? DEFAULT_SESSION,
    );
    const [noise, setNoise] = useState<NoiseSettings>(
        () => storedSettings?.noise ?? DEFAULT_NOISE,
    );
    const [activePreset, setActivePreset] = useState<PresetId | null>(
        () => storedSettings?.activePreset ?? DEFAULT_PRESET_ID,
    );
    const [isWarningVisible, setIsWarningVisible] = useState(
        () => storedSettings?.isWarningVisible ?? true,
    );
    const automation = useMemo(() => DEFAULT_AUTOMATION, []);

    const applyPreset = useCallback((presetId: PresetId) => {
        const preset = applyPresetValues(presetId);
        setBaseFrequency(preset.baseFrequency);
        setBeatFrequency(preset.beatFrequency);
        setVolume(preset.volume);
        setDuration(preset.duration);
        setSession(preset.session);
        setNoise(preset.noise);
        setActivePreset(presetId);
    }, []);

    const updateBaseFrequency = useCallback((value: number) => {
        setActivePreset(null);
        setBaseFrequency(value);
    }, []);

    const updateBeatFrequency = useCallback((value: number) => {
        setActivePreset(null);
        setBeatFrequency(value);
    }, []);

    const updateVolume = useCallback((value: number) => {
        setActivePreset(null);
        setVolume(value);
    }, []);

    const updateDuration = useCallback((value: number) => {
        setActivePreset(null);
        setDuration(value);
        setSession((current) => {
            if (!current.enabled) {
                return current;
            }
            const total =
                current.introDuration + current.plateauDuration + current.outroDuration;
            const nextDuration = Math.max(1, Math.round(value));
            if (total <= 0) {
                return {
                    ...current,
                    introDuration: 0,
                    plateauDuration: nextDuration,
                    outroDuration: 0,
                };
            }
            const scale = nextDuration / total;
            const scaledIntro = Math.round(current.introDuration * scale);
            const scaledPlateau = Math.round(current.plateauDuration * scale);
            const scaledOutro = Math.max(
                0,
                nextDuration - scaledIntro - scaledPlateau,
            );
            return {
                ...current,
                introDuration: scaledIntro,
                plateauDuration: scaledPlateau,
                outroDuration: scaledOutro,
            };
        });
    }, []);

    const updateSession = useCallback((value: SessionsSettings) => {
        setActivePreset(null);
        setSession(value);
    }, []);

    const updateNoise = useCallback((value: NoiseSettings) => {
        setActivePreset(null);
        setNoise(value);
    }, []);

    const storedSettingsSnapshot = useMemo(
        () => ({
            baseFrequency,
            beatFrequency,
            volume,
            duration,
            notes,
            session,
            noise,
            activePreset,
            isWarningVisible,
        }),
        [
            baseFrequency,
            beatFrequency,
            volume,
            duration,
            notes,
            session,
            noise,
            activePreset,
            isWarningVisible,
        ],
    );

    return {
        baseFrequency,
        beatFrequency,
        volume,
        duration,
        notes,
        session,
        noise,
        activePreset,
        isWarningVisible,
        automation,
        applyPreset,
        setNotes,
        setIsWarningVisible,
        setActivePreset,
        updateBaseFrequency,
        updateBeatFrequency,
        updateVolume,
        updateDuration,
        updateSession,
        updateNoise,
        storedSettingsSnapshot,
    };
};
