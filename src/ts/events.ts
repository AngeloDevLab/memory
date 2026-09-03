import { app, qs } from './dom';
import { handleCardClick, startGame } from './screens/game-screen';
import { showScreen } from './screens/router';
import {
    captureSelectedSettings,
    previewTheme,
    resetThemePreview,
    updateSettingsProgress,
} from './screens/settings-screen';

type ClickHandler = (matched: Element) => void;
type ClickRule = readonly [selector: string, handler: ClickHandler];

/** Selector -> handler table for every click the app reacts to. */
const clickRules: readonly ClickRule[] = [
    ['.button--hero', goToSettings],
    ['.game__card', onCardClick],
    ['.settings__start:not(:disabled)', onStartClick],
    ['.game__exit', onExitClick],
    ['[data-dialog-action]', onDialogAction],
    ['.result__restart', goToSettings],
];

/** Wires up every DOM-wide event listener the app needs. Call once at startup. */
export function registerEventListeners(): void {
    app?.addEventListener('click', handleAppClick);
    app?.addEventListener('change', handleAppChange);
    app?.addEventListener('pointerover', handlePointerOver);
    app?.addEventListener('pointerout', handlePointerOut);
}

/** Runs the dispatch table, plus the dialog-backdrop special case, for one click. */
function handleAppClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;

    handleDialogBackdropClick(target, event);
    for (const [selector, handler] of clickRules) {
        const matched = target.closest(selector);
        if (matched) handler(matched);
    }
}

/** Closes the open confirm-dialog when a click lands on its backdrop, not its content. */
function handleDialogBackdropClick(target: Element, event: MouseEvent): void {
    if (!(target instanceof HTMLDialogElement) || !target.open) return;

    const rect = target.getBoundingClientRect();
    const insideContent = event.clientX >= rect.left && event.clientX <= rect.right
        && event.clientY >= rect.top && event.clientY <= rect.bottom;

    if (!insideContent) target.close();
}

function goToSettings(): void {
    showScreen('settings');
}

function onCardClick(matched: Element): void {
    if (matched instanceof HTMLButtonElement && matched.dataset.index) {
        handleCardClick(Number(matched.dataset.index));
    }
}

function onStartClick(): void {
    captureSelectedSettings();
    showScreen('game');
    startGame();
}

function onExitClick(): void {
    qs<HTMLDialogElement>('.confirm-dialog', app ?? document)?.showModal();
}

function onDialogAction(matched: Element): void {
    if (!(matched instanceof HTMLButtonElement)) return;

    matched.closest('dialog')?.close();
    if (matched.dataset.dialogAction === 'confirm') showScreen('settings');
}

/** Keeps the settings progress UI (Start button, steps, dividers) in sync with radios. */
function handleAppChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === 'radio') updateSettingsProgress();
}

function handlePointerOver(event: PointerEvent): void {
    if (event.target instanceof Element) previewTheme(event.target);
}

function handlePointerOut(event: PointerEvent): void {
    const target = event.target;
    if (target instanceof Element && target.closest('.settings__group--themes')) resetThemePreview();
}
