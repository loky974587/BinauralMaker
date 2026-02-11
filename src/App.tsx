import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Knob } from 'primereact/knob';
import { Slider, SliderChangeEvent } from 'primereact/slider';
import 'primereact/resources/themes/lara-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createWavBuffer = (channelData: Float32Array[], sampleRate: number) => {
  const channelCount = channelData.length;
  const frameCount = channelData[0].length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let sample = 0; sample < frameCount; sample += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const value = Math.max(-1, Math.min(1, channelData[channel][sample]));
      view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return buffer;
};

function App() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mergerNodeRef = useRef<ChannelMergerNode | null>(null);
  const splitterNodeRef = useRef<ChannelSplitterNode | null>(null);
  const analyserLeftRef = useRef<AnalyserNode | null>(null);
  const analyserRightRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [baseFrequency, setBaseFrequency] = useState(220);
  const [beatFrequency, setBeatFrequency] = useState(8);
  const [volume, setVolume] = useState(35);
  const [duration, setDuration] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [leftPreviewLevel, setLeftPreviewLevel] = useState(0);
  const [rightPreviewLevel, setRightPreviewLevel] = useState(0);

  const leftFrequency = useMemo(() => baseFrequency - beatFrequency / 2, [baseFrequency, beatFrequency]);
  const rightFrequency = useMemo(() => baseFrequency + beatFrequency / 2, [baseFrequency, beatFrequency]);

  useEffect(() => {
    if (isPlaying && leftOscRef.current && rightOscRef.current && gainNodeRef.current && audioContextRef.current) {
      leftOscRef.current.frequency.setValueAtTime(leftFrequency, audioContextRef.current.currentTime);
      rightOscRef.current.frequency.setValueAtTime(rightFrequency, audioContextRef.current.currentTime);
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
    }
  }, [isPlaying, leftFrequency, rightFrequency, volume]);

  useEffect(() => {
    if (!isPlaying || !analyserLeftRef.current || !analyserRightRef.current) {
      setLeftPreviewLevel(0);
      setRightPreviewLevel(0);
      return undefined;
    }

    const leftData = new Uint8Array(analyserLeftRef.current.fftSize);
    const rightData = new Uint8Array(analyserRightRef.current.fftSize);

    const extractPeak = (buffer: Uint8Array) => {
      let peak = 0;
      for (let index = 0; index < buffer.length; index += 1) {
        const normalized = Math.abs((buffer[index] - 128) / 128);
        peak = Math.max(peak, normalized);
      }
      return Math.round(peak * 100);
    };

    const drawLevels = () => {
      if (!analyserLeftRef.current || !analyserRightRef.current) {
        return;
      }

      analyserLeftRef.current.getByteTimeDomainData(leftData);
      analyserRightRef.current.getByteTimeDomainData(rightData);
      setLeftPreviewLevel(extractPeak(leftData));
      setRightPreviewLevel(extractPeak(rightData));
      animationFrameRef.current = window.requestAnimationFrame(drawLevels);
    };

    drawLevels();

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(
    () => () => {
      if (audioContextRef.current) {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
        audioContextRef.current.close();
      }
    },
    [],
  );

  const startTone = async () => {
    if (!window.AudioContext) {
      window.alert('Votre navigateur ne supporte pas Web Audio API.');
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      mergerNodeRef.current = audioContextRef.current.createChannelMerger(2);
      splitterNodeRef.current = audioContextRef.current.createChannelSplitter(2);
      gainNodeRef.current = audioContextRef.current.createGain();
      analyserLeftRef.current = audioContextRef.current.createAnalyser();
      analyserRightRef.current = audioContextRef.current.createAnalyser();

      analyserLeftRef.current.fftSize = 1024;
      analyserRightRef.current.fftSize = 1024;

      leftOscRef.current = audioContextRef.current.createOscillator();
      rightOscRef.current = audioContextRef.current.createOscillator();

      leftOscRef.current.type = 'sine';
      rightOscRef.current.type = 'sine';

      const leftGain = audioContextRef.current.createGain();
      const rightGain = audioContextRef.current.createGain();

      leftGain.gain.value = 1;
      rightGain.gain.value = 1;

      leftOscRef.current.connect(leftGain);
      rightOscRef.current.connect(rightGain);

      leftGain.connect(mergerNodeRef.current, 0, 0);
      rightGain.connect(mergerNodeRef.current, 0, 1);

      mergerNodeRef.current.connect(splitterNodeRef.current);
      splitterNodeRef.current.connect(analyserLeftRef.current, 0);
      splitterNodeRef.current.connect(analyserRightRef.current, 1);
      mergerNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      leftOscRef.current.start();
      rightOscRef.current.start();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsPlaying(true);
  };

  const stopTone = async () => {
    if (!audioContextRef.current) {
      return;
    }

    await audioContextRef.current.suspend();
    setIsPlaying(false);
  };

  const downloadTone = async () => {
    if (!window.OfflineAudioContext) {
      window.alert('Votre navigateur ne supporte pas OfflineAudioContext.');
      return;
    }

    setIsExporting(true);

    try {
      const sampleRate = 44100;
      const frameCount = Math.floor(sampleRate * duration);
      const offlineContext = new OfflineAudioContext(2, frameCount, sampleRate);

      const leftOscillator = offlineContext.createOscillator();
      const rightOscillator = offlineContext.createOscillator();
      leftOscillator.type = 'sine';
      rightOscillator.type = 'sine';
      leftOscillator.frequency.setValueAtTime(leftFrequency, 0);
      rightOscillator.frequency.setValueAtTime(rightFrequency, 0);

      const leftGain = offlineContext.createGain();
      const rightGain = offlineContext.createGain();
      const masterGain = offlineContext.createGain();
      const merger = offlineContext.createChannelMerger(2);

      leftGain.gain.value = 1;
      rightGain.gain.value = 1;
      masterGain.gain.value = volume / 100;

      leftOscillator.connect(leftGain);
      rightOscillator.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(masterGain);
      masterGain.connect(offlineContext.destination);

      leftOscillator.start(0);
      rightOscillator.start(0);
      leftOscillator.stop(duration);
      rightOscillator.stop(duration);

      const renderedBuffer = await offlineContext.startRendering();
      const wavBuffer = createWavBuffer(
        [renderedBuffer.getChannelData(0), renderedBuffer.getChannelData(1)],
        renderedBuffer.sampleRate,
      );

      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = `binaural-${baseFrequency}hz-${beatFrequency}hz-${duration}s.wav`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBaseFrequencyChange = (event: InputNumberValueChangeEvent) => {
    setBaseFrequency(clamp((event.value as number | null) ?? 220, 20, 1200));
  };

  const handleBeatFrequencyChange = (event: InputNumberValueChangeEvent) => {
    setBeatFrequency(clamp((event.value as number | null) ?? 8, 1, 40));
  };

  const handleDurationChange = (event: InputNumberValueChangeEvent) => {
    setDuration(clamp((event.value as number | null) ?? 30, 5, 300));
  };

  const handleVolumeChange = (event: SliderChangeEvent) => {
    const sliderValue = Array.isArray(event.value) ? event.value[0] : event.value;
    setVolume(clamp(sliderValue ?? 0, 0, 100));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 text-slate-100 sm:px-8">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Binaural Maker</h1>
        <p className="mt-3 text-slate-300">Créez un battement binaural personnalisé en quelques secondes.</p>
      </header>

      <Card className="shadow-2xl shadow-slate-950/50">
        <section className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Fréquence de base (Hz)</span>
              <InputNumber
                value={baseFrequency}
                onValueChange={handleBaseFrequencyChange}
                mode="decimal"
                min={20}
                max={1200}
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Battement binaural (Hz)</span>
              <InputNumber
                value={beatFrequency}
                onValueChange={handleBeatFrequencyChange}
                mode="decimal"
                min={1}
                max={40}
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Volume</span>
              <Slider value={volume} onChange={handleVolumeChange} />
              <span className="text-xs text-slate-300">{volume}%</span>
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                icon="pi pi-play"
                label="Démarrer"
                onClick={startTone}
                disabled={isPlaying}
                severity="success"
              />
              <Button
                icon="pi pi-pause"
                label="Pause"
                onClick={stopTone}
                disabled={!isPlaying}
                severity="secondary"
              />
            </div>

            <label className="mt-2 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Durée du fichier (secondes)</span>
              <InputNumber
                value={duration}
                onValueChange={handleDurationChange}
                min={5}
                max={300}
                showButtons
                buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
            </label>

            <Button
              className="w-full md:w-auto"
              icon="pi pi-download"
              label={isExporting ? 'Export en cours...' : 'Télécharger en WAV'}
              onClick={downloadTone}
              disabled={isExporting}
              loading={isExporting}
              severity="info"
            />
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
            <h2 className="mb-4 text-xl font-semibold">Prévisualisation des canaux</h2>
            <div className="flex items-center justify-evenly gap-4">
              <div className="text-center">
                <Knob value={Math.round(leftFrequency)} min={20} max={1200} readOnly />
                <p className="mt-2 text-sm text-slate-300">Canal gauche</p>
              </div>
              <div className="text-center">
                <Knob value={Math.round(rightFrequency)} min={20} max={1200} readOnly />
                <p className="mt-2 text-sm text-slate-300">Canal droit</p>
              </div>
            </div>

            <Divider />

            <h3 className="mb-2 text-sm font-semibold text-slate-200">Prévisualisation live du niveau audio</h3>
            <div className="mb-4 space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>Canal gauche</span>
                  <span>{leftPreviewLevel}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-cyan-400 transition-all"
                    style={{ width: `${leftPreviewLevel}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>Canal droit</span>
                  <span>{rightPreviewLevel}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-indigo-400 transition-all"
                    style={{ width: `${rightPreviewLevel}%` }}
                  />
                </div>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                Différence effective: <strong>{beatFrequency} Hz</strong>
              </li>
              <li>
                Fréquence gauche: <strong>{leftFrequency.toFixed(2)} Hz</strong>
              </li>
              <li>
                Fréquence droite: <strong>{rightFrequency.toFixed(2)} Hz</strong>
              </li>
              <li>
                Casque recommandé: <strong>oui</strong>
              </li>
            </ul>
          </div>
        </section>
      </Card>

      <footer className="text-center text-xs text-slate-400">
        <p>Conseil: commencez avec un volume faible pour protéger votre audition.</p>
      </footer>
    </main>
  );
}

export default App;
