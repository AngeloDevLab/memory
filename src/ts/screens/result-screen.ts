import type { Player } from '../config';
import { app, queryOne } from '../dom';
import { currentGame } from '../state';
import { applyThemeCopy } from '../theme-copy';

/** Shows the winner/draw outcome and applies the active theme's copy. */
export function showResult(): void {
    const scores = currentGame?.scores ?? { blue: 0, orange: 0 };
    renderOutcome(scores);
    applyThemeCopy();
}

/** Picks the winner/draw branch and toggles the matching result graphics. */
function renderOutcome(scores: Record<Player, number>): void {
    const isDraw = scores.blue === scores.orange;
    if (isDraw) renderDraw();
    else renderWinner(scores.blue > scores.orange ? 'blue' : 'orange');
    toggleResultGraphics(isDraw);
    queryOne('.result', app ?? document)?.classList.toggle('result--draw', isDraw);
}

/** Renders the "It's a Draw" heading. */
function renderDraw(): void {
    setHeadingText("It's a", 'Draw');
    const title = queryOne<HTMLElement>('.result__title', app ?? document);
    if (title) title.className = 'result__title result__title--draw';
}

/** Renders the "The winner is <Player>" heading and player-icon color. */
function renderWinner(winner: Player): void {
    setHeadingText('The winner is', winner === 'blue' ? 'Blue Player' : 'Orange Player');
    const title = queryOne<HTMLElement>('.result__title', app ?? document);
    if (title) title.className = `result__title result__title--${winner}`;

    const playerIcon = queryOne<HTMLElement>('.result__player-icon', app ?? document);
    playerIcon?.classList.remove('result__player-icon--blue', 'result__player-icon--orange');
    playerIcon?.classList.add(`result__player-icon--${winner}`);
}

/** Sets the label/title text shared by both the winner and draw states. */
function setHeadingText(label: string, title: string): void {
    const labelEl = queryOne('.result__label', app ?? document);
    const titleEl = queryOne('.result__title', app ?? document);
    if (labelEl) labelEl.textContent = label;
    if (titleEl) titleEl.textContent = title;
}

/** Shows/hides the confetti, player icon, trophy and draw icon for the outcome. */
function toggleResultGraphics(isDraw: boolean): void {
    queryOne('.result__confetti', app ?? document)?.toggleAttribute('hidden', isDraw);
    queryOne('.result__player-icon', app ?? document)?.toggleAttribute('hidden', isDraw);
    queryOne('.result__trophy', app ?? document)?.toggleAttribute('hidden', isDraw);
    queryOne('.result__draw-icon', app ?? document)?.toggleAttribute('hidden', !isDraw);
    queryOne('.result__draw-icon-img', app ?? document)?.toggleAttribute('hidden', !isDraw);
}
