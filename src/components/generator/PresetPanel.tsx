import {Button} from "primereact/button";
import type {PresetId} from "../../constants/presets";

type PresetPanelProps = {
    activePreset: PresetId | null;
    onApplyPreset: (presetId: PresetId) => void;
};

export function PresetPanel({
                                activePreset,
                                onApplyPreset,
                            }: PresetPanelProps) {
    return (
        <div className="panel-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-label">
                        Mode recommandé
                    </p>
                    <p className="text-muted">
                        Base 220 Hz · Battement 6 Hz · Volume 30% · 25 min
                    </p>
                </div>
                <Button
                    icon="pi pi-check"
                    label="Appliquer"
                    size="small"
                    severity={activePreset === "recommended" ? "info" : "secondary"}
                    onClick={() => onApplyPreset("recommended")}
                />
            </div>
            {activePreset ? (
                <p className="mt-2 text-xs text-emerald-300">
                    Durée alignée automatiquement au total de la séance.
                </p>
            ) : null}
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                    label="Relaxation douce"
                    severity={activePreset === "relax" ? "info" : "secondary"}
                    onClick={() => onApplyPreset("relax")}
                />
                <Button
                    label="Concentration calme"
                    severity={activePreset === "focus" ? "info" : "secondary"}
                    onClick={() => onApplyPreset("focus")}
                />
                <Button
                    label="Sommeil léger"
                    severity={activePreset === "sleep" ? "info" : "secondary"}
                    onClick={() => onApplyPreset("sleep")}
                />
            </div>
        </div>
    );
}
