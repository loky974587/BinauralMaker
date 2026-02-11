import {Slider, SliderChangeEvent} from "primereact/slider";
import {VOLUME_RANGE} from "../../constants/ranges";
import {clamp} from "../../utils/math";

type VolumeControlsProps = {
    volume: number;
    onVolumeChange: (value: number) => void;
};

export function VolumeControls({
                                   volume,
                                   onVolumeChange,
                               }: VolumeControlsProps) {
    const handleVolumeChange = (event: SliderChangeEvent) => {
        const sliderValue = Array.isArray(event.value)
            ? event.value[0]
            : event.value;
        onVolumeChange(clamp(sliderValue ?? 0, VOLUME_RANGE.min, VOLUME_RANGE.max));
    };

    return (
        <>
            <div className="stack-row-lg">
                <div className="field-col flex-1">
                    <label
                        className="text-label-strong"
                        htmlFor="volume-slider"
                        id="volume-label"
                    >
                        Volume global
                    </label>
                    <p className="text-hint" id="volume-help">
                        Pourquoi: stabilise la perception sans masquer le battement.
                    </p>
                    <label htmlFor="volume-slider" className="sr-only">
                        Ajuster le volume global (curseur)
                    </label>
                    <Slider
                        id="volume-slider"
                        value={volume}
                        onChange={handleVolumeChange}
                        ariaLabelledBy="volume-label"
                        aria-describedby="volume-help"
                    />
                    <span className="text-muted-strong">{volume}%</span>
                </div>
            </div>
        </>
    );
}
