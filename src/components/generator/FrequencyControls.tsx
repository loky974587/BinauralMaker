import {InputNumber, InputNumberValueChangeEvent,} from "primereact/inputnumber";
import {Slider, SliderChangeEvent} from "primereact/slider";
import {FREQUENCY_RANGES} from "../../constants/ranges";
import {clamp} from "../../utils/math";

type FrequencyControlsProps = {
    baseFrequency: number;
    beatFrequency: number;
    onBaseFrequencyChange: (value: number) => void;
    onBeatFrequencyChange: (value: number) => void;
};

export function FrequencyControls({
                                      baseFrequency,
                                      beatFrequency,
                                      onBaseFrequencyChange,
                                      onBeatFrequencyChange,
                                  }: FrequencyControlsProps) {
    const {base, beat} = FREQUENCY_RANGES;

    const handleBaseFrequencyChange = (event: InputNumberValueChangeEvent) => {
        onBaseFrequencyChange(
            clamp((event.value as number | null) ?? 220, base.min, base.max),
        );
    };

    const handleBaseSliderChange = (event: SliderChangeEvent) => {
        const sliderValue = Array.isArray(event.value)
            ? event.value[0]
            : event.value;
        onBaseFrequencyChange(clamp(sliderValue ?? 220, base.min, base.max));
    };

    const handleBeatFrequencyChange = (event: InputNumberValueChangeEvent) => {
        onBeatFrequencyChange(
            clamp((event.value as number | null) ?? 6, beat.min, beat.max),
        );
    };

    const handleBeatSliderChange = (event: SliderChangeEvent) => {
        const sliderValue = Array.isArray(event.value)
            ? event.value[0]
            : event.value;
        onBeatFrequencyChange(clamp(sliderValue ?? 6, beat.min, beat.max));
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="stack-row-lg">
                <div className="field-col flex-1">
                    <label
                        className="text-label-strong"
                        htmlFor="base-frequency-input"
                        id="base-frequency-label"
                    >
                        Fréquence de base
                    </label>
                    <p className="text-muted" id="base-frequency-help">
                        Repères visuels pour choisir une hauteur confortable.
                    </p>
                    <p className="text-hint">
                        Pourquoi: la base colore la sensation générale (plus grave = plus
                        enveloppant).
                    </p>
                    <div className="row-gap-2">
                        <InputNumber
                            inputId="base-frequency-input"
                            value={baseFrequency}
                            onValueChange={handleBaseFrequencyChange}
                            mode="decimal"
                            min={base.min}
                            max={base.max}
                            showButtons={false}
                            aria-describedby="base-frequency-help"
                        />
                        <span className="text-xs font-semibold text-slate-300">Hz</span>
                    </div>
                    <div className="relative">
                        <label htmlFor="base-frequency-slider" className="sr-only">
                            Ajuster la fréquence de base (curseur)
                        </label>
                        <Slider
                            id="base-frequency-slider"
                            className="base-slider"
                            value={baseFrequency}
                            onChange={handleBaseSliderChange}
                            min={base.min}
                            max={base.max}
                            step={1}
                            ariaLabelledBy="base-frequency-label"
                            aria-describedby="base-frequency-help"
                        />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2 text-meta">
            <span className="flex items-center gap-1 text-left">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80"/>
              Grave 20–200 Hz
            </span>
                        <span className="flex items-center gap-1 text-center">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-300/70"/>
              Médium 200–600 Hz
            </span>
                        <span className="flex items-center gap-1 text-right">
              <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300/80"/>
              Brillant 600–1200 Hz
            </span>
                    </div>
                </div>
            </div>

            <div className="stack-row-lg">
                <div className="field-col flex-1">
                    <label
                        className="text-label-strong"
                        htmlFor="beat-frequency-input"
                        id="beat-frequency-label"
                    >
                        Fréquence de battement
                    </label>
                    <p className="text-muted" id="beat-frequency-help">
                        Repères visuels pour ajuster sans brider.
                    </p>
                    <p className="text-hint">
                        Pourquoi: plus bas = détente, plus haut = éveil perçu.
                    </p>
                    <div className="row-gap-2">
                        <InputNumber
                            inputId="beat-frequency-input"
                            value={beatFrequency}
                            onValueChange={handleBeatFrequencyChange}
                            mode="decimal"
                            min={beat.min}
                            max={beat.max}
                            showButtons={false}
                            aria-describedby="beat-frequency-help"
                        />
                        <span className="text-xs font-semibold text-slate-300">Hz</span>
                    </div>
                    <div className="relative">
                        <label htmlFor="beat-frequency-slider" className="sr-only">
                            Ajuster la fréquence de battement (curseur)
                        </label>
                        <Slider
                            id="beat-frequency-slider"
                            className="beat-slider"
                            value={beatFrequency}
                            onChange={handleBeatSliderChange}
                            min={beat.min}
                            max={beat.max}
                            step={0.1}
                            ariaLabelledBy="beat-frequency-label"
                            aria-describedby="beat-frequency-help"
                        />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2 text-meta">
            <span className="flex items-center gap-1 text-left">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-300/80"/>
              Zone douce 1–8 Hz
            </span>
                        <span className="flex items-center gap-1 text-center">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/70"/>
              Zone transition 8–14 Hz
            </span>
                        <span className="flex items-center gap-1 text-right">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80"/>
              Zone éveil 14–40 Hz
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
