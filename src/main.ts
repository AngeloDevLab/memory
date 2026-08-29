import './styles/main.scss';

type Screen = 'landing' | 'settings' | 'game' | 'gameover' | 'result';
type BoardSize = 16 | 24 | 36;
type Player = 'blue' | 'orange';

interface CardState {
    pairId: number;
    image: string;
    revealed: boolean;
    matched: boolean;
}

interface GameState {
    theme: string;
    boardSize: BoardSize;
    cards: CardState[];
    currentPlayer: Player;
    scores: Record<Player, number>;
    flippedIndices: number[];
    locked: boolean;
}

interface SelectedSettings {
    theme: string;
    boardSize: BoardSize;
    startingPlayer: Player;
}

const app = document.querySelector('main');

const settingsGroups = ['theme', 'player', 'board-size'];

let gameState: GameState | null = null;

let selectedSettings: SelectedSettings = {
    theme: 'it',
    boardSize: 16,
    startingPlayer: 'blue',
};

function showScreen(screen: Screen): void {
    if (!app) return;

    const template = document.getElementById(`screen-${screen}`);
    if (!(template instanceof HTMLTemplateElement)) return;

    app.classList.toggle('is-light', screen === 'settings');
    app.replaceChildren(template.content.cloneNode(true));
    updateSettingsProgress();

    if (screen === 'game') {
        startGame(selectedSettings.theme, selectedSettings.boardSize);
    }

    if (screen === 'gameover') {
        showGameOver();
    }

    if (screen === 'result') {
        revealResult(gameState?.scores ?? { blue: 0, orange: 0 });
    }
}

function captureSelectedSettings(): void {
    const themeRadio = app?.querySelector<HTMLInputElement>('input[name="theme"]:checked');
    const playerRadio = app?.querySelector<HTMLInputElement>('input[name="player"]:checked');
    const boardSizeRadio = app?.querySelector<HTMLInputElement>('input[name="board-size"]:checked');
    if (!themeRadio?.dataset.themeFolder || !playerRadio || !boardSizeRadio) return;

    selectedSettings = {
        theme: themeRadio.dataset.themeFolder,
        boardSize: Number(boardSizeRadio.value) as BoardSize,
        startingPlayer: playerRadio.value as Player,
    };
}

