import {sanitizeNotes} from "../../utils/notes";

const textEncoder = new TextEncoder();

const buildBextChunk = (notes?: string) => {
    const comment = sanitizeNotes(notes);
    if (!comment) {
        return null;
    }
    const descriptionBytes = new Uint8Array(256);
    const encoded = textEncoder.encode(comment);
    const length = Math.min(encoded.length, descriptionBytes.length);
    descriptionBytes.set(encoded.slice(0, length));

    const chunkSize = 602;
    const buffer = new ArrayBuffer(8 + chunkSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    const writeString = (offset: number, value: string) => {
        for (let index = 0; index < value.length; index += 1) {
            view.setUint8(offset + index, value.charCodeAt(index));
        }
    };

    writeString(0, "bext");
    view.setUint32(4, chunkSize, true);
    bytes.set(descriptionBytes, 8);
    // Remaining fields (originator, timestamps, etc.) stay zeroed.

    return bytes;
};

const buildWavMetadataChunk = (notes?: string) => {
    const comment = sanitizeNotes(notes);
    if (!comment) {
        return null;
    }
    const infoFields = [
        {id: "INAM", value: comment}, // title
        {id: "ICMT", value: comment}, // comment
    ];

    const subChunks: {id: string; data: Uint8Array; padding: number}[] = [];
    let subChunksTotal = 0;

    for (const field of infoFields) {
        const data = textEncoder.encode(field.value);
        const padding = data.length % 2;
        const size = data.length;
        const total = 8 + size + padding;
        subChunks.push({id: field.id, data, padding});
        subChunksTotal += total;
    }

    const listChunkSize = 4 + subChunksTotal;
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

    let offset = 12;
    for (const field of subChunks) {
        writeString(offset, field.id);
        view.setUint32(offset + 4, field.data.length, true);
        bytes.set(field.data, offset + 8);
        if (field.padding) {
            bytes[offset + 8 + field.data.length] = 0;
        }
        offset += 8 + field.data.length + field.padding;
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
    const bextChunk = buildBextChunk(notes);
    const infoChunk = buildWavMetadataChunk(notes);
    const metadataChunks = [bextChunk, infoChunk].filter(Boolean) as Uint8Array[];
    const metadataSize = metadataChunks.reduce((sum, chunk) => sum + chunk.length, 0);
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
    let dataHeaderOffset = 36;
    if (metadataChunks.length > 0) {
        const bytes = new Uint8Array(buffer);
        for (const chunk of metadataChunks) {
            bytes.set(chunk, dataHeaderOffset);
            dataHeaderOffset += chunk.length;
        }
    }

    writeString(dataHeaderOffset, "data");
    view.setUint32(dataHeaderOffset + 4, dataSize, true);

    let offset = dataHeaderOffset + 8;
    for (let sample = 0; sample < frameCount; sample += 1) {
        for (let channel = 0; channel < channelCount; channel += 1) {
            const value = Math.max(-1, Math.min(1, channelData[channel][sample]));
            view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
            offset += bytesPerSample;
        }
    }

    return buffer;
};
