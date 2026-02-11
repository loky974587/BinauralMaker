import {sanitizeNotes} from "../../utils/notes";

const textEncoder = new TextEncoder();

const buildWavMetadataChunk = (notes?: string) => {
    const comment = sanitizeNotes(notes);
    if (!comment) {
        return null;
    }
    const commentBytes = textEncoder.encode(comment);
    const commentPadding = commentBytes.length % 2;
    const subChunkSize = commentBytes.length;
    const subChunkTotal = 8 + subChunkSize + commentPadding;
    const listChunkSize = 4 + subChunkTotal;
    const listChunkTotal = 8 + listChunkSize;
    const buffer = new ArrayBuffer(listChunkTotal);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    const writeString = (offset: number, value: string) => {
        for (let index = 0; index < value.length; index += 1) {
            view.setUint8(offset + index, value.charCodeAt(index));
        }
    };

    writeString(0, "LIST");
    view.setUint32(4, listChunkSize, true);
    writeString(8, "INFO");
    writeString(12, "ICMT");
    view.setUint32(16, subChunkSize, true);
    bytes.set(commentBytes, 20);
    if (commentPadding) {
        bytes[20 + commentBytes.length] = 0;
    }

    return bytes;
};

export const createWavBuffer = (
    channelData: Float32Array[],
    sampleRate: number,
    notes?: string,
) => {
    const channelCount = channelData.length;
    const frameCount = channelData[0].length;
    const bytesPerSample = 2;
    const blockAlign = channelCount * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = frameCount * blockAlign;
    const metadataChunk = buildWavMetadataChunk(notes);
    const metadataSize = metadataChunk ? metadataChunk.length : 0;
    const buffer = new ArrayBuffer(44 + dataSize + metadataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, value: string) => {
        for (let index = 0; index < value.length; index += 1) {
            view.setUint8(offset + index, value.charCodeAt(index));
        }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize + metadataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channelCount, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let sample = 0; sample < frameCount; sample += 1) {
        for (let channel = 0; channel < channelCount; channel += 1) {
            const value = Math.max(-1, Math.min(1, channelData[channel][sample]));
            view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
            offset += bytesPerSample;
        }
    }

    if (metadataChunk) {
        const bytes = new Uint8Array(buffer);
        bytes.set(metadataChunk, offset);
    }

    return buffer;
};
