export type Screen = 'landing' | 'settings' | 'game' | 'gameover' | 'result';
export type BoardSize = 16 | 24 | 36;
export type Player = 'blue' | 'orange';
export type ThemeId = 'it' | 'gaming' | 'da' | 'food';

export interface CardState {
    pairId: number;
    image: string;
    revealed: boolean;
    matched: boolean;
}

export interface SelectedSettings {
    theme: ThemeId;
    boardSize: BoardSize;
    startingPlayer: Player;
}

export interface ThemeCopyEntry {
    dialogCancel: string;
    dialogConfirm: string;
    restart: string;
}

/** Radio group names that must all have a checked option before Start unlocks. */
export const settingsGroups = ['theme', 'player', 'board-size'] as const;

/** Themes without their own card-back.png show the CSS gradient only, no icon. */
export const themesWithCardBack = new Set<ThemeId>(['it', 'da', 'food']);

/**
 * Per-theme copy for the exit dialog and restart button. Themes missing here
 * (currently "it") fall back to the defaults in applyThemeCopy().
 */
export const themeCopy: Partial<Record<ThemeId, ThemeCopyEntry>> = {
    gaming: {
        dialogCancel: 'No, back to game',
        dialogConfirm: 'Yes, quit game',
        restart: 'Home',
    },
    da: {
        dialogCancel: 'Back to game',
        dialogConfirm: 'Exit game',
        restart: 'Home',
    },
    food: {
        dialogCancel: 'No, back to game',
        dialogConfirm: 'Exit game',
        restart: 'Home',
    },
};
