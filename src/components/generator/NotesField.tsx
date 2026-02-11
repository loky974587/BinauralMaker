import {InputTextarea} from "primereact/inputtextarea";
import {maxNotesLength} from "../../utils/notes";

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
            <label
                className="text-label-strong"
                htmlFor="notes-input"
                id="notes-label"
            >
                Notes (optionnel)
            </label>
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
            <div className="flex items-center justify-between text-hint" id="notes-help">
                <span>Ajoutées dans les métadonnées du fichier exporté.</span>
                <span>
          {notes.length}/{maxNotesLength}
        </span>
            </div>
        </div>
    );
}
