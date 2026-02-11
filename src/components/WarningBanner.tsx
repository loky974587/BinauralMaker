type WarningBannerProps = {
    onClose: () => void;
};

export function WarningBanner({onClose}: WarningBannerProps) {
    return (
        <section
            className="rounded-2xl border border-amber-400/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100 shadow-lg shadow-amber-950/20 sm:px-6">
            <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-amber-200">
                    Avertissement d&apos;usage
                </p>
                <button
                    type="button"
                    className="rounded-full border border-amber-200/30 px-2 py-0.5 text-xs font-semibold text-amber-100 transition hover:border-amber-200/60 hover:text-amber-50"
                    onClick={onClose}
                    aria-label="Fermer l'avertissement"
                >
                    J&apos;ai compris
                </button>
            </div>
            <ul className="mt-2 grid gap-1">
                <li>Ne pas utiliser en conduisant / en situation à risque.</li>
                <li>Volume faible recommandé.</li>
                <li>Casque stéréo requis.</li>
                <li>
                    Les effets perçus varient selon les individus; aucune promesse
                    médicale ou thérapeutique.
                </li>
                <li>
                    Par précaution, les personnes concernées par l&apos;épilepsie, des
                    migraines sévères ou des troubles neurologiques doivent rester
                    prudentes.
                </li>
            </ul>
        </section>
    );
}
