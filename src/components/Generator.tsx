import {useEffect, useMemo, useState} from "react";
import type {PresetId} from "../constants/presets";
import type {GeneratorModel} from "../models/generatorModel";
import type {NoiseSettings, SessionsSettings} from "../types/audio";
import {formatTime} from "../utils/time";
import {FrequencyControls} from "./generator/FrequencyControls";
import {HelpPanel} from "./generator/HelpPanel";
import {TexturePanel, TexturePanelModel} from "./generator/TexturePanel";
import {PresetPanel} from "./generator/PresetPanel";
import {SessionControls, SessionControlsModel} from "./generator/SessionControls";
import {VolumeControls} from "./generator/VolumeControls";

type GeneratorProps = {
    generatorModel: GeneratorModel;
    onApplyPreset: (presetId: PresetId) => void;
    onBaseFrequencyChange: (value: number) => void;
    onBeatFrequencyChange: (value: number) => void;
    onVolumeChange: (value: number) => void;
    onDurationChange: (value: number) => void;
    onSessionChange: (value: SessionsSettings) => void;
    onNoiseChange: (value: NoiseSettings) => void;
    onNotesChange: (value: string) => void;
};

export function Generator({
                              generatorModel,
                              onApplyPreset,
                              onBaseFrequencyChange,
                              onBeatFrequencyChange,
                              onVolumeChange,
                              onDurationChange,
                              onSessionChange,
                              onNoiseChange,
                              onNotesChange,
                          }: GeneratorProps) {
    const {
        baseFrequency,
        beatFrequency,
        volume,
        duration,
        notes,
        session,
        noise,
        isPlaying,
        isFirstVisit,
        activePreset,
    } = generatorModel;

    const [showHelp, setShowHelp] = useState(false);
    const [isGuidedOpen, setIsGuidedOpen] = useState(!isFirstVisit);
    const [isTextureOpen, setIsTextureOpen] = useState(!isFirstVisit);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!generatorModel.isPlaying || generatorModel.playStartedAt === null) {
            setElapsedSeconds(0);
            return;
        }
        const startedAt = generatorModel.playStartedAt;
        const interval = window.setInterval(() => {
            setElapsedSeconds(Math.max(0, (performance.now() - startedAt) / 1000));
        }, 1000);
        return () => {
            window.clearInterval(interval);
        };
    }, [generatorModel.isPlaying, generatorModel.playStartedAt]);

    const sessionTotalDuration = generatorModel.getSessionTotalDuration();
    const sessionSummary = useMemo(() => {
        if (!session.enabled) {
            return "Séance désactivée";
        }
        return `Total ${formatTime(sessionTotalDuration)} · Montée ${formatTime(
            session.introDuration,
        )} · Plateau ${formatTime(session.plateauDuration)} · Sortie ${formatTime(
            session.outroDuration,
        )}`;
    }, [
        session.enabled,
        session.introDuration,
        session.plateauDuration,
        session.outroDuration,
        sessionTotalDuration,
    ]);

    const noiseSummary = useMemo(() => {
        if (!noise.enabled) {
            return "Texture désactivée";
        }
        return `${noise.type === "pink" ? "Rose" : "Blanc"} · ${noise.level}%`;
    }, [
        noise.enabled,
        noise.level,
        noise.type,
    ]);

    const sessionControlsModel = useMemo(
        () =>
            new SessionControlsModel({
                duration,
                session,
            }),
        [duration, session],
    );
    const texturePanelModel = useMemo(
        () =>
            new TexturePanelModel({
                noise,
                summary: noiseSummary,
                isOpen: isTextureOpen,
                notes,
            }),
        [noise, noiseSummary, isTextureOpen, notes],
    );

    return (
        <div className="flex flex-col gap-6">
            <HelpPanel
                showHelp={showHelp}
                onToggle={() => setShowHelp((current) => !current)}
            />

            <PresetPanel
                activePreset={activePreset}
                onApplyPreset={onApplyPreset}
            />

            <section className="section-card">
                <div className="section-header">
                    <div>
                        <h3 className="text-heading">
                            Réglages essentiels
                        </h3>
                        <p className="text-muted">
                            Fondations sonores et équilibre général.
                        </p>
                    </div>
                    {isPlaying ? (
                        <div
                            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                            Lecture en cours · {formatTime(Math.floor(elapsedSeconds))}
                        </div>
                    ) : (
                        <div className="rounded-full border border-slate-700/70 px-3 py-1 text-xs text-slate-300">
                            À l&apos;arrêt
                        </div>
                    )}
                </div>

                <FrequencyControls
                    baseFrequency={baseFrequency}
                    beatFrequency={beatFrequency}
                    onBaseFrequencyChange={onBaseFrequencyChange}
                    onBeatFrequencyChange={onBeatFrequencyChange}
                />

                <VolumeControls
                    volume={volume}
                    onVolumeChange={onVolumeChange}
                />
            </section>

            <section className="section-card">
                <details
                    open={isGuidedOpen}
                    onToggle={(event) =>
                        setIsGuidedOpen((event.target as HTMLDetailsElement).open)
                    }
                >
                    <summary className="cursor-pointer list-none">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="text-heading">
                                    Séance guidée
                                </h3>
                                <p className="text-muted">
                                    {sessionSummary}
                                </p>
                            </div>
                            <div className="row-gap-2">
                <span className="pill-muted">
                  {session.enabled ? "Active" : "Inactive"}
                </span>
                                <span className="meta-inline">
                  {isGuidedOpen ? "Replier" : "Déplier"}
                                    <i
                                        className={`pi pi-chevron-down text-[10px] transition-transform ${
                                            isGuidedOpen ? "rotate-180" : ""
                                        }`}
                                        aria-hidden="true"
                                    />
                </span>
                            </div>
                        </div>
                    </summary>
                    <div className="mt-4">
                        <SessionControls
                            sessionControlsModel={sessionControlsModel}
                            onDurationChange={onDurationChange}
                            onSessionChange={onSessionChange}
                        />
                    </div>
                </details>
            </section>

            <TexturePanel
                texturePanelModel={texturePanelModel}
                onToggle={setIsTextureOpen}
                onNoiseChange={onNoiseChange}
                onNotesChange={onNotesChange}
            />
        </div>
    );
}