function createCardDeck(theme: string, boardSize: BoardSize): CardState[] {
    const pairCount = boardSize / 2;
    const images = Array.from({ length: pairCount }, (_, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `/assets/themes/${theme}/cards/card-${num}.png`;
    });

    const deck: CardState[] = images.flatMap((image, pairId) => [
        { pairId, image, revealed: false, matched: false },
        { pairId, image, revealed: false, matched: false },
    ]);

    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function startGame(theme: string, boardSize: BoardSize): void {
    gameState = {
        theme,
        boardSize,
        cards: createCardDeck(theme, boardSize),
        currentPlayer: selectedSettings.startingPlayer,
        scores: { blue: 0, orange: 0 },
        flippedIndices: [],
        locked: false,
    };

    renderBoard();
    renderScores();
    renderCurrentPlayer();
}

function renderBoard(): void {
    const state = gameState;
    const board = app?.querySelector<HTMLElement>('.game__board');
    if (!state || !board) return;

    if (state.boardSize === 16) {
        board.style.gridTemplateColumns = 'repeat(4, 1fr)';
        board.style.gap = '';
        board.style.width = '';
        board.style.maxWidth = '';
    } else {
        board.style.gridTemplateColumns = 'repeat(6, minmax(0, 120px))';
        board.style.gap = '6px';
        board.style.width = '100%';
        board.style.maxWidth = '750px';
    }

    board.replaceChildren(
        ...state.cards.map((card, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'game__card';
            button.dataset.index = String(index);

            const inner = document.createElement('div');
            inner.className = 'game__card-inner';

            const back = document.createElement('div');
            back.className = 'game__card-face game__card-face--back';
            const backIcon = document.createElement('img');
            backIcon.className = 'game__card-icon';
            backIcon.alt = '';
            backIcon.src = `/assets/themes/${state.theme}/card-back.png`;
            back.append(backIcon);

            const front = document.createElement('div');
            front.className = 'game__card-face game__card-face--front';
            const frontIcon = document.createElement('img');
            frontIcon.className = 'game__card-icon';
            frontIcon.alt = '';
            frontIcon.src = card.image;
            front.append(frontIcon);

            inner.append(back, front);

            const highlight = document.createElement('div');
            highlight.className = 'game__card-highlight';

            button.append(inner, highlight);
            return button;
        })
    );
}

function updateCardElement(index: number): void {
    const card = gameState?.cards[index];
    const button = app?.querySelector<HTMLButtonElement>(`.game__card[data-index="${index}"]`);
    if (!card || !button) return;

    button.classList.toggle('game__card--revealed', card.revealed || card.matched);
    button.classList.toggle('game__card--matched', card.matched);
}

function renderScores(): void {
    if (!gameState) return;

    const blueValue = app?.querySelector('.game__score--blue .game__score-value');
    const orangeValue = app?.querySelector('.game__score--orange .game__score-value');
    if (blueValue) blueValue.textContent = String(gameState.scores.blue);
    if (orangeValue) orangeValue.textContent = String(gameState.scores.orange);
}

function renderCurrentPlayer(): void {
    if (!gameState) return;

    const icon = app?.querySelector('.game__current-player-icon');
    if (!icon) return;

    icon.classList.remove('game__current-player-icon--blue', 'game__current-player-icon--orange');
    icon.classList.add(`game__current-player-icon--${gameState.currentPlayer}`);
}

function handleCardClick(index: number): void {
    if (!gameState || gameState.locked) return;

    const card = gameState.cards[index];
    if (!card || card.revealed || card.matched) return;

    card.revealed = true;
    gameState.flippedIndices.push(index);
    updateCardElement(index);

    if (gameState.flippedIndices.length < 2) return;

    gameState.locked = true;
    const [firstIndex, secondIndex] = gameState.flippedIndices;
    const first = gameState.cards[firstIndex];
    const second = gameState.cards[secondIndex];

    if (first.pairId === second.pairId) {
        first.matched = true;
        second.matched = true;
        gameState.scores[gameState.currentPlayer] += 1;
        gameState.flippedIndices = [];
        gameState.locked = false;
        updateCardElement(firstIndex);
        updateCardElement(secondIndex);
        renderScores();

        if (gameState.cards.every((c) => c.matched)) {
            window.setTimeout(() => showScreen('gameover'), 800);
        }

        return;
    }

    window.setTimeout(() => {
        if (!gameState) return;

        first.revealed = false;
        second.revealed = false;
        gameState.flippedIndices = [];
        gameState.currentPlayer = gameState.currentPlayer === 'blue' ? 'orange' : 'blue';
        gameState.locked = false;
        updateCardElement(firstIndex);
        updateCardElement(secondIndex);
        renderCurrentPlayer();
    }, 900);
}

function showGameOver(): void {
    const scores = gameState?.scores ?? { blue: 0, orange: 0 };

    const blueValue = app?.querySelector('[data-score="blue"]');
    const orangeValue = app?.querySelector('[data-score="orange"]');
    if (blueValue) blueValue.textContent = String(scores.blue);
    if (orangeValue) orangeValue.textContent = String(scores.orange);

    window.setTimeout(() => showScreen('result'), 5000);
}

function revealResult(scores: Record<Player, number>): void {
    const label = app?.querySelector('.result__label');
    const title = app?.querySelector<HTMLElement>('.result__title');
    const confetti = app?.querySelector<HTMLElement>('.result__confetti');
    const playerIcon = app?.querySelector<HTMLElement>('.result__player-icon');
    const drawIcon = app?.querySelector<HTMLElement>('.result__draw-icon');
    if (!label || !title || !confetti || !playerIcon || !drawIcon) return;

    const isDraw = scores.blue === scores.orange;

    if (isDraw) {
        label.textContent = "It's a";
        title.textContent = 'Draw';
        title.className = 'result__title result__title--draw';
    } else {
        const winner: Player = scores.blue > scores.orange ? 'blue' : 'orange';
        label.textContent = 'The winner is';
        title.textContent = `${winner === 'blue' ? 'Blue' : 'Orange'} player`;
        title.className = `result__title result__title--${winner}`;
        playerIcon.classList.remove('result__player-icon--blue', 'result__player-icon--orange');
        playerIcon.classList.add(`result__player-icon--${winner}`);
    }

    confetti.toggleAttribute('hidden', isDraw);
    playerIcon.toggleAttribute('hidden', isDraw);
    drawIcon.toggleAttribute('hidden', !isDraw);
}

function updateSettingsProgress(): void {
    updateStartButton();
    updateSteps();
}

function updateStartButton(): void {
    const startButton = app?.querySelector<HTMLButtonElement>('.settings__start');
    if (!startButton) return;

    const allSelected = settingsGroups.every((name) => app?.querySelector(`input[name="${name}"]:checked`));

    startButton.disabled = !allSelected;
    startButton.classList.toggle('settings__start--disabled', !allSelected);
}

function updateSteps(): void {
    const steps = app?.querySelectorAll<HTMLLIElement>('.settings__step');
    if (!steps) return;

    steps.forEach((step) => {
        const checked = app?.querySelector<HTMLInputElement>(`input[name="${step.dataset.step}"]:checked`);
        const label = checked?.closest('.settings__option')?.querySelector('span')?.textContent;
        if (label) {
            step.textContent = label;
        }
    });
}

app?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('.button')) {
        showScreen('settings');
    }

    const cardButton = target.closest<HTMLButtonElement>('.game__card');
    if (cardButton?.dataset.index) {
        handleCardClick(Number(cardButton.dataset.index));
    }

    const startButton = target.closest('.settings__start');
    if (startButton instanceof HTMLButtonElement && !startButton.disabled) {
        captureSelectedSettings();
        showScreen('game');
    }

    if (target.closest('.game__exit')) {
        showScreen('settings');
    }

    if (target.closest('.result__restart')) {
        showScreen('settings');
    }
});

app?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return;

    updateSettingsProgress();
});

app?.addEventListener('pointerover', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const radio = target.closest('.settings__option')?.querySelector<HTMLInputElement>('input[name="theme"]');
    const preview = app?.querySelector<HTMLImageElement>('.settings__preview-image');
    if (!radio?.dataset.previewImage || !preview) return;

    preview.src = radio.dataset.previewImage;
});

app?.addEventListener('pointerout', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.settings__group--themes')) return;

    const checked = app?.querySelector<HTMLInputElement>('input[name="theme"]:checked');
    const preview = app?.querySelector<HTMLImageElement>('.settings__preview-image');
    if (!checked?.dataset.previewImage || !preview) return;

    preview.src = checked.dataset.previewImage;
});

const params = new URLSearchParams(location.search);
const initialScreen = (params.get('screen') as Screen) ?? 'landing';

showScreen(initialScreen);
