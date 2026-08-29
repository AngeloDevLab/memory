import './styles/main.scss';

type Screen = 'landing' | 'settings' | 'game' | 'gameover';
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

const app = document.querySelector('main');

const settingsGroups = ['theme', 'player', 'board-size'];

let gameState: GameState | null = null;

function showScreen(screen: Screen): void {
    if (!app) return;

    const template = document.getElementById(`screen-${screen}`);
    if (!(template instanceof HTMLTemplateElement)) return;

    app.replaceChildren(template.content.cloneNode(true));
    updateSettingsProgress();

    if (screen === 'game') {
        // TODO: read theme/board-size from the settings selection once that wiring exists
        startGame('it', 16);
    }
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
        currentPlayer: 'blue',
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

    const columns = state.boardSize === 16 ? 4 : 6;
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

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
