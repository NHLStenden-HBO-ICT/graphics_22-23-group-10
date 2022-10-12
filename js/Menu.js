export class Menu {

    constructor() {
        this._initMainMenu();
    }

    _initMainMenu() {
        this._initHelpMenu();
        this.eyeAnimation();
    }

    _initHelpMenu() {
        const helpBtn = document.getElementById('help_button');
        const modal = document.getElementById('helpModal');
        const closeBtn = document.getElementById('closeBtn');

        helpBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        })

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        })

        window.addEventListener('click', (event) => {
            if(event.target == modal) {
                modal.style.display = 'none';
            }
        })

    }

    eyeAnimation() {
        const eye = document.getElementById('pupil');
        window.addEventListener('mousemove', (event) => {
            const x = -(window.innerWidth / 2 - event.pageX) / 30;
            const y = -(window.innerHeight / 1.5 - event.pageY) / 7;

            eye.style.transform = `translateY(${y}px) translateX(${x}px)`;
        })
    }
}