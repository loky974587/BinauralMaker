import {useCallback, useEffect, useRef, useState} from "react";
import {BinauralAudioService} from "../services/audioService";
import type {AudioSettings, ExportSettings} from "../types/audio";

type PlaybackParams = {
    settings: AudioSettings;
    exportSettings: ExportSettings;
};

export const useAudioPlayback = ({
                                     settings,
                                     exportSettings,
                                 }: PlaybackParams) => {
    const audioServiceRef = useRef(new BinauralAudioService());
    const [isPlaying, setIsPlaying] = useState(false);
    const [playStartedAt, setPlayStartedAt] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (!isPlaying) {
            return;
        }
        audioServiceRef.current.update(settings);
    }, [isPlaying, settings]);

    useEffect(
        () => () => {
            audioServiceRef.current.dispose().then();
        },
        [],
    );

    const start = useCallback(async () => {
        try {
            await audioServiceRef.current.start(settings);
            setPlayStartedAt(performance.now());
            setIsPlaying(true);
        } catch (error) {
            window.alert("Votre navigateur ne supporte pas Web Audio API.");
        }
    }, [settings]);

    const stop = useCallback(async () => {
        await audioServiceRef.current.stop();
        setPlayStartedAt(null);
        setIsPlaying(false);
    }, []);

    const downloadWav = useCallback(async () => {
        setIsExporting(true);

        try {
            const blob = await audioServiceRef.current.exportWav(exportSettings);
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = BinauralAudioService.makeFilename(
                exportSettings.baseFrequency,
                exportSettings.beatFrequency,
                exportSettings.duration,
                "wav",
            );
            link.click();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            window.alert("Votre navigateur ne supporte pas OfflineAudioContext.");
        } finally {
            setIsExporting(false);
        }
    }, [exportSettings]);

    const downloadMp3 = useCallback(async () => {
        setIsExporting(true);

        try {
            const blob = await audioServiceRef.current.exportMp3(exportSettings);
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = BinauralAudioService.makeFilename(
                exportSettings.baseFrequency,
                exportSettings.beatFrequency,
                exportSettings.duration,
                "mp3",
            );
            link.click();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            window.alert("Export MP3 indisponible sur ce navigateur.");
        } finally {
            setIsExporting(false);
        }
    }, [exportSettings]);

    return {
        isPlaying,
        playStartedAt,
        isExporting,
        start,
        stop,
        downloadWav,
        downloadMp3,
    };
};
