import {useEffect, useId, useRef, useState} from "react";
import type {ReactNode} from "react";

type InfoHintProps = {
    content: ReactNode;
    label?: string;
};

export function InfoHint({content, label = "Informations"}: InfoHintProps) {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = useId();
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <span className="relative inline-flex" ref={containerRef}>
            <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-600/80 text-[11px] font-semibold text-slate-300 transition hover:border-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
                aria-expanded={isOpen}
                aria-controls={contentId}
                aria-label={label}
                onClick={() => setIsOpen((current) => !current)}
            >
                i
            </button>
            {isOpen ? (
                <div
                    id={contentId}
                    role="dialog"
                    className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-slate-700/80 bg-slate-950/95 p-2 text-[11px] text-slate-300 shadow-lg"
                >
                    {content}
                </div>
            ) : null}
        </span>
    );
}
