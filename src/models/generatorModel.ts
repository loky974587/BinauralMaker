import type {PresetId} from "../constants/presets";
import type {NoiseSettings, SessionsSettings} from "../types/audio";

export type GeneratorModelParams = {
    baseFrequency: number;
    beatFrequency: number;
    volume: number;
    duration: number;
    notes: string;
    session: SessionsSettings;
    noise: NoiseSettings;
    isPlaying: boolean;
    isExporting: boolean;
    playStartedAt: number | null;
    isFirstVisit: boolean;
    activePreset?: PresetId | null;
};

export class GeneratorModel {
    readonly baseFrequency: number;
    readonly beatFrequency: number;
    readonly volume: number;
    readonly duration: number;
    readonly notes: string;
    readonly session: SessionsSettings;
    readonly noise: NoiseSettings;
    readonly isPlaying: boolean;
    readonly isExporting: boolean;
    readonly playStartedAt: number | null;
    readonly isFirstVisit: boolean;
    readonly activePreset: PresetId | null;

    constructor(params: GeneratorModelParams) {
        this.baseFrequency = params.baseFrequency;
        this.beatFrequency = params.beatFrequency;
        this.volume = params.volume;
        this.duration = params.duration;
        this.notes = params.notes;
        this.session = params.session;
        this.noise = params.noise;
        this.isPlaying = params.isPlaying;
        this.isExporting = params.isExporting;
        this.playStartedAt = params.playStartedAt;
        this.isFirstVisit = params.isFirstVisit;
        this.activePreset = params.activePreset ?? null;
    }

    getSessionTotalDuration(): number {
        return (
            this.session.introDuration +
            this.session.plateauDuration +
            this.session.outroDuration
        );
    }

    hasDurationMismatch(): boolean {
        return (
            this.session.enabled &&
            Math.round(this.duration) !== Math.round(this.getSessionTotalDuration())
        );
    }

}
