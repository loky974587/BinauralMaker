import type {AudioSettings, ExportSettings} from "../types/audio";
import {FILENAME_DURATION_RANGE, FREQUENCY_RANGES} from "../constants/ranges";
import {clamp} from "../utils/math";
import {encodeMp3} from "./audio/mp3";
import {renderOfflineBuffer} from "./audio/offline";
import {createWavBuffer} from "./audio/wav";
import {LiveAudioGraph} from "./audio/live";

export class BinauralAudioService {
    private liveGraph = new LiveAudioGraph();

    static makeFilename(
        baseFrequency: number,
        beatFrequency: number,
        duration: number,
        extension = "wav",
    ) {
        const safeBase = clamp(
            baseFrequency,
            FREQUENCY_RANGES.audible.min,
            FREQUENCY_RANGES.audible.max,
        );
        const safeBeat = clamp(beatFrequency, 0, FREQUENCY_RANGES.audible.max);
        const safeDuration = clamp(
            duration,
            FILENAME_DURATION_RANGE.min,
            FILENAME_DURATION_RANGE.max,
        );
        return `binaural-${safeBase}hz-${safeBeat}hz-${safeDuration}s.${extension}`;
    }

    async start(settings: AudioSettings) {
        await this.liveGraph.start(settings);
    }

    update(settings: AudioSettings) {
        this.liveGraph.update(settings);
    }

    async stop() {
        await this.liveGraph.stop();
    }

    async dispose() {
        await this.liveGraph.dispose();
    }

    async exportWav(settings: ExportSettings) {
        const renderedBuffer = await renderOfflineBuffer(settings);
        const wavBuffer = createWavBuffer(
            [renderedBuffer.getChannelData(0), renderedBuffer.getChannelData(1)],
            renderedBuffer.sampleRate,
            settings.notes,
        );

        return new Blob([wavBuffer], {type: "audio/wav"});
    }

    async exportMp3(settings: ExportSettings) {
        const renderedBuffer = await renderOfflineBuffer(settings);
        const left = renderedBuffer.getChannelData(0);
        const right = renderedBuffer.getChannelData(1);
        const sampleRate = renderedBuffer.sampleRate;

        return encodeMp3(left, right, sampleRate, settings.notes);
    }
}
