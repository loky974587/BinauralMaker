import {Button} from "primereact/button";

type HelpPanelProps = {
    showHelp: boolean;
    onToggle: () => void;
};

export function HelpPanel({showHelp, onToggle}: HelpPanelProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                icon={showHelp ? "pi pi-times" : "pi pi-info-circle"}
                label="Comprendre les réglages"
                severity="secondary"
                onClick={onToggle}
            />
            {showHelp ? (
                <div className="panel-card w-full">
                    <p className="text-label">
                        Comprendre les réglages
                    </p>
                    <ul className="mt-3 grid gap-2 text-xs text-slate-300">
                        <li>
                            Base = hauteur perçue, battement = sensation binaurale.
                        </li>
                        <li>Montez le volume doucement, restez confortable.</li>
                        <li>Séance guidée = transitions plus douces.</li>
                    </ul>
                    <details className="group mt-3 text-muted">
                        <summary className="flex cursor-pointer items-center justify-between gap-2 text-slate-300">
                            <span>Détails optionnels</span>
                            <span className="meta-inline">
                Déplier / replier
                <i
                    className="pi pi-chevron-down text-[10px] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                />
              </span>
                        </summary>
                        <div className="mt-2 grid gap-1">
                            <p>Le battement est une illusion perceptive, pas un traitement.</p>
                            <p>Les effets varient selon les individus.</p>
                            <p>Arrêtez si inconfort ou fatigue.</p>
                        </div>
                    </details>
                </div>
            ) : null}
        </div>
    );
}
