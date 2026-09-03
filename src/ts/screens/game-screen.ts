import type { CardState } from '../config';
import { themesWithCardBack } from '../config';
import { app, qs, qsa } from '../dom';
import { Game } from '../game';
import { currentGame, selectedSettings, setCurrentGame } from '../state';
import { applyThemeCopy } from '../theme-copy';
import { showGameOver } from './gameover-screen';
import { showScreen } from './router';

const MISMATCH_DELAY_MS = 900;
const GAME_COMPLETE_DELAY_MS = 800;

/** Starts a new round for the currently selected settings and renders the board. */
export function startGame(): void {
    const { theme, boardSize, startingPlayer } = selectedSettings;
    document.body.dataset.theme = theme;
    setCurrentGame(new Game(theme, boardSize, startingPlayer));
    applyThemeCopy();

    renderBoard();
    renderScores();
    renderCurrentPlayer();
}

/** Handles a card click: flips it and, once a pair resolves, updates the board. */
export function handleCardClick(index: number): void {
    const result = currentGame?.flip(index);
    if (!result || result === 'locked' || result === 'already-open') return;

    if (result === 'flipped') {
        updateCardElement(index);
        return;
    }

    updateResolvedPair();
    if (result === 'matched') onMatch();
    else window.setTimeout(onMismatchTimeout, MISMATCH_DELAY_MS);
}

/** Rebuilds the board's card elements for the active game, sized via its board--N class. */
function renderBoard(): void {
    const board = qs<HTMLElement>('.game__board', app ?? document);
    const gameEl = qs<HTMLElement>('.game', app ?? document);
    if (!currentGame || !board || !gameEl) return;

    gameEl.classList.add(`game--${currentGame.boardSize}`);
    board.replaceChildren(...currentGame.cards.map(createCardElement));
}

/** Clones the card template for one card and wires up its dynamic parts. */
function createCardElement(card: CardState, index: number): Node {
    const template = document.getElementById('card-template');
    if (!(template instanceof HTMLTemplateElement)) return document.createDocumentFragment();

    const item = template.content.cloneNode(true) as DocumentFragment;
    const button = item.querySelector<HTMLButtonElement>('.game__card');
    if (button) applyCardContent(button, card, index);
    return item;
}

/** Sets the index, front image and (theme-dependent) back image on a cloned card button. */
function applyCardContent(button: HTMLButtonElement, card: CardState, index: number): void {
    button.dataset.index = String(index);
    const [backIcon, frontIcon] = qsa<HTMLImageElement>('.game__card-icon', button);
    frontIcon.src = card.image;

    if (currentGame && themesWithCardBack.has(currentGame.theme)) {
        backIcon.src = `/assets/themes/${currentGame.theme}/card-back.png`;
    } else {
        backIcon.remove();
    }
}

/** Reflects one card's revealed/matched flags onto its button element. */
function updateCardElement(index: number): void {
    const card = currentGame?.cards[index];
    const button = qs<HTMLButtonElement>(`.game__card[data-index="${index}"]`, app ?? document);
    if (!card || !button) return;

    button.classList.toggle('game__card--revealed', card.revealed || card.matched);
    button.classList.toggle('game__card--matched', card.matched);
}

/** Re-renders both cards involved in the just-resolved match/mismatch. */
function updateResolvedPair(): void {
    currentGame?.pendingPair?.forEach(updateCardElement);
}

/** Renders both players' current score values. */
function renderScores(): void {
    const blueValue = qs('.game__score--blue .game__score-value', app ?? document);
    const orangeValue = qs('.game__score--orange .game__score-value', app ?? document);
    if (blueValue) blueValue.textContent = String(currentGame?.scores.blue ?? 0);
    if (orangeValue) orangeValue.textContent = String(currentGame?.scores.orange ?? 0);
}

/** Highlights the current player's icon color. */
function renderCurrentPlayer(): void {
    qsa('.game__current-player-icon', app ?? document).forEach((icon) => {
        icon.classList.remove('game__current-player-icon--blue', 'game__current-player-icon--orange');
        icon.classList.add(`game__current-player-icon--${currentGame?.currentPlayer}`);
    });
}

/** After a match: updates scores and, once the board is complete, moves on. */
function onMatch(): void {
    renderScores();
    if (currentGame?.isComplete) {
        window.setTimeout(() => {
            showScreen('gameover');
            showGameOver();
        }, GAME_COMPLETE_DELAY_MS);
    }
}

/** After the mismatch-reveal delay: flips the pair back and passes the turn. */
function onMismatchTimeout(): void {
    currentGame?.resolveMismatch();
    updateResolvedPair();
    renderCurrentPlayer();
}
