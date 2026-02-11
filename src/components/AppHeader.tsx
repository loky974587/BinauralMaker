type AppHeaderProps = {
    onShowWarning: () => void;
};

export function AppHeader({onShowWarning}: AppHeaderProps) {
    return (
        <header className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight">Binaural Maker</h1>
            <p className="mt-3 text-slate-300">
                Créez un battement binaural personnalisé en quelques secondes.
            </p>
            <button
                type="button"
                className="mt-2 text-xs font-semibold text-amber-200 underline-offset-4 transition hover:text-amber-100 hover:underline"
                onClick={onShowWarning}
            >
                Revoir l&apos;avertissement
            </button>
        </header>
    );
}
