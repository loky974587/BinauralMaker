import type {AutomationState, NoiseSettings, SessionsSettings,} from "../types/audio";

export type PreviewModelParams = {
    baseFrequency: number;
    beatFrequency: number;
    duration: number;
    notes: string;
    automation: AutomationState;
    session: SessionsSettings;
    noise: NoiseSettings;
    isPlaying: boolean;
    playStartedAt: number | null;
};

export class PreviewModel {
    readonly baseFrequency: number;
    readonly beatFrequency: number;
    readonly duration: number;
    readonly notes: string;
    readonly automation: AutomationState;
    readonly session: SessionsSettings;
    readonly noise: NoiseSettings;
    readonly isPlaying: boolean;
    readonly playStartedAt: number | null;

    constructor(params: PreviewModelParams) {
        this.baseFrequency = params.baseFrequency;
        this.beatFrequency = params.beatFrequency;
        this.duration = params.duration;
        this.notes = params.notes;
        this.automation = params.automation;
        this.session = params.session;
        this.noise = params.noise;
        this.isPlaying = params.isPlaying;
        this.playStartedAt = params.playStartedAt;
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
