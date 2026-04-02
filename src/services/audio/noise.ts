import type {AudioSettings} from "../../types/audio";

export const createNoiseBuffer = (
    context: BaseAudioContext,
    durationSeconds: number,
    type: AudioSettings["noise"]["type"],
) => {
    const frameCount = Math.max(
        1,
        Math.floor(context.sampleRate * durationSeconds),
    );
    const buffer = context.createBuffer(2, frameCount, context.sampleRate);

    const fillWhiteNoise = (channelData: Float32Array) => {
        for (let i = 0; i < channelData.length; i += 1) {
            channelData[i] = Math.random() * 2 - 1;
        }
    };

    const fillPinkNoise = (channelData: Float32Array) => {
        let b0 = 0;
        let b1 = 0;
        let b2 = 0;
        let b3 = 0;
        let b4 = 0;
        let b5 = 0;
        let b6 = 0;
        for (let i = 0; i < channelData.length; i += 1) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.969 * b2 + white * 0.153852;
            b3 = 0.8665 * b3 + white * 0.3104856;
            b4 = 0.55 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.016898;
            const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;
            channelData[i] = pink * 0.11;
        }
    };

    const fill = type === "pink" ? fillPinkNoise : fillWhiteNoise;
    fill(buffer.getChannelData(0));
    fill(buffer.getChannelData(1));
    return buffer;
};
