import {formatTime} from "../../utils/time";

type SessionTimelineData = {
    intro: number;
    plateau: number;
    outro: number;
    total: number;
};

export class SessionTimelineModel {
    readonly sessionTimeline: SessionTimelineData | null;
    readonly duration: number;
    readonly previewTime: number;
    readonly liveTime: number | null;

    constructor(params: {
        sessionTimeline: SessionTimelineData | null;
        duration: number;
        previewTime: number;
        liveTime: number | null;
    }) {
        this.sessionTimeline = params.sessionTimeline;
        this.duration = params.duration;
        this.previewTime = params.previewTime;
        this.liveTime = params.liveTime;
    }
}

type SessionTimelineProps = {
    sessionTimelineModel: SessionTimelineModel;
};

export function SessionTimeline({
                                    sessionTimelineModel,
                                }: SessionTimelineProps) {
    const {sessionTimeline, duration, previewTime, liveTime} =
        sessionTimelineModel;
    const total = sessionTimeline?.total ?? Math.max(1, duration);
    const intro = sessionTimeline?.intro ?? total;
    const plateau = sessionTimeline?.plateau ?? 0;
    const outro = sessionTimeline?.outro ?? 0;
    const hasSession = Boolean(sessionTimeline);

    return (
        <div className="mt-3 space-y-2">
            <div className="meta-row">
        <span>
          {hasSession ? "Séance" : "Lecture"}: {formatTime(total)}
        </span>
                <span>Fichier: {formatTime(duration)}</span>
            </div>
            <div className="relative flex h-2 overflow-hidden rounded-full border border-slate-800">
                <div
                    className={hasSession ? "bg-cyan-400/70" : "bg-slate-400/40"}
                    style={{
                        width: `${(intro / total) * 100}%`,
                    }}
                    aria-label={hasSession ? "Montée" : "Lecture"}
                />
                {hasSession ? (
                    <>
                        <div
                            className="bg-emerald-400/70"
                            style={{
                                width: `${(plateau / total) * 100}%`,
                            }}
                            aria-label="Plateau"
                        />
                        <div
                            className="bg-amber-300/70"
                            style={{
                                width: `${(outro / total) * 100}%`,
                            }}
                            aria-label="Sortie"
                        />
                    </>
                ) : null}
                <div
                    className="absolute top-0 h-2 w-0.5 rounded-full bg-white/80 shadow-sm shadow-white/40"
                    style={{
                        left: `${Math.min(100, Math.max(0, (previewTime / total) * 100))}%`,
                        transform: "translateX(-50%)",
                    }}
                    aria-label="Position de prévisualisation"
                />
                {liveTime !== null ? (
                    <div
                        className="absolute top-0 h-2 w-0.5 rounded-full bg-sky-200 shadow-sm shadow-sky-200/40"
                        style={{
                            left: `${Math.min(100, Math.max(0, (liveTime / total) * 100))}%`,
                            transform: "translateX(-50%)",
                        }}
                        aria-label="Position en lecture"
                    />
                ) : null}
            </div>
            {hasSession ? (
                <div className="meta-row">
                    <span>Montée</span>
                    <span>Plateau</span>
                    <span>Sortie</span>
                </div>
            ) : null}
            {liveTime !== null ? (
                <div className="meta-row">
                    <span>Écoulé: {formatTime(liveTime)}</span>
                    <span>Restant: {formatTime(total - liveTime)}</span>
                </div>
            ) : null}
        </div>
    );
}

export type {SessionTimelineData};
