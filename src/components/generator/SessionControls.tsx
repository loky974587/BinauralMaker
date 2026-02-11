import {Button} from "primereact/button";
import {InputNumber, InputNumberValueChangeEvent,} from "primereact/inputnumber";
import {InputSwitch} from "primereact/inputswitch";
import {Slider, SliderChangeEvent} from "primereact/slider";
import {SessionsSettings} from "../../types/audio";
import {DURATION_RANGE, SESSION_RANGE} from "../../constants/ranges";
import {clamp} from "../../utils/math";
import {formatTime} from "../../utils/time";

export class SessionControlsModel {
    readonly duration: number;
    readonly session: SessionsSettings;

    constructor(params: { duration: number; session: SessionsSettings }) {
        this.duration = params.duration;
        this.session = params.session;
    }
}

type SessionControlsProps = {
    sessionControlsModel: SessionControlsModel;
    onDurationChange: (value: number) => void;
    onSessionChange: (value: SessionsSettings) => void;
};

export function SessionControls({
                                    sessionControlsModel,
                                    onDurationChange,
                                    onSessionChange,
                                }: SessionControlsProps) {
    const {duration, session} = sessionControlsModel;
    const handleDurationChange = (event: InputNumberValueChangeEvent) => {
        onDurationChange(
            clamp(
                (event.value as number | null) ?? 1500,
                DURATION_RANGE.min,
                DURATION_RANGE.max,
            ),
        );
    };

    const handleSessionToggle = (enabled: boolean) => {
        onSessionChange({...session, enabled});
    };

    const normalizeSessionDurations = (nextSession: SessionsSettings) => {
        const minTotal = SESSION_RANGE.minTotal;
        const maxTotal = SESSION_RANGE.maxTotal;
        let intro = Math.max(0, nextSession.introDuration);
        let plateau = Math.max(0, nextSession.plateauDuration);
        let outro = Math.max(0, nextSession.outroDuration);
        let total = intro + plateau + outro;

        if (total < minTotal) {
            plateau = Math.max(0, minTotal - intro - outro);
            total = intro + plateau + outro;
        }

        if (total > maxTotal) {
            const excess = total - maxTotal;
            if (plateau > 0) {
                plateau = Math.max(0, plateau - excess);
                total = intro + plateau + outro;
            }
            if (total > maxTotal) {
                const edgeTotal = intro + outro;
                if (edgeTotal > 0) {
                    const scale = maxTotal / edgeTotal;
                    intro *= scale;
                    outro *= scale;
                } else {
                    plateau = maxTotal;
                }
            }
        }

        return {
            ...nextSession,
            introDuration: Math.round(intro),
            plateauDuration: Math.round(plateau),
            outroDuration: Math.round(outro),
        };
    };

    const handleSessionPhaseChange = (
        key: "introDuration" | "plateauDuration" | "outroDuration",
        minutes: number,
    ) => {
        const clampedMinutes = clamp(
            minutes,
            SESSION_RANGE.phaseMinMinutes,
            SESSION_RANGE.phaseMaxMinutes,
        );
        const nextSession = {...session, [key]: Math.round(clampedMinutes * 60)};
        onSessionChange(normalizeSessionDurations(nextSession));
    };

    const sessionTotalDuration =
        session.introDuration + session.plateauDuration + session.outroDuration;
    const sessionTotalMinutes = sessionTotalDuration / 60;
    const hasDurationMismatch =
        session.enabled &&
        Math.round(duration) !== Math.round(sessionTotalDuration);
    const sessionSliderValue: [number, number] = [
        clamp(session.introDuration, 0, Math.max(1, sessionTotalDuration)),
        clamp(
            session.introDuration + session.plateauDuration,
            0,
            Math.max(1, sessionTotalDuration),
        ),
    ];

    const handleSessionSliderChange = (event: SliderChangeEvent) => {
        if (!session.enabled) {
            return;
        }
        const total = Math.max(1, sessionTotalDuration);
        const rawValue = Array.isArray(event.value) ? event.value : [0, 0];
        const introEnd = clamp(rawValue[0] ?? 0, 0, total);
        const plateauEnd = clamp(rawValue[1] ?? introEnd, introEnd, total);
        const nextSession = {
            ...session,
            introDuration: Math.round(introEnd),
            plateauDuration: Math.round(plateauEnd - introEnd),
            outroDuration: Math.round(total - plateauEnd),
        };
        onSessionChange(normalizeSessionDurations(nextSession));
    };

    const handleSessionApplyChange = (
        key: "applyToVolume" | "applyToBeat",
        value: boolean,
    ) => {
        onSessionChange({...session, [key]: value});
    };

    return (
        <>
            <div className="field-col mt-2">
                <label
                    className="text-label-strong"
                    htmlFor="file-duration-input"
                    id="file-duration-label"
                >
                    Durée du fichier (secondes)
                </label>
                <InputNumber
                    inputId="file-duration-input"
                    value={duration}
                    onValueChange={handleDurationChange}
                    min={DURATION_RANGE.min}
                    max={DURATION_RANGE.max}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    aria-describedby="file-duration-help"
                />
                {session.enabled ? (
                    <div
                        className="flex flex-wrap items-center gap-2 text-muted"
                        id="file-duration-help"
                    >
            <span>
              Durée de la séance: {sessionTotalMinutes.toFixed(1)} min (
                {Math.round(sessionTotalDuration)} s)
            </span>
                        <Button
                            label="Aligner la durée"
                            size="small"
                            severity={hasDurationMismatch ? "warning" : "secondary"}
                            onClick={() => onDurationChange(Math.round(sessionTotalDuration))}
                        />
                        {hasDurationMismatch ? (
                            <span className="text-amber-300">Durées différentes</span>
                        ) : null}
                    </div>
                ) : (
                    <p className="text-hint" id="file-duration-help">
                        La durée du fichier définit la longueur d&apos;export.
                    </p>
                )}
            </div>

            <div className="panel-card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-label">
                            Séance guidée
                        </p>
                        <p className="text-muted">
                            Montée douce, plateau, sortie progressive
                        </p>
                    </div>
                    <div className="row-gap-2">
                        <label
                            className="text-muted-strong"
                            htmlFor="session-toggle"
                            id="session-toggle-label"
                        >
                            Activer
                        </label>
                        <InputSwitch
                            inputId="session-toggle"
                            checked={session.enabled}
                            onChange={(event) => handleSessionToggle(Boolean(event.value))}
                        />
                    </div>
                </div>
                {session.enabled ? (
                    <div className="mt-4 space-y-4">
                        <div>
                            <div className="mb-2 flex items-center justify-between text-muted">
                                <span>Répartition de la séance</span>
                                <span>{sessionTotalMinutes.toFixed(1)} min</span>
                            </div>
                            <div className="relative">
                                <label
                                    htmlFor="session-range-slider"
                                    id="session-range-label"
                                    className="sr-only"
                                >
                                    Ajuster la répartition de la séance
                                </label>
                                <div className="flex h-2 overflow-hidden rounded-full border border-slate-800">
                                    <div
                                        className="bg-cyan-400/70"
                                        style={{
                                            width: `${(session.introDuration / Math.max(1, sessionTotalDuration)) * 100}%`,
                                        }}
                                        aria-label="Montée"
                                    />
                                    <div
                                        className="bg-emerald-400/70"
                                        style={{
                                            width: `${(session.plateauDuration / Math.max(1, sessionTotalDuration)) * 100}%`,
                                        }}
                                        aria-label="Plateau"
                                    />
                                    <div
                                        className="bg-amber-300/70"
                                        style={{
                                            width: `${(session.outroDuration / Math.max(1, sessionTotalDuration)) * 100}%`,
                                        }}
                                        aria-label="Sortie"
                                    />
                                </div>
                                <Slider
                                    id="session-range-slider"
                                    className="session-slider absolute inset-0"
                                    value={sessionSliderValue}
                                    onChange={handleSessionSliderChange}
                                    min={0}
                                    max={Math.max(1, sessionTotalDuration)}
                                    step={1}
                                    range
                                    ariaLabelledBy="session-range-label"
                                />
                            </div>
                            <div className="mt-2 meta-row">
                                <span>Montée {formatTime(session.introDuration)}</span>
                                <span>Plateau {formatTime(session.plateauDuration)}</span>
                                <span>Sortie {formatTime(session.outroDuration)}</span>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="field-col text-muted-strong">
                                <label htmlFor="session-intro-input">
                                    Phase 1 · montée (min)
                                </label>
                                <InputNumber
                                    inputId="session-intro-input"
                                    value={session.introDuration / 60}
                                    onValueChange={(event) =>
                                        handleSessionPhaseChange(
                                            "introDuration",
                                            (event.value as number | null) ?? 0.5,
                                        )
                                    }
                                    min={SESSION_RANGE.phaseMinMinutes}
                                    max={SESSION_RANGE.phaseMaxMinutes}
                                    mode="decimal"
                                    step={0.1}
                                />
                            </div>
                            <div className="field-col text-muted-strong">
                                <label htmlFor="session-plateau-input">
                                    Phase 2 · plateau (min)
                                </label>
                                <InputNumber
                                    inputId="session-plateau-input"
                                    value={session.plateauDuration / 60}
                                    onValueChange={(event) =>
                                        handleSessionPhaseChange(
                                            "plateauDuration",
                                            (event.value as number | null) ?? 0.5,
                                        )
                                    }
                                    min={SESSION_RANGE.phaseMinMinutes}
                                    max={SESSION_RANGE.phaseMaxMinutes}
                                    mode="decimal"
                                    step={0.1}
                                />
                            </div>
                            <div className="field-col text-muted-strong">
                                <label htmlFor="session-outro-input">
                                    Phase 3 · sortie (min)
                                </label>
                                <InputNumber
                                    inputId="session-outro-input"
                                    value={session.outroDuration / 60}
                                    onValueChange={(event) =>
                                        handleSessionPhaseChange(
                                            "outroDuration",
                                            (event.value as number | null) ?? 0.5,
                                        )
                                    }
                                    min={SESSION_RANGE.phaseMinMinutes}
                                    max={SESSION_RANGE.phaseMaxMinutes}
                                    mode="decimal"
                                    step={0.1}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-300 sm:col-span-2 lg:col-span-3">
                                <div className="row-gap-2">
                                    <label htmlFor="session-volume-toggle">
                                        Appliquer au volume
                                    </label>
                                    <InputSwitch
                                        inputId="session-volume-toggle"
                                        checked={session.applyToVolume}
                                        onChange={(event) =>
                                            handleSessionApplyChange(
                                                "applyToVolume",
                                                Boolean(event.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="row-gap-2">
                                    <label htmlFor="session-beat-toggle">
                                        Appliquer au battement
                                    </label>
                                    <InputSwitch
                                        inputId="session-beat-toggle"
                                        checked={session.applyToBeat}
                                        onChange={(event) =>
                                            handleSessionApplyChange(
                                                "applyToBeat",
                                                Boolean(event.value),
                                            )
                                        }
                                    />
                                </div>
                                <span className="ml-auto text-slate-400">
                  Durée totale: {sessionTotalMinutes.toFixed(1)} min
                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-hint">
                        Activez la séance pour une montée douce, un plateau stable et une
                        sortie progressive.
                    </p>
                )}
            </div>
        </>
    );
}
