import {Button} from "primereact/button";

export class PlaybackActionsModel {
    readonly isPlaying: boolean;
    readonly isExporting: boolean;
    readonly hasDurationMismatch: boolean;

    constructor(params: {
        isPlaying: boolean;
        isExporting: boolean;
        hasDurationMismatch: boolean;
    }) {
        this.isPlaying = params.isPlaying;
        this.isExporting = params.isExporting;
        this.hasDurationMismatch = params.hasDurationMismatch;
    }
}

type PlaybackActionsProps = {
    playbackActionsModel: PlaybackActionsModel;
    onStart: () => void;
    onStop: () => void;
    onDownload: () => void;
    onDownloadMp3: () => void;
};

export function PlaybackActions({
                                    playbackActionsModel,
                                    onStart,
                                    onStop,
                                    onDownload,
                                    onDownloadMp3,
                                }: PlaybackActionsProps) {
    const {isPlaying, isExporting, hasDurationMismatch} = playbackActionsModel;
    return (
        <>
            <div className="flex flex-wrap gap-3">
                <Button
                    icon="pi pi-play"
                    label="Démarrer"
                    onClick={onStart}
                    disabled={isPlaying}
                    severity="success"
                />
                <Button
                    icon="pi pi-pause"
                    label="Pause"
                    onClick={onStop}
                    disabled={!isPlaying}
                    severity="secondary"
                />
            </div>

            <Button
                className="w-full md:w-auto"
                icon="pi pi-download"
                label={isExporting ? "Export en cours..." : "Télécharger en WAV"}
                onClick={onDownload}
                disabled={isExporting}
                loading={isExporting}
                severity="info"
            />
            <Button
                className="w-full md:w-auto"
                icon="pi pi-download"
                label={isExporting ? "Export en cours..." : "Télécharger en MP3"}
                onClick={onDownloadMp3}
                disabled={isExporting}
                loading={isExporting}
                severity="help"
            />
            {hasDurationMismatch ? (
                <p className="text-[11px] text-amber-200">
                    Durées différentes: l&apos;export utilise la durée du fichier.
                </p>
            ) : null}
        </>
    );
}
