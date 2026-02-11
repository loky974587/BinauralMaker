import type {AudioSettings, AutomationSettings, SessionsSettings,} from "../../types/audio";
import {FREQUENCY_RANGES} from "../../constants/ranges";
import {buildCurvePoints, buildCurveValues, getAutomationValue,} from "../../utils/automation";
import {clamp} from "../../utils/math";
import {getSessionEnvelopeValue, resolveSessionDurations} from "./session";

export const applyParamAutomation = (
    param: AudioParam,
    automation: AutomationSettings,
    fallback: number,
    now: number,
    options: {
        min: number;
        max: number;
        durationLimit?: number;
        sampleRate?: number;
        toParamValue?: (value: number) => number;
    },
) => {
    const {min, max, durationLimit, sampleRate, toParamValue} = options;
    const valueTransform = toParamValue ?? ((value: number) => value);
    param.cancelScheduledValues(now);

    if (!automation.enabled) {
        param.setValueAtTime(valueTransform(clamp(fallback, min, max)), now);
        return;
    }

    const duration = Math.max(
        0,
        durationLimit
            ? Math.min(automation.duration, durationLimit)
            : automation.duration,
    );
    const startValue = clamp(automation.start, min, max);
    const endValue = clamp(automation.end, min, max);

    if (duration === 0) {
        param.setValueAtTime(valueTransform(endValue), now);
        return;
    }

    const points = buildCurvePoints(duration, sampleRate);
    const curveValues = buildCurveValues(
        startValue,
        endValue,
        automation.curve,
        points,
    );
    const transformed = new Float32Array(curveValues.length);
    for (let i = 0; i < curveValues.length; i += 1) {
        transformed[i] = valueTransform(curveValues[i]);
    }

    param.setValueAtTime(transformed[0], now);
    param.setValueCurveAtTime(transformed, now, duration);
};

export const applyParamAutomationWithSession = (
    param: AudioParam,
    automation: AutomationSettings,
    fallback: number,
    now: number,
    options: {
        min: number;
        max: number;
        durationLimit?: number;
        sampleRate?: number;
        toParamValue?: (value: number) => number;
    },
    session: SessionsSettings,
    sessionStartAt: number,
    applyEnvelope: boolean,
) => {
    const {min, max, durationLimit, sampleRate, toParamValue} = options;
    const valueTransform = toParamValue ?? ((value: number) => value);
    const elapsed = Math.max(0, now - sessionStartAt);

    param.cancelScheduledValues(now);

    const sessionDurations = session.enabled
        ? resolveSessionDurations(session, durationLimit)
        : {total: 0};
    const automationDuration = automation.enabled
        ? Math.max(
            0,
            durationLimit
                ? Math.min(automation.duration, durationLimit)
                : automation.duration,
        )
        : 0;
    const totalDuration = Math.max(
        automationDuration,
        sessionDurations.total || 0,
    );

    if (!automation.enabled && !(session.enabled && applyEnvelope)) {
        param.setValueAtTime(valueTransform(clamp(fallback, min, max)), now);
        return;
    }

    if (totalDuration === 0) {
        const baseValue = clamp(fallback, min, max);
        const envelope =
            session.enabled && applyEnvelope
                ? getSessionEnvelopeValue(session, elapsed, durationLimit)
                : 1;
        param.setValueAtTime(valueTransform(baseValue * envelope), now);
        return;
    }

    const points = buildCurvePoints(totalDuration, sampleRate);
    const curveValues = new Float32Array(points);
    const lastIndex = Math.max(1, points - 1);

    for (let i = 0; i < points; i += 1) {
        const t = (i / lastIndex) * totalDuration;
        const baseValue = getAutomationValue(
            automation,
            fallback,
            t,
            min,
            max,
            durationLimit,
        );
        const envelope =
            session.enabled && applyEnvelope
                ? getSessionEnvelopeValue(session, elapsed + t, durationLimit)
                : 1;
        curveValues[i] = valueTransform(baseValue * envelope);
    }

    param.setValueAtTime(curveValues[0], now);
    param.setValueCurveAtTime(curveValues, now, totalDuration);
};

export const applyFrequencyAutomation = (
    leftParam: AudioParam,
    rightParam: AudioParam,
    settings: AudioSettings,
    now: number,
    sessionStartAt: number,
    durationLimit?: number,
    sampleRate?: number,
) => {
    leftParam.cancelScheduledValues(now);
    rightParam.cancelScheduledValues(now);

    const baseAutomation = settings.automation.baseFrequency;
    const beatAutomation = settings.automation.beatFrequency;
    const sessionDurations = settings.session.enabled
        ? resolveSessionDurations(settings.session, durationLimit)
        : {total: 0};
    const baseDuration = baseAutomation.enabled
        ? Math.max(
            0,
            durationLimit
                ? Math.min(baseAutomation.duration, durationLimit)
                : baseAutomation.duration,
        )
        : 0;
    const beatDuration = beatAutomation.enabled
        ? Math.max(
            0,
            durationLimit
                ? Math.min(beatAutomation.duration, durationLimit)
                : beatAutomation.duration,
        )
        : 0;
    const totalDuration = Math.max(
        baseDuration,
        beatDuration,
        sessionDurations.total || 0,
    );

    const fallbackBase = settings.baseFrequency;
    const fallbackBeat = settings.beatFrequency;
    const elapsed = Math.max(0, now - sessionStartAt);

    if (totalDuration === 0) {
        const left = clamp(
            fallbackBase - fallbackBeat / 2,
            FREQUENCY_RANGES.audible.min,
            FREQUENCY_RANGES.audible.max,
        );
        const right = clamp(
            fallbackBase + fallbackBeat / 2,
            FREQUENCY_RANGES.audible.min,
            FREQUENCY_RANGES.audible.max,
        );
        leftParam.setValueAtTime(left, now);
        rightParam.setValueAtTime(right, now);
        return;
    }

    const points = buildCurvePoints(totalDuration, sampleRate);
    const leftCurve = new Float32Array(points);
    const rightCurve = new Float32Array(points);
    const lastIndex = Math.max(1, points - 1);

    for (let i = 0; i < points; i += 1) {
        const t = (i / lastIndex) * totalDuration;
        const baseValue = getAutomationValue(
            baseAutomation,
            fallbackBase,
            t,
            FREQUENCY_RANGES.base.min,
            FREQUENCY_RANGES.base.max,
            durationLimit,
        );
        const baseBeat = getAutomationValue(
            beatAutomation,
            fallbackBeat,
            t,
            0,
            FREQUENCY_RANGES.beat.max,
            durationLimit,
        );
        const envelope = settings.session.applyToBeat
            ? getSessionEnvelopeValue(settings.session, elapsed + t, durationLimit)
            : 1;
        const beatValue = baseBeat * envelope;
        leftCurve[i] = clamp(
            baseValue - beatValue / 2,
            FREQUENCY_RANGES.audible.min,
            FREQUENCY_RANGES.audible.max,
        );
        rightCurve[i] = clamp(
            baseValue + beatValue / 2,
            FREQUENCY_RANGES.audible.min,
            FREQUENCY_RANGES.audible.max,
        );
    }

    leftParam.setValueAtTime(leftCurve[0], now);
    rightParam.setValueAtTime(rightCurve[0], now);
    leftParam.setValueCurveAtTime(leftCurve, now, totalDuration);
    rightParam.setValueCurveAtTime(rightCurve, now, totalDuration);
};
