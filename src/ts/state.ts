import type { SelectedSettings } from './config';
import type { Game } from './game';

/** The settings chosen on the settings screen, used to start the next game. */
export let selectedSettings: SelectedSettings = {
    theme: 'it',
    boardSize: 16,
    startingPlayer: 'blue',
};

/** The in-progress game, set once the game screen starts; read by gameover/result. */
export let currentGame: Game | null = null;

/** Replaces the currently selected settings (called from the settings screen). */
export function setSelectedSettings(settings: SelectedSettings): void {
    selectedSettings = settings;
}

/** Replaces the active game instance (called when a new game starts). */
export function setCurrentGame(game: Game): void {
    currentGame = game;
}
