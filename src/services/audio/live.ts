import type {AudioSettings} from "../../types/audio";
import {VOLUME_RANGE} from "../../constants/ranges";
import {clamp} from "../../utils/math";
import {applyFrequencyAutomation, applyParamAutomationWithSession,} from "./automation";
import {createNoiseBuffer} from "./noise";

export class LiveAudioGraph {
    private static readonly fadeSeconds = 0.15;
    private static readonly noiseBufferSeconds = 10;
    private audioContext: AudioContext | null = null;
    private leftOscillator: OscillatorNode | null = null;
    private rightOscillator: OscillatorNode | null = null;
    private masterGain: GainNode | null = null;
    private fadeGain: GainNode | null = null;
    private merger: ChannelMergerNode | null = null;
    private sessionStartAt: number | null = null;
    private noiseSource: AudioBufferSourceNode | null = null;
    private noiseGain: GainNode | null = null;
    private noiseType: AudioSettings["noise"]["type"] | null = null;

    async start(settings: AudioSettings) {
        if (!window.AudioContext) {
            throw new Error("AudioContext non supporte");
        }

        if (!this.audioContext) {
            this.audioContext = new AudioContext();
            this.merger = this.audioContext.createChannelMerger(2);
            this.masterGain = this.audioContext.createGain();
            this.fadeGain = this.audioContext.createGain();
            this.noiseGain = this.audioContext.createGain();
            this.noiseGain.gain.value = 0;

            this.leftOscillator = this.audioContext.createOscillator();
            this.rightOscillator = this.audioContext.createOscillator();
            this.leftOscillator.type = "sine";
            this.rightOscillator.type = "sine";

            this.leftOscillator.connect(this.merger, 0, 0);
            this.rightOscillator.connect(this.merger, 0, 1);
            this.merger.connect(this.masterGain);
            this.noiseGain.connect(this.masterGain);
            this.masterGain.connect(this.fadeGain);
            this.fadeGain.connect(this.audioContext.destination);

            this.leftOscillator.start();
            this.rightOscillator.start();
        }

        if (this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }

        this.sessionStartAt = settings.session.enabled
            ? this.audioContext.currentTime
            : null;
        this.update(settings);

        if (this.fadeGain && this.audioContext.state === "running") {
            const now = this.audioContext.currentTime;
            this.fadeGain.gain.cancelScheduledValues(now);
            this.fadeGain.gain.setValueAtTime(0, now);
            this.fadeGain.gain.linearRampToValueAtTime(
                1,
                now + LiveAudioGraph.fadeSeconds,
            );
        }
    }

    update(settings: AudioSettings) {
        if (
            !this.audioContext ||
            !this.leftOscillator ||
            !this.rightOscillator ||
            !this.masterGain ||
            !this.merger
        ) {
            return;
        }

        const now = this.audioContext.currentTime;
        if (!settings.session.enabled) {
            this.sessionStartAt = null;
        } else if (this.sessionStartAt === null) {
            this.sessionStartAt = now;
        }
        const sessionStartAt = this.sessionStartAt ?? now;
        applyFrequencyAutomation(
            this.leftOscillator.frequency,
            this.rightOscillator.frequency,
            settings,
            now,
            sessionStartAt,
            undefined,
            this.audioContext.sampleRate,
        );
        applyParamAutomationWithSession(
            this.masterGain.gain,
            settings.automation.volume,
            settings.volume,
            now,
            {
                min: VOLUME_RANGE.min,
                max: VOLUME_RANGE.max,
                sampleRate: this.audioContext.sampleRate,
                toParamValue: (value) => value / 100,
            },
            settings.session,
            sessionStartAt,
            settings.session.applyToVolume,
        );

        if (this.noiseGain) {
            if (settings.noise.enabled && settings.noise.level > 0) {
                this.ensureNoiseSource(settings.noise.type);
                this.noiseGain.gain.setValueAtTime(
                    clamp(settings.noise.level, VOLUME_RANGE.min, VOLUME_RANGE.max) / 100,
                    now,
                );
            } else {
                this.noiseGain.gain.setValueAtTime(0, now);
                this.teardownNoise();
            }
        }
    }

    async stop() {
        if (!this.audioContext || !this.fadeGain) {
            return;
        }
        if (this.audioContext.state !== "running") {
            return;
        }
        const now = this.audioContext.currentTime;
        this.fadeGain.gain.cancelScheduledValues(now);
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
        this.fadeGain.gain.linearRampToValueAtTime(
            0,
            now + LiveAudioGraph.fadeSeconds,
        );
        await new Promise((resolve) =>
            setTimeout(resolve, LiveAudioGraph.fadeSeconds * 1000),
        );
        await this.audioContext.suspend();
    }

    async dispose() {
        if (this.audioContext) {
            await this.audioContext.close();
        }
        this.audioContext = null;
        this.leftOscillator = null;
        this.rightOscillator = null;
        this.masterGain = null;
        this.fadeGain = null;
        this.merger = null;
        this.sessionStartAt = null;
        this.noiseSource = null;
        this.noiseGain = null;
        this.noiseType = null;
    }

    private ensureNoiseSource(type: AudioSettings["noise"]["type"]) {
        if (!this.audioContext || !this.noiseGain || !this.masterGain) {
            return;
        }

        if (this.noiseSource && this.noiseType === type) {
            return;
        }

        if (this.noiseSource) {
            try {
                this.noiseSource.stop();
            } catch {
                // Ignore stop errors for already-stopped sources.
            }
            this.noiseSource.disconnect();
            this.noiseSource = null;
        }

        const buffer = createNoiseBuffer(
            this.audioContext,
            LiveAudioGraph.noiseBufferSeconds,
            type,
        );
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(this.noiseGain);
        source.start();
        this.noiseSource = source;
        this.noiseType = type;
    }

    private teardownNoise() {
        if (this.noiseSource) {
            try {
                this.noiseSource.stop();
            } catch {
                // Ignore stop errors for already-stopped sources.
            }
            this.noiseSource.disconnect();
            this.noiseSource = null;
        }
        this.noiseType = null;
    }
}
