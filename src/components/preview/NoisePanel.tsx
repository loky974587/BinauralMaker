import {useEffect, useMemo, useRef} from "react";
import type {NoiseSettings} from "../../types/audio";
import {drawNoiseCanvas} from "./canvas";

const noiseSeriesPoints = 520;

export class NoisePanelModel {
    readonly noise: NoiseSettings;
    readonly previewTime: number;

    constructor(params: { noise: NoiseSettings; previewTime: number }) {
        this.noise = params.noise;
        this.previewTime = params.previewTime;
    }
}

type NoisePanelProps = {
    noisePanelModel: NoisePanelModel;
};

export function NoisePanel({noisePanelModel}: NoisePanelProps) {
    const {noise, previewTime} = noisePanelModel;
    const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const noiseSeries = useMemo(() => {
        const series = new Float32Array(noiseSeriesPoints);
        if (!noise.enabled || noise.level <= 0) {
            return series;
        }

        let seed =
            Math.floor(previewTime * 1000) + (noise.type === "pink" ? 1337 : 4242);
        const nextRandom = () => {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };

        if (noise.type === "white") {
            for (let i = 0; i < noiseSeriesPoints; i += 1) {
                series[i] = (nextRandom() * 2 - 1) * (noise.level / 100);
            }
            return series;
        }

        let b0 = 0;
        let b1 = 0;
        let b2 = 0;
        let b3 = 0;
        let b4 = 0;
        let b5 = 0;
        let b6 = 0;
        for (let i = 0; i < noiseSeriesPoints; i += 1) {
            const white = nextRandom() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.969 * b2 + white * 0.153852;
            b3 = 0.8665 * b3 + white * 0.3104856;
            b4 = 0.55 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.016898;
            const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;
            series[i] = pink * 0.11 * (noise.level / 100);
        }
        return series;
    }, [noise.enabled, noise.level, noise.type, previewTime]);

    useEffect(() => {
        drawNoiseCanvas(noiseCanvasRef.current, noiseSeries);
    }, [noiseSeries]);

    return (
        <div>
            <div className="row-compact">
                <span>Texture</span>
                <span>
          {noise.enabled
              ? noise.type === "pink"
                  ? "Bruit rose"
                  : "Bruit blanc"
              : "Désactivé"}
        </span>
            </div>
            <canvas
                ref={noiseCanvasRef}
                width={520}
                height={120}
                className="panel-border"
            />
        </div>
    );
}
