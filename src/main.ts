import './styles/main.scss';
import { registerEventListeners } from './ts/events';
import { showScreen } from './ts/screens/router';

registerEventListeners();
showScreen('landing');
