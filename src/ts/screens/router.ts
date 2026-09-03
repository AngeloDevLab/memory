import type { Screen } from '../config';
import { app } from '../dom';
import { updateSettingsProgress } from './settings-screen';

/** Clones the template for `screen` into <main>, replacing whatever is shown now. */
export function showScreen(screen: Screen): void {
    const template = document.getElementById(`screen-${screen}`);
    if (!app || !(template instanceof HTMLTemplateElement)) return;

    app.classList.toggle('is-light', screen === 'settings');
    app.replaceChildren(template.content.cloneNode(true));
    updateSettingsProgress();
}
