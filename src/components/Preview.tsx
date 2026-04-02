import {useEffect, useMemo, useState} from "react";
import {FREQUENCY_RANGES} from "../constants/ranges";
import type {PreviewModel} from "../models/previewModel";
import {getAutomationValue} from "../utils/automation";
import {clamp} from "../utils/math";
import {resolveSessionDurations} from "../utils/session";
import {formatTime} from "../utils/time";
import {NotesField} from "./generator/NotesField";
import {NoisePanel, NoisePanelModel} from "./preview/NoisePanel";
import {SessionTimeline, SessionTimelineData, SessionTimelineModel,} from "./preview/SessionTimeline";
import {WaveformPanel, WaveformPanelModel} from "./preview/WaveformPanel";

type PreviewProps = {
    previewModel: PreviewModel;
    onNotesChange: (value: string) => void;
};

export function Preview({previewModel, onNotesChange}: PreviewProps) {
    const {
        baseFrequency,
        beatFrequency,
        duration,
        notes,
        automation,
        session,
        noise,
        isPlaying,
        playStartedAt,
    } = previewModel;
    const sessionTimeline = useMemo<SessionTimelineData | null>(() => {
        if (!session.enabled) {
            return null;
        }
        const {intro, plateau, outro, total} = resolveSessionDurations(
            session,
            duration,
        );
        const safeTotal = total > 0 ? total : 1;
        return {intro, plateau, outro, total: safeTotal};
    }, [session, duration]);
    const maxPreviewTime = useMemo(() => {
        const durations = [
            duration,
            automation.baseFrequency.duration,
            automation.beatFrequency.duration,
            automation.volume.duration,
            session.enabled
                ? session.introDuration +
                session.plateauDuration +
                session.outroDuration
                : 0,
        ];
        return Math.max(1, ...durations);
    }, [duration, automation, session]);
    const [previewTime, setPreviewTime] = useState(0);
    const [liveTime, setLiveTime] = useState<number | null>(null);

    const hasDurationMismatch = previewModel.hasDurationMismatch();
    const playbackPosition = liveTime ?? previewTime;

    useEffect(() => {
        setPreviewTime((current) => Math.min(current, maxPreviewTime));
    }, [maxPreviewTime]);

    useEffect(() => {
        if (!isPlaying || playStartedAt === null) {
            setLiveTime(null);
            return;
        }
        let frameId = 0;
        const tick = () => {
            setLiveTime((performance.now() - playStartedAt) / 1000);
            frameId = requestAnimationFrame(tick);
        };
        tick();
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [isPlaying, playStartedAt]);

    const previewBase = useMemo(() => {
        return getAutomationValue(
            automation.baseFrequency,
            baseFrequency,
            previewTime,
            FREQUENCY_RANGES.base.min,
            FREQUENCY_RANGES.base.max,
        );
    }, [automation.baseFrequency, baseFrequency, previewTime]);
    const previewBeatRaw = useMemo(() => {
        return getAutomationValue(
            automation.beatFrequency,
            beatFrequency,
            previewTime,
            FREQUENCY_RANGES.beat.min,
            FREQUENCY_RANGES.beat.max,
        );
    }, [automation.beatFrequency, beatFrequency, previewTime]);
    const leftFrequencyVisual = useMemo(
        () =>
            clamp(
                previewBase - previewBeatRaw / 2,
                FREQUENCY_RANGES.audible.min,
                FREQUENCY_RANGES.audible.max,
            ),
        [previewBase, previewBeatRaw],
    );
    const rightFrequencyVisual = useMemo(
        () =>
            clamp(
                previewBase + previewBeatRaw / 2,
                FREQUENCY_RANGES.audible.min,
                FREQUENCY_RANGES.audible.max,
            ),
        [previewBase, previewBeatRaw],
    );
    const sessionTimelineModel = useMemo(
        () =>
            new SessionTimelineModel({
                sessionTimeline,
                duration,
                previewTime,
                liveTime,
            }),
        [sessionTimeline, duration, previewTime, liveTime],
    );
    const waveformPanelModel = useMemo(
        () =>
            new WaveformPanelModel({
                leftFrequency: leftFrequencyVisual,
                rightFrequency: rightFrequencyVisual,
                previewTime,
            }),
        [leftFrequencyVisual, rightFrequencyVisual, previewTime],
    );
    const noisePanelModel = useMemo(
        () =>
            new NoisePanelModel({
                noise,
                previewTime,
            }),
        [noise, previewTime],
    );

    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
            <div className="section-header">
                <div>
                    <h2 className="text-xl font-semibold">Prévisualisation</h2>
                    <p className="text-muted">
                        Position actuelle: {formatTime(Math.floor(playbackPosition))}
                    </p>
                </div>
                <div className="row-gap-2">
          <span
              className={`badge ${
                  hasDurationMismatch
                      ? "border-amber-400/50 text-amber-200"
                      : "border-emerald-400/50 text-emerald-200"
              }`}
          >
            {hasDurationMismatch ? "Durées différentes" : "Durées alignées"}
          </span>
                </div>
            </div>
            <div className="mb-4 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                <SessionTimeline sessionTimelineModel={sessionTimelineModel}/>
            </div>
            <WaveformPanel waveformPanelModel={waveformPanelModel}/>
            <NoisePanel noisePanelModel={noisePanelModel}/>
            <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-900/70 p-3">
                <NotesField notes={notes} onNotesChange={onNotesChange}/>
            </div>
        </div>
    );
}
