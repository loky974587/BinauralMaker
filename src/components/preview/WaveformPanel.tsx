import {useEffect, useRef} from "react";
import {drawWaveformCanvas, getNthPeakX} from "./canvas";

const durationSeconds = 0.03;
const markerPadding = 14;

const pickMarkerX = (
    frequency: number,
    previewTime: number,
    canvasWidth: number,
) => {
    for (let peakIndex = 4; peakIndex >= 1; peakIndex -= 1) {
        const x = getNthPeakX(
            frequency,
            previewTime,
            peakIndex,
            durationSeconds,
            canvasWidth,
        );
        if (x <= canvasWidth - markerPadding) {
            return x;
        }
    }
    return getNthPeakX(
        frequency,
        previewTime,
        1,
        durationSeconds,
        canvasWidth,
    );
};

export class WaveformPanelModel {
    readonly leftFrequency: number;
    readonly rightFrequency: number;
    readonly previewTime: number;

    constructor(params: {
        leftFrequency: number;
        rightFrequency: number;
        previewTime: number;
    }) {
        this.leftFrequency = params.leftFrequency;
        this.rightFrequency = params.rightFrequency;
        this.previewTime = params.previewTime;
    }
}

type WaveformPanelProps = {
    waveformPanelModel: WaveformPanelModel;
};

export function WaveformPanel({
                                  waveformPanelModel,
                              }: WaveformPanelProps) {
    const {leftFrequency, rightFrequency, previewTime} = waveformPanelModel;
    const waveformLeftCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const waveformRightCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvasWidth = waveformLeftCanvasRef.current?.width ?? 520;
        const leftMarkerX = pickMarkerX(
            leftFrequency,
            previewTime,
            canvasWidth,
        );
        const rightMarkerX = pickMarkerX(
            rightFrequency,
            previewTime,
            canvasWidth,
        );

        drawWaveformCanvas(waveformLeftCanvasRef.current, {
            baseFrequency: leftFrequency,
            previewTime,
            strokeStyle: "#22d3ee",
            markerX: leftMarkerX,
        });
        drawWaveformCanvas(waveformRightCanvasRef.current, {
            baseFrequency: rightFrequency,
            previewTime,
            strokeStyle: "#818cf8",
            markerX: rightMarkerX,
        });
    }, [leftFrequency, previewTime, rightFrequency]);

    return (
        <div className="mb-4 space-y-4">
            <div>
                <div className="row-compact">
                    <span>Canal gauche</span>
                    <span>Onde</span>
                </div>
                <canvas
                    ref={waveformLeftCanvasRef}
                    width={520}
                    height={160}
                    className="panel-border"
                />
            </div>
            <div>
                <div className="row-compact">
                    <span>Canal droit</span>
                    <span>Onde</span>
                </div>
                <canvas
                    ref={waveformRightCanvasRef}
                    width={520}
                    height={160}
                    className="panel-border"
                />
            </div>
        </div>
    );
}
