import { app, qs } from '../dom';
import { currentGame } from '../state';
import { showResult } from './result-screen';
import { showScreen } from './router';

const RESULT_DELAY_MS = 5000;

/** Shows the final scores, then after a pause moves on to the result screen. */
export function showGameOver(): void {
    const blueValue = qs('[data-score="blue"]', app ?? document);
    const orangeValue = qs('[data-score="orange"]', app ?? document);
    if (blueValue) blueValue.textContent = String(currentGame?.scores.blue ?? 0);
    if (orangeValue) orangeValue.textContent = String(currentGame?.scores.orange ?? 0);

    window.setTimeout(() => {
        showScreen('result');
        showResult();
    }, RESULT_DELAY_MS);
}
