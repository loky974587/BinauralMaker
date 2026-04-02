import type {SessionsSettings} from "../types/audio";

export const resolveSessionDurations = (
    session: SessionsSettings,
    durationLimit?: number,
) => {
    const intro = Math.max(0, session.introDuration);
    const plateau = Math.max(0, session.plateauDuration);
    const outro = Math.max(0, session.outroDuration);
    const total = intro + plateau + outro;

    if (durationLimit === undefined || total === 0) {
        return {intro, plateau, outro, total};
    }

    if (total <= durationLimit) {
        return {intro, plateau, outro, total};
    }

    const edgeTotal = intro + outro;
    if (edgeTotal === 0) {
        return {intro: 0, plateau: durationLimit, outro: 0, total: durationLimit};
    }

    const scale = durationLimit / edgeTotal;
    const scaledIntro = intro * scale;
    const scaledOutro = outro * scale;
    return {
        intro: scaledIntro,
        plateau: 0,
        outro: scaledOutro,
        total: durationLimit,
    };
};

export const getSessionEnvelopeValue = (
    session: SessionsSettings,
    time: number,
    durationLimit?: number,
) => {
    if (!session.enabled) {
        return 1;
    }

    const {intro, plateau, outro, total} = resolveSessionDurations(
        session,
        durationLimit,
    );
    if (total === 0) {
        return 1;
    }

    if (time <= 0) {
        return intro > 0 ? 0 : 1;
    }

    if (time < intro) {
        return intro === 0 ? 1 : time / intro;
    }

    if (time < intro + plateau) {
        return 1;
    }

    if (outro > 0 && time < total) {
        return 1 - (time - intro - plateau) / outro;
    }

    return 0;
};
