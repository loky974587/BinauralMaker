import {Dropdown} from "primereact/dropdown";
import {InputSwitch} from "primereact/inputswitch";
import {Slider, SliderChangeEvent} from "primereact/slider";
import type {NoiseSettings} from "../../types/audio";
import {NOISE_LEVEL_RANGE} from "../../constants/ranges";
import {clamp} from "../../utils/math";

type NoiseControlsProps = {
    noise: NoiseSettings;
    onNoiseChange: (value: NoiseSettings) => void;
};

export function NoiseControls({
                                  noise,
                                  onNoiseChange,
                              }: NoiseControlsProps) {
    const handleNoiseToggle = (enabled: boolean) => {
        onNoiseChange({...noise, enabled});
    };

    const handleNoiseLevelChange = (event: SliderChangeEvent) => {
        const sliderValue = Array.isArray(event.value)
            ? event.value[0]
            : event.value;
        onNoiseChange({
            ...noise,
            level: clamp(
                sliderValue ?? 0,
                NOISE_LEVEL_RANGE.min,
                NOISE_LEVEL_RANGE.max,
            ),
        });
    };

    return (
        <div className="panel-card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-label">Texture sonore</p>
                    <p className="text-muted">
                        Ajoutez un bruit doux pour masquer les artefacts.
                    </p>
                </div>
                <div className="row-gap-2">
                    <label
                        className="text-muted-strong"
                        htmlFor="noise-toggle"
                        id="noise-toggle-label"
                    >
                        Activer
                    </label>
                    <InputSwitch
                        inputId="noise-toggle"
                        checked={noise.enabled}
                        onChange={(event) => handleNoiseToggle(Boolean(event.value))}
                    />
                </div>
            </div>
            {noise.enabled ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="field-col text-muted-strong">
                        <label htmlFor="noise-type" id="noise-type-label">
                            Type de bruit
                        </label>
                        <Dropdown
                            id="noise-type"
                            className="w-full"
                            value={noise.type}
                            options={[
                                {label: "Rose (doux)", value: "pink"},
                                {label: "Blanc", value: "white"},
                            ]}
                            onChange={(event) =>
                                onNoiseChange({
                                    ...noise,
                                    type: event.value as NoiseSettings["type"],
                                })
                            }
                            ariaLabelledBy="noise-type-label"
                        />
                    </div>
                    <div className="field-col text-muted-strong">
                        <label htmlFor="noise-level" id="noise-level-label">
                            Niveau (%)
                        </label>
                        <p className="text-hint" id="noise-level-help">
                            Pourquoi: masque légèrement les artefacts sans couvrir le signal.
                        </p>
                        <Slider
                            id="noise-level"
                            value={noise.level}
                            onChange={handleNoiseLevelChange}
                            ariaLabelledBy="noise-level-label"
                            aria-describedby="noise-level-help"
                        />
                        <span className="text-muted">{noise.level}%</span>
                    </div>
                </div>
            ) : (
                <p className="mt-3 text-hint">
                    Activez le bruit de fond pour une ambiance plus douce.
                </p>
            )}
        </div>
    );
}
