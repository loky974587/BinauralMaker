import {Button} from "primereact/button";
import {formatTime} from "../../utils/time";

export class StickyActionBarModel {
    readonly isPlaying: boolean;
    readonly isExporting: boolean;
    readonly elapsedSeconds: number;
    readonly hasDurationMismatch: boolean;

    constructor(params: {
        isPlaying: boolean;
        isExporting: boolean;
        elapsedSeconds: number;
        hasDurationMismatch: boolean;
    }) {
        this.isPlaying = params.isPlaying;
        this.isExporting = params.isExporting;
        this.elapsedSeconds = params.elapsedSeconds;
        this.hasDurationMismatch = params.hasDurationMismatch;
    }
}

type StickyActionBarProps = {
    stickyActionBarModel: StickyActionBarModel;
    onStart: () => void;
    onStop: () => void;
    onDownload: () => void;
    onDownloadMp3: () => void;
};

export function StickyActionBar({
                                    stickyActionBarModel,
                                    onStart,
                                    onStop,
                                    onDownload,
                                    onDownloadMp3,
                                }: StickyActionBarProps) {
    const {isPlaying, isExporting, elapsedSeconds, hasDurationMismatch} =
        stickyActionBarModel;
    return (
        <div
            className="sticky bottom-4 z-20 w-full self-stretch rounded-2xl border border-slate-800/90 bg-slate-950/90 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                    <p className="text-xs font-semibold text-slate-200">
                        {isPlaying ? "Lecture en cours" : "Prêt à écouter"}
                    </p>
                    <p className="text-meta">
                        {isPlaying
                            ? `Temps écoulé: ${formatTime(Math.floor(elapsedSeconds))}`
                            : "Lancez un aperçu avant export."}
                    </p>
                </div>
                <div className="flex flex-1 justify-center">
                    <div className="flex flex-wrap items-center gap-2">
                        {isPlaying ? (
                            <Button
                                icon="pi pi-pause"
                                label="Pause"
                                onClick={onStop}
                                severity="secondary"
                            />
                        ) : (
                            <Button
                                icon="pi pi-play"
                                label="Écouter"
                                onClick={onStart}
                                severity="success"
                            />
                        )}
                    </div>
                </div>
                <div className="flex flex-1 justify-end">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            icon="pi pi-download"
                            label="Export WAV"
                            onClick={onDownload}
                            disabled={isExporting}
                            loading={isExporting}
                            severity="info"
                        />
                        <Button
                            icon="pi pi-download"
                            label="Export MP3"
                            onClick={onDownloadMp3}
                            disabled={isExporting}
                            loading={isExporting}
                            severity="help"
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-[180px] md:hidden"/>
            </div>
            {hasDurationMismatch ? (
                <p className="mt-3 text-[11px] text-amber-200">
                    Durées différentes: l&apos;export utilise la durée du fichier, la
                    séance guidée sera ajustée.
                </p>
            ) : null}
        </div>
    );
}
