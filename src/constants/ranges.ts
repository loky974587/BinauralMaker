export const FREQUENCY_RANGES = {
    base: {min: 20, max: 1200},
    beat: {min: 1, max: 40},
    audible: {min: 1, max: 20000},
};

export const VOLUME_RANGE = {min: 0, max: 100};

export const DURATION_RANGE = {min: 5, max: 3600};

export const SESSION_RANGE = {
    minTotal: 30,
    maxTotal: 45 * 60,
    phaseMinMinutes: 0.1,
    phaseMaxMinutes: 45,
};

export const NOISE_LEVEL_RANGE = {min: 0, max: 100};

export const FILENAME_DURATION_RANGE = {min: 1, max: 9999};
