import {useEffect, useRef} from "react";
import {drawWaveformCanvas, getNthTroughX} from "./canvas";

const durationSeconds = 0.03;

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
        const leftMarkerX = getNthTroughX(
            leftFrequency,
            previewTime,
            4,
            durationSeconds,
            canvasWidth,
        );
        const rightMarkerX = getNthTroughX(
            rightFrequency,
            previewTime,
            4,
            durationSeconds,
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
