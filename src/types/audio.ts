export type AutomationCurve = "linear" | "power" | "log";

export type AutomationSettings = {
    enabled: boolean;
    start: number;
    end: number;
    duration: number;
    curve: AutomationCurve;
};

export type AutomationState = {
    baseFrequency: AutomationSettings;
    beatFrequency: AutomationSettings;
    volume: AutomationSettings;
};

export class SessionsSettings {
    enabled: boolean = false;
    introDuration: number = 1;
    plateauDuration: number = 5;
    outroDuration: number = 1;
    applyToVolume: boolean = true;
    applyToBeat: boolean = true;
}

export type NoiseType = "white" | "pink";

export class NoiseSettings {
    enabled: boolean = false;
    type: NoiseType = "pink";
    level: number = 20;
}

export type AudioSettings = {
    baseFrequency: number;
    beatFrequency: number;
    volume: number;
    automation: AutomationState;
    session: SessionsSettings;
    noise: NoiseSettings;
};

export type ExportSettings = AudioSettings & {
    duration: number;
    notes?: string;
};
