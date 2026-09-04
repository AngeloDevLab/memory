import { themeCopy } from './config';
import { app, queryOne } from './dom';
import { currentGame, selectedSettings } from './state';

/** Applies the active theme's exit-dialog/restart copy, falling back to the "it" defaults. */
export function applyThemeCopy(): void {
    const theme = currentGame?.theme ?? selectedSettings.theme;
    const copy = themeCopy[theme];

    const dialogCancel = queryOne('[data-dialog-action="cancel"]', app ?? document);
    const dialogConfirm = queryOne('[data-dialog-action="confirm"]', app ?? document);
    const restart = queryOne('.result__restart', app ?? document);

    if (dialogCancel) dialogCancel.textContent = copy?.dialogCancel ?? 'Back to game';
    if (dialogConfirm) dialogConfirm.textContent = copy?.dialogConfirm ?? 'Exit game';
    if (restart) restart.textContent = copy?.restart ?? 'Back to start';
}
