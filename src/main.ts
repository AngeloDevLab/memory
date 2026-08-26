import './styles/main.scss';

type Screen = 'landing' | 'settings' | 'game' | 'gameover';

const app = document.querySelector('main');

function showScreen(screen: Screen): void {
    if (!app) return;

    const template = document.getElementById(`screen-${screen}`);
    if (!(template instanceof HTMLTemplateElement)) return;

    app.replaceChildren(template.content.cloneNode(true));
}

const params = new URLSearchParams(location.search);
const initialScreen = (params.get('screen') as Screen) ?? 'landing';

showScreen(initialScreen);
