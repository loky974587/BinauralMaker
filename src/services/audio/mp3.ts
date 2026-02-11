import lameUrl from "lamejs/lame.min.js?url";
import {sanitizeNotes} from "../../utils/notes";

type LameGlobal = {
    lamejs?: {
        Mp3Encoder: new (
            channels: number,
            sampleRate: number,
            kbps: number,
        ) => {
            encodeBuffer: (left: Int16Array, right: Int16Array) => Uint8Array;
            flush: () => Uint8Array;
        };
    };
};

let lameLoadPromise: Promise<LameGlobal["lamejs"]> | null = null;

const loadLame = () => {
    const globalScope = globalThis as LameGlobal;
    if (globalScope.lamejs?.Mp3Encoder) {
        return Promise.resolve(globalScope.lamejs);
    }
    if (!lameLoadPromise) {
        lameLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = lameUrl;
            script.async = true;
            script.onload = () => {
                if (globalScope.lamejs?.Mp3Encoder) {
                    resolve(globalScope.lamejs);
                } else {
                    reject(new Error("Lamejs n'a pas été chargé correctement."));
                }
            };
            script.onerror = () => {
                reject(new Error("Impossible de charger Lamejs."));
            };
            document.head.appendChild(script);
        });
    }
    return lameLoadPromise;
};

const textEncoder = new TextEncoder();

const concatUint8Arrays = (chunks: Uint8Array[]) => {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
};

const buildId3Tag = (notes?: string) => {
    const comment = sanitizeNotes(notes);
    if (!comment) {
        return null;
    }

    const commentBytes = textEncoder.encode(comment);
    const frameBody = new Uint8Array(1 + 3 + 1 + commentBytes.length);
    frameBody[0] = 0x03;
    frameBody[1] = 0x65;
    frameBody[2] = 0x6e;
    frameBody[3] = 0x67;
    frameBody[4] = 0x00;
    frameBody.set(commentBytes, 5);

    const frameHeader = new Uint8Array(10);
    frameHeader[0] = 0x43;
    frameHeader[1] = 0x4f;
    frameHeader[2] = 0x4d;
    frameHeader[3] = 0x4d;
    const frameSizeView = new DataView(frameHeader.buffer);
    frameSizeView.setUint32(4, frameBody.length, false);
    frameSizeView.setUint16(8, 0, false);

    const frames = concatUint8Arrays([frameHeader, frameBody]);
    const tagHeader = new Uint8Array(10);
    tagHeader[0] = 0x49;
    tagHeader[1] = 0x44;
    tagHeader[2] = 0x33;
    tagHeader[3] = 0x03;
    tagHeader[4] = 0x00;
    tagHeader[5] = 0x00;
    const size = frames.length;
    tagHeader[6] = (size >> 21) & 0x7f;
    tagHeader[7] = (size >> 14) & 0x7f;
    tagHeader[8] = (size >> 7) & 0x7f;
    tagHeader[9] = size & 0x7f;

    return concatUint8Arrays([tagHeader, frames]);
};

export const encodeMp3 = async (
    left: Float32Array,
    right: Float32Array,
    sampleRate: number,
    notes?: string,
) => {
    const lame = await loadLame();
    if (!lame?.Mp3Encoder) {
        throw new Error("Lamejs indisponible.");
    }
    const {Mp3Encoder} = lame;
    const encoder = new Mp3Encoder(2, sampleRate, 128);
    const blockSize = 1152;
    const mp3Data: Uint8Array[] = [];

    const floatToInt16 = (value: number) => {
        const clamped = Math.max(-1, Math.min(1, value));
        return clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    };

    for (let i = 0; i < left.length; i += blockSize) {
        const leftChunk = new Int16Array(blockSize);
        const rightChunk = new Int16Array(blockSize);
        const sliceEnd = Math.min(i + blockSize, left.length);
        for (let j = i; j < sliceEnd; j += 1) {
            const index = j - i;
            leftChunk[index] = floatToInt16(left[j]);
            rightChunk[index] = floatToInt16(right[j]);
        }

        const encoded = encoder.encodeBuffer(leftChunk, rightChunk);
        if (encoded.length > 0) {
            mp3Data.push(encoded);
        }
    }

    const finalChunk = encoder.flush();
    if (finalChunk.length > 0) {
        mp3Data.push(finalChunk);
    }

    const id3Tag = buildId3Tag(notes);
    const mp3Chunks = id3Tag ? [id3Tag, ...mp3Data] : mp3Data;
    const blobParts = mp3Chunks as BlobPart[];

    return new Blob(blobParts, {type: "audio/mpeg"});
};
