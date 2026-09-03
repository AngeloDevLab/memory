import { themeCopy } from './config';
import { app, qs } from './dom';
import { currentGame, selectedSettings } from './state';

/**
 * Applies the active theme's exit-dialog/restart copy, falling back to the
 * "it" defaults. Called both when a game starts (dialog buttons) and when
 * the result screen shows (restart button) — each screen only has one half
 * of the targeted elements in its DOM.
 */
export function applyThemeCopy(): void {
    const theme = currentGame?.theme ?? selectedSettings.theme;
    const copy = themeCopy[theme];

    const dialogCancel = qs('[data-dialog-action="cancel"]', app ?? document);
    const dialogConfirm = qs('[data-dialog-action="confirm"]', app ?? document);
    const restart = qs('.result__restart', app ?? document);

    if (dialogCancel) dialogCancel.textContent = copy?.dialogCancel ?? 'Back to game';
    if (dialogConfirm) dialogConfirm.textContent = copy?.dialogConfirm ?? 'Exit game';
    if (restart) restart.textContent = copy?.restart ?? 'Back to start';
}
