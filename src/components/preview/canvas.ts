import {clamp} from "../../utils/math";

const drawGrid = (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
) => {
    context.save();
    context.lineWidth = 1;

    const minorStep = 20;
    const majorStep = 80;

    context.strokeStyle = "rgba(148, 163, 184, 0.12)";
    for (let x = 0; x <= width; x += minorStep) {
        context.beginPath();
        context.moveTo(x + 0.5, 0);
        context.lineTo(x + 0.5, height);
        context.stroke();
    }
    for (let y = 0; y <= height; y += minorStep) {
        context.beginPath();
        context.moveTo(0, y + 0.5);
        context.lineTo(width, y + 0.5);
        context.stroke();
    }

    context.strokeStyle = "rgba(148, 163, 184, 0.22)";
    for (let x = 0; x <= width; x += majorStep) {
        context.beginPath();
        context.moveTo(x + 0.5, 0);
        context.lineTo(x + 0.5, height);
        context.stroke();
    }
    for (let y = 0; y <= height; y += majorStep) {
        context.beginPath();
        context.moveTo(0, y + 0.5);
        context.lineTo(width, y + 0.5);
        context.stroke();
    }

    context.restore();
};

export const drawWaveformCanvas = (
    canvas: HTMLCanvasElement | null,
    options: {
        baseFrequency: number;
        previewTime: number;
        strokeStyle: string;
        markerX?: number;
    },
) => {
    if (!canvas) {
        return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const {width, height} = canvas;
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, height);

    drawGrid(context, width, height);

    if (options.markerX !== undefined) {
        context.save();
        context.strokeStyle = "rgba(248, 250, 252, 0.8)";
        context.lineWidth = 1.5;
        context.setLineDash([6, 6]);
        context.beginPath();
        context.moveTo(options.markerX + 0.5, 6);
        context.lineTo(options.markerX + 0.5, height - 6);
        context.stroke();
        context.restore();
    }

    context.strokeStyle = options.strokeStyle;
    context.lineWidth = 2;
    context.beginPath();

    const durationSeconds = 0.03;
    const points = Math.max(2, Math.floor(width));
    const dt = durationSeconds / points;
    const frequency = clamp(options.baseFrequency, 1, 20000);

    for (let i = 0; i < points; i += 1) {
        const time = options.previewTime + i * dt;
        const value = Math.sin(2 * Math.PI * frequency * time);
        const x = (i / (points - 1)) * width;
        const y = height / 2 + value * (height / 2 - 6);
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }

    context.stroke();
};

export const getNthTroughX = (
    frequency: number,
    previewTime: number,
    troughIndex: number,
    durationSeconds: number,
    canvasWidth: number,
) => {
    if (frequency <= 0) {
        return 0;
    }
    const period = 1 / frequency;
    const startPhase = 2 * Math.PI * frequency * previewTime;
    const troughPhase = (3 * Math.PI) / 2;
    const cyclesUntilTrough = Math.ceil(
        (startPhase - troughPhase) / (2 * Math.PI),
    );
    const firstTroughTime =
        (troughPhase + cyclesUntilTrough * 2 * Math.PI) / (2 * Math.PI * frequency);
    const targetTime = firstTroughTime + (troughIndex - 1) * period;
    const clampedTime = clamp(
        targetTime,
        previewTime,
        previewTime + durationSeconds,
    );
    const relativeTime = clampedTime - previewTime;
    const x = (relativeTime / durationSeconds) * canvasWidth;
    return clamp(x, 0, canvasWidth);
};

export const getNthPeakX = (
    frequency: number,
    previewTime: number,
    peakIndex: number,
    durationSeconds: number,
    canvasWidth: number,
) => {
    if (frequency <= 0) {
        return 0;
    }
    const period = 1 / frequency;
    const startPhase = 2 * Math.PI * frequency * previewTime;
    const peakPhase = Math.PI / 2;
    const cyclesUntilPeak = Math.ceil(
        (startPhase - peakPhase) / (2 * Math.PI),
    );
    const firstPeakTime =
        (peakPhase + cyclesUntilPeak * 2 * Math.PI) / (2 * Math.PI * frequency);
    const targetTime = firstPeakTime + (peakIndex - 1) * period;
    const clampedTime = clamp(
        targetTime,
        previewTime,
        previewTime + durationSeconds,
    );
    const relativeTime = clampedTime - previewTime;
    const x = (relativeTime / durationSeconds) * canvasWidth;
    return clamp(x, 0, canvasWidth);
};

export const drawNoiseCanvas = (
    canvas: HTMLCanvasElement | null,
    values: Float32Array,
) => {
    if (!canvas) {
        return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }
    const {width, height} = canvas;
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#38bdf8";
    context.lineWidth = 1.5;
    context.beginPath();
    const mid = height / 2;
    for (let i = 0; i < values.length; i += 1) {
        const x = (i / (values.length - 1)) * width;
        const y = mid - values[i] * (height / 2 - 6);
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }
    context.stroke();
};
