import type {AutomationSettings} from "../types/audio";
import {clamp} from "./math";

export const curveTransform = (
    progress: number,
    curve: AutomationSettings["curve"],
) => {
    const t = clamp(progress, 0, 1);
    if (curve === "power") {
        return t * t;
    }
    if (curve === "log") {
        return Math.log10(1 + 9 * t);
    }
    return t;
};

export const buildCurvePoints = (duration: number, sampleRate?: number) => {
    const pointsPerSecond = sampleRate ? sampleRate / 64 : 120;
    return Math.min(4096, Math.max(2, Math.floor(duration * pointsPerSecond)));
};

export const buildCurveValues = (
    start: number,
    end: number,
    curve: AutomationSettings["curve"],
    points: number,
) => {
    const values = new Float32Array(points);
    const delta = end - start;
    const lastIndex = Math.max(1, points - 1);
    for (let i = 0; i < points; i += 1) {
        const progress = i / lastIndex;
        const shaped = curveTransform(progress, curve);
        values[i] = start + delta * shaped;
    }
    return values;
};

export const getAutomationValue = (
    automation: AutomationSettings,
    fallback: number,
    time: number,
    min: number,
    max: number,
    durationLimit?: number,
) => {
    if (!automation.enabled) {
        return clamp(fallback, min, max);
    }
    const duration = Math.max(
        0,
        durationLimit
            ? Math.min(automation.duration, durationLimit)
            : automation.duration,
    );
    if (duration === 0) {
        return clamp(automation.end, min, max);
    }
    const clampedTime = Math.min(Math.max(time, 0), duration);
    const progress = clampedTime / duration;
    const shaped = curveTransform(progress, automation.curve);
    const startValue = clamp(automation.start, min, max);
    const endValue = clamp(automation.end, min, max);
    return startValue + (endValue - startValue) * shaped;
};
