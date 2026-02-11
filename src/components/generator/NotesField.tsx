import {InputTextarea} from "primereact/inputtextarea";
import {maxNotesLength} from "../../utils/notes";
import {InfoHint} from "./InfoHint";

type NotesFieldProps = {
    notes: string;
    onNotesChange: (value: string) => void;
};

export function NotesField({
                               notes,
                               onNotesChange,
                           }: NotesFieldProps) {
    return (
        <div className="field-col">
            <div className="flex items-center gap-2">
                <label
                    className="text-label-strong"
                    htmlFor="notes-input"
                    id="notes-label"
                >
                    Notes (optionnel)
                </label>
                <InfoHint
                    label="Informations sur les notes"
                    content={(
                        <p>
                            Sert de mémo: contexte, intention, réglages. Les notes sont stockées
                            dans les métadonnées de l’export.
                        </p>
                    )}
                />
            </div>
            <span className="sr-only" id="notes-help">
                Ajoutées dans les métadonnées du fichier exporté.
            </span>
            <InputTextarea
                id="notes-input"
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
                rows={3}
                autoResize
                maxLength={maxNotesLength}
                placeholder="Ajoutez un contexte ou une intention pour retrouver ce fichier plus tard."
                aria-describedby="notes-help"
            />
            <div className="flex items-center justify-end text-hint">
                <span>
                    {notes.length}/{maxNotesLength}
                </span>
            </div>
        </div>
    );
}
