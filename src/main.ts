import './styles/main.scss';

type Screen = 'landing' | 'settings' | 'game' | 'gameover';

const app = document.querySelector('main');

function showScreen(screen: Screen): void {
    if (!app) return;

    const template = document.getElementById(`screen-${screen}`);
    if (!(template instanceof HTMLTemplateElement)) return;

    app.replaceChildren(template.content.cloneNode(true));
    updateSettingsProgress();
}

const settingsGroups = ['theme', 'player', 'board-size'];

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
