import './styles/main.scss';
import type { Screen, ThemeId } from './ts/config';
import { registerEventListeners } from './ts/events';
import { Game } from './ts/game';
import { startGame } from './ts/screens/game-screen';
import { showGameOver } from './ts/screens/gameover-screen';
import { showResult } from './ts/screens/result-screen';
import { showScreen } from './ts/screens/router';
import { selectedSettings, setCurrentGame } from './ts/state';

registerEventListeners();

// The ?screen=/?theme=/?blue=/?orange= dev shortcuts only exist in `npm run
// dev` builds — Vite strips this whole branch out of `npm run build` output,
// so production always starts on the landing screen like a real visit would.
if (import.meta.env.DEV) {
    initFromUrl();
} else {
    showScreen('landing');
}

/**
 * Reads dev-only query params to jump straight to a screen/theme/outcome
 * instead of playing through the app — dev builds only (see the DEV check
 * above this function is only called from).
 *
 * - `?screen=settings|game|gameover|result` — which screen to show.
 * - `?theme=it|gaming|da|food` — optional, combine with `&`.
 * - `?blue=X&orange=Y` — optional, only for gameover/result. Without these,
 *   gameover/result always show a 0:0 draw.
 *
 * Examples:
 * `?screen=result&theme=gaming`
 * `?screen=gameover&theme=it`
 * `?screen=result&blue=5&orange=2`
 * `?screen=result&theme=food&blue=1&orange=4`
 */
function initFromUrl(): void {
    const params = new URLSearchParams(location.search);
    const theme = params.get('theme');
    if (theme) document.body.dataset.theme = theme;

    const screen = (params.get('screen') as Screen | null) ?? 'landing';
    showScreen(screen);
    runDevScreenSetup(screen, params);
}

/** A screen opened directly via URL still needs its normal setup call. */
function runDevScreenSetup(screen: Screen, params: URLSearchParams): void {
    if (screen === 'game') startGame();
    if (screen === 'gameover' || screen === 'result') applyDevGameOverride(params);
    if (screen === 'gameover') showGameOver();
    if (screen === 'result') showResult();
}

/**
 * Builds a stand-in game for gameover/result opened directly via URL, so both
 * the theme copy (?theme=) and the scores (?blue=/?orange=, default 0:0) are
 * consistent — without this, applyThemeCopy() has no game to read the theme
 * from and silently falls back to the default theme.
 */
function applyDevGameOverride(params: URLSearchParams): void {
    const theme = (document.body.dataset.theme as ThemeId | undefined) ?? selectedSettings.theme;
    const game = new Game(theme, 16, 'blue');
    game.scores.blue = Number(params.get('blue') ?? 0);
    game.scores.orange = Number(params.get('orange') ?? 0);
    setCurrentGame(game);
}
