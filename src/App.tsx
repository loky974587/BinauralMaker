import {useEffect, useMemo, useState} from "react";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import {AppLayout, AppLayoutModel} from "./components/AppLayout";
import {Generator} from "./components/Generator";
import {Preview} from "./components/Preview";
import {StickyActionBar, StickyActionBarModel} from "./components/generator/StickyActionBar";
import {useAudioPlayback} from "./hooks/useAudioPlayback";
import {useAudioSettings} from "./hooks/useAudioSettings";
import {useStoredSettings} from "./hooks/useStoredSettings";
import {GeneratorModel} from "./models/generatorModel";
import {PreviewModel} from "./models/previewModel";

function App() {
    const {storedSettings, persistSettings} = useStoredSettings();
    const audioSettings = useAudioSettings(storedSettings);
    const isFirstVisit = storedSettings === null;

    const {
        baseFrequency,
        beatFrequency,
        volume,
        duration,
        notes,
        session,
        noise,
        activePreset,
        isWarningVisible,
        automation,
        applyPreset,
        setNotes,
        setIsWarningVisible,
        updateBaseFrequency,
        updateBeatFrequency,
        updateVolume,
        updateDuration,
        updateSession,
        updateNoise,
        storedSettingsSnapshot,
    } = audioSettings;

    const {
        isPlaying,
        playStartedAt,
        isExporting,
        isExportingWav,
        isExportingMp3,
        start,
        stop,
        downloadWav,
        downloadMp3,
    } = useAudioPlayback({
        settings: {
            baseFrequency,
            beatFrequency,
            volume,
            automation,
            session,
            noise,
        },
        exportSettings: {
            baseFrequency,
            beatFrequency,
            volume,
            duration,
            notes,
            automation,
            session,
            noise,
        },
    });

    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!isPlaying || playStartedAt === null) {
            setElapsedSeconds(0);
            return;
        }
        const interval = window.setInterval(() => {
            setElapsedSeconds(Math.max(0, (performance.now() - playStartedAt) / 1000));
        }, 1000);
        return () => {
            window.clearInterval(interval);
        };
    }, [isPlaying, playStartedAt]);

    useEffect(() => {
        persistSettings(storedSettingsSnapshot);
    }, [persistSettings, storedSettingsSnapshot]);

    const hasDurationMismatch =
        session.enabled &&
        Math.round(duration) !==
        Math.round(
            session.introDuration +
            session.plateauDuration +
            session.outroDuration,
        );

    const generatorModel = useMemo(
        () =>
            new GeneratorModel({
                baseFrequency,
                beatFrequency,
                volume,
                duration,
                notes,
                session,
                noise,
                isPlaying,
                isExporting,
                playStartedAt,
                isFirstVisit,
                activePreset,
            }),
        [
            baseFrequency,
            beatFrequency,
            volume,
            duration,
            notes,
            session,
            noise,
            isPlaying,
            isExporting,
            playStartedAt,
            isFirstVisit,
            activePreset,
        ],
    );

    const previewModel = useMemo(
        () =>
            new PreviewModel({
                baseFrequency,
                beatFrequency,
                duration,
                notes,
                automation,
                session,
                noise,
                isPlaying,
                playStartedAt,
            }),
        [
            baseFrequency,
            beatFrequency,
            duration,
            notes,
            automation,
            session,
            noise,
            isPlaying,
            playStartedAt,
        ],
    );

    const stickyActionBarModel = useMemo(
        () =>
            new StickyActionBarModel({
                isPlaying,
                isExporting,
                isExportingWav,
                isExportingMp3,
                elapsedSeconds,
                hasDurationMismatch,
            }),
        [
            isPlaying,
            isExporting,
            isExportingWav,
            isExportingMp3,
            elapsedSeconds,
            hasDurationMismatch,
        ],
    );

    const floatingBar = useMemo(
        () => (
            <StickyActionBar
                stickyActionBarModel={stickyActionBarModel}
                onStart={start}
                onStop={stop}
                onDownload={downloadWav}
                onDownloadMp3={downloadMp3}
            />
        ),
        [stickyActionBarModel, start, stop, downloadWav, downloadMp3],
    );

    const appContent = useMemo(
        () => (
            <>
                <Generator
                    generatorModel={generatorModel}
                    onApplyPreset={applyPreset}
                    onBaseFrequencyChange={updateBaseFrequency}
                    onBeatFrequencyChange={updateBeatFrequency}
                    onVolumeChange={updateVolume}
                    onDurationChange={updateDuration}
                    onSessionChange={updateSession}
                    onNoiseChange={updateNoise}
                    onNotesChange={setNotes}
                />

                <Preview
                    previewModel={previewModel}
                    onNotesChange={setNotes}
                />
            </>
        ),
        [
            generatorModel,
            previewModel,
            applyPreset,
            updateBaseFrequency,
            updateBeatFrequency,
            updateVolume,
            updateDuration,
            updateSession,
            updateNoise,
            setNotes,
        ],
    );

    const appLayoutModel = useMemo(
        () =>
            new AppLayoutModel({
                showWarning: isWarningVisible,
                floatingBar,
                children: appContent,
            }),
        [isWarningVisible, floatingBar, appContent],
    );

    return (
        <AppLayout
            appLayoutModel={appLayoutModel}
            onDismissWarning={() => setIsWarningVisible(false)}
            onShowWarning={() => setIsWarningVisible(true)}
        />
    );
}

export default App;
