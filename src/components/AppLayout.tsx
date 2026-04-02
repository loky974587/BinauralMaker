import {Card} from "primereact/card";
import type {ReactNode} from "react";
import {AppFooter} from "./AppFooter";
import {AppHeader} from "./AppHeader";
import {WarningBanner} from "./WarningBanner";

export class AppLayoutModel {
    readonly showWarning: boolean;
    readonly children: ReactNode;
    readonly floatingBar?: ReactNode;

    constructor(params: {
        showWarning: boolean;
        children: ReactNode;
        floatingBar?: ReactNode;
    }) {
        this.showWarning = params.showWarning;
        this.children = params.children;
        this.floatingBar = params.floatingBar;
    }
}

type AppLayoutProps = {
    appLayoutModel: AppLayoutModel;
    onDismissWarning: () => void;
    onShowWarning: () => void;
};

export function AppLayout({
                              appLayoutModel,
                              onDismissWarning,
                              onShowWarning,
                          }: AppLayoutProps) {
    const {showWarning, children, floatingBar} = appLayoutModel;
    return (
        <main className="mx-auto flex min-h-screen flex-col gap-6 px-4 pb-28 pt-8 text-slate-100 sm:px-8 sm:pb-24">
            <AppHeader onShowWarning={onShowWarning}/>

            {showWarning ? <WarningBanner onClose={onDismissWarning}/> : null}

            <Card className="overflow-visible shadow-2xl shadow-slate-950/50">
                <section className="grid gap-6 md:grid-cols-2">{children}</section>
            </Card>

            {floatingBar}

            <AppFooter/>
        </main>
    );
}
