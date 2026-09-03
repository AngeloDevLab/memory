import type { BoardSize, Player, ThemeId } from '../config';
import { settingsGroups } from '../config';
import { app, qs, qsa } from '../dom';
import { setSelectedSettings } from '../state';

/** Reads the checked radio inputs and stores them as the selected settings. */
export function captureSelectedSettings(): void {
    const themeRadio = qs<HTMLInputElement>('input[name="theme"]:checked', app ?? document);
    const playerRadio = qs<HTMLInputElement>('input[name="player"]:checked', app ?? document);
    const boardRadio = qs<HTMLInputElement>('input[name="board-size"]:checked', app ?? document);
    if (!themeRadio?.dataset.themeFolder || !playerRadio || !boardRadio) return;

    setSelectedSettings({
        theme: themeRadio.dataset.themeFolder as ThemeId,
        boardSize: Number(boardRadio.value) as BoardSize,
        startingPlayer: playerRadio.value as Player,
    });
}

/** Refreshes the Start button, step labels and dividers after a selection changes. */
export function updateSettingsProgress(): void {
    updateStartButton();
    updateSteps();
    updateDividers();
}

/** Enables the Start button only once every settings group has a checked option. */
function updateStartButton(): void {
    const startButton = qs<HTMLButtonElement>('.settings__start', app ?? document);
    if (!startButton) return;

    const allSelected = settingsGroups.every((name) => qs(`input[name="${name}"]:checked`, app ?? document));
    startButton.disabled = !allSelected;
    startButton.classList.toggle('settings__start--disabled', !allSelected);
}

/** Replaces each progress step's label with the currently chosen option's text. */
function updateSteps(): void {
    qsa<HTMLLIElement>('.settings__step', app ?? document).forEach((step) => {
        const checked = qs<HTMLInputElement>(`input[name="${step.dataset.step}"]:checked`, app ?? document);
        const label = checked?.closest('.settings__option')?.querySelector('span')?.textContent;
        if (label) step.textContent = label;
    });
}

/** Swaps each divider's icon once its associated group has a checked option. */
function updateDividers(): void {
    qsa<HTMLLIElement>('.settings__divider', app ?? document).forEach((divider) => {
        const img = divider.querySelector<HTMLImageElement>('img');
        const checked = qs(`input[name="${divider.dataset.divider}"]:checked`, app ?? document);
        if (img) img.src = checked ? '/assets/divider-with.svg' : '/assets/divider.svg';
    });
}

/** Swaps the theme preview image to the hovered option's preview image. */
export function previewTheme(target: Element): void {
    const radio = target.closest('.settings__option')?.querySelector<HTMLInputElement>('input[name="theme"]');
    const preview = qs<HTMLImageElement>('.settings__preview-image', app ?? document);
    if (radio?.dataset.previewImage && preview) preview.src = radio.dataset.previewImage;
}

/** Restores the theme preview image to the currently checked theme. */
export function resetThemePreview(): void {
    const checked = qs<HTMLInputElement>('input[name="theme"]:checked', app ?? document);
    const preview = qs<HTMLImageElement>('.settings__preview-image', app ?? document);
    if (checked?.dataset.previewImage && preview) preview.src = checked.dataset.previewImage;
}
