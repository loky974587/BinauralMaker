import type {ExportSettings} from "../../types/audio";
import {VOLUME_RANGE} from "../../constants/ranges";
import {clamp} from "../../utils/math";
import {applyFrequencyAutomation, applyParamAutomationWithSession,} from "./automation";
import {createNoiseBuffer} from "./noise";

export const renderOfflineBuffer = async (settings: ExportSettings) => {
    if (!window.OfflineAudioContext) {
        throw new Error("OfflineAudioContext non supporte");
    }

    const sampleRate = 44100;
    const frameCount = Math.floor(sampleRate * settings.duration);
    const offlineContext = new OfflineAudioContext(2, frameCount, sampleRate);

    const leftOscillator = offlineContext.createOscillator();
    const rightOscillator = offlineContext.createOscillator();
    leftOscillator.type = "sine";
    rightOscillator.type = "sine";
    applyFrequencyAutomation(
        leftOscillator.frequency,
        rightOscillator.frequency,
        settings,
        0,
        0,
        settings.duration,
        offlineContext.sampleRate,
    );

    const masterGain = offlineContext.createGain();
    const merger = offlineContext.createChannelMerger(2);
    const noiseGain = offlineContext.createGain();
    noiseGain.gain.setValueAtTime(
        clamp(settings.noise.level, VOLUME_RANGE.min, VOLUME_RANGE.max) / 100,
        0,
    );

    applyParamAutomationWithSession(
        masterGain.gain,
        settings.automation.volume,
        settings.volume,
        0,
        {
            min: VOLUME_RANGE.min,
            max: VOLUME_RANGE.max,
            durationLimit: settings.duration,
            sampleRate: offlineContext.sampleRate,
            toParamValue: (value) => value / 100,
        },
        settings.session,
        0,
        settings.session.applyToVolume,
    );

    leftOscillator.connect(merger, 0, 0);
    rightOscillator.connect(merger, 0, 1);
    merger.connect(masterGain);

    if (settings.noise.enabled && settings.noise.level > 0) {
        const noiseSource = offlineContext.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(
            offlineContext,
            settings.duration,
            settings.noise.type,
        );
        noiseSource.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseSource.start(0);
        noiseSource.stop(settings.duration);
    }
    masterGain.connect(offlineContext.destination);

    leftOscillator.start(0);
    rightOscillator.start(0);
    leftOscillator.stop(settings.duration);
    rightOscillator.stop(settings.duration);

    return offlineContext.startRendering();
};
