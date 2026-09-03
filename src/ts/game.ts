import type { BoardSize, CardState, Player, ThemeId } from './config';

export type FlipResult = 'flipped' | 'matched' | 'mismatched' | 'locked' | 'already-open';

/** Builds the asset path for one pair's card image within a theme. */
function cardImagePath(theme: ThemeId, pairIndex: number): string {
    const num = String(pairIndex + 1).padStart(2, '0');
    return `/assets/themes/${theme}/cards/card-${num}.png`;
}

/** Builds a shuffled deck of face-down card pairs for the given theme/board size. */
function createDeck(theme: ThemeId, boardSize: BoardSize): CardState[] {
    const pairCount = boardSize / 2;
    const images = Array.from({ length: pairCount }, (_, i) => cardImagePath(theme, i));
    const deck = images.flatMap((image, pairId) => [
        { pairId, image, revealed: false, matched: false },
        { pairId, image, revealed: false, matched: false },
    ]);
    return shuffle(deck);
}

/** Shuffles an array in place (Fisher-Yates) and returns it. */
function shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}

/**
 * One round's rules: the card deck, scores, whose turn it is, and the
 * flip/match/mismatch state machine. Has no DOM or timing concerns — callers
 * own rendering and the mismatch-reveal delay.
 */
export class Game {
    readonly theme: ThemeId;
    readonly boardSize: BoardSize;
    readonly cards: CardState[];
    readonly scores: Record<Player, number> = { blue: 0, orange: 0 };
    currentPlayer: Player;

    private flippedIndices: number[] = [];
    private locked = false;
    private resolvedIndices: [number, number] | null = null;

    constructor(theme: ThemeId, boardSize: BoardSize, startingPlayer: Player) {
        this.theme = theme;
        this.boardSize = boardSize;
        this.cards = createDeck(theme, boardSize);
        this.currentPlayer = startingPlayer;
    }

    /** Whether every card has been matched. */
    get isComplete(): boolean {
        return this.cards.every((card) => card.matched);
    }

    /** The pair of indices a match/mismatch was just resolved for, if any. */
    get pendingPair(): [number, number] | null {
        return this.resolvedIndices;
    }

    /** Reveals the card at `index`; resolves the pair once two are face up. */
    flip(index: number): FlipResult {
        if (this.locked) return 'locked';

        const card = this.cards[index];
        if (!card || card.revealed || card.matched) return 'already-open';

        card.revealed = true;
        this.flippedIndices.push(index);
        return this.flippedIndices.length < 2 ? 'flipped' : this.resolvePair();
    }

    /** Flips the mismatched pair back face-down and passes the turn. */
    resolveMismatch(): void {
        const [firstIndex, secondIndex] = this.flippedIndices;
        this.cards[firstIndex].revealed = false;
        this.cards[secondIndex].revealed = false;
        this.flippedIndices = [];
        this.currentPlayer = this.currentPlayer === 'blue' ? 'orange' : 'blue';
        this.locked = false;
    }

    /** Decides match vs. mismatch for the two currently flipped cards. */
    private resolvePair(): FlipResult {
        const [firstIndex, secondIndex] = this.flippedIndices;
        this.resolvedIndices = [firstIndex, secondIndex];
        const isMatch = this.cards[firstIndex].pairId === this.cards[secondIndex].pairId;
        return isMatch ? this.applyMatch(firstIndex, secondIndex) : this.applyMismatch();
    }

    /** Marks both cards matched, scores the point, and clears the flipped pair. */
    private applyMatch(firstIndex: number, secondIndex: number): FlipResult {
        this.cards[firstIndex].matched = true;
        this.cards[secondIndex].matched = true;
        this.scores[this.currentPlayer] += 1;
        this.flippedIndices = [];
        return 'matched';
    }

    /** Locks input until the caller reveals the mismatch and calls resolveMismatch(). */
    private applyMismatch(): FlipResult {
        this.locked = true;
        return 'mismatched';
    }
}
