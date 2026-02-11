import type {NoiseSettings} from "../../types/audio";
import {NoiseControls} from "./NoiseControls";

export class TexturePanelModel {
    readonly noise: NoiseSettings;
    readonly summary: string;
    readonly isOpen: boolean;
    readonly notes: string;

    constructor(params: {
        noise: NoiseSettings;
        summary: string;
        isOpen: boolean;
        notes: string;
    }) {
        this.noise = params.noise;
        this.summary = params.summary;
        this.isOpen = params.isOpen;
        this.notes = params.notes;
    }
}

type TexturePanelProps = {
    texturePanelModel: TexturePanelModel;
    onToggle: (isOpen: boolean) => void;
    onNoiseChange: (value: NoiseSettings) => void;
    onNotesChange: (value: string) => void;
};

export function TexturePanel({
                                 texturePanelModel,
                                 onToggle,
                                 onNoiseChange
                             }: TexturePanelProps) {
    const {noise, summary, isOpen} = texturePanelModel;
    return (
        <section className="section-card">
            <details
                open={isOpen}
                onToggle={(event) =>
                    onToggle((event.target as HTMLDetailsElement).open)
                }
            >
                <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="text-heading">Texture</h3>
                            <p className="text-muted">{summary}</p>
                        </div>
                        <div className="row-gap-2">
              <span className="pill-muted">
                {noise.enabled ? "Texture active" : "Texture off"}
              </span>
                            <span className="meta-inline">
                {isOpen ? "Replier" : "Déplier"}
                                <i
                                    className={`pi pi-chevron-down text-[10px] transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                    }`}
                                    aria-hidden="true"
                                />
              </span>
                        </div>
                    </div>
                </summary>
                <div className="mt-4 flex flex-col gap-5">
                    <NoiseControls
                        noise={noise}
                        onNoiseChange={onNoiseChange}
                    />
                </div>
            </details>
        </section>
    );
}
