export class Menu {

    constructor() {
        this._initMainMenu();
    }

    _initMainMenu() {
        this.eyeAnimation();
    }

    _initHelpMenu() {}

    eyeAnimation() {
        const eye = document.getElementById('pupil');
        window.addEventListener('mousemove', (event) => {
            const x = -(window.innerWidth / 2 - event.pageX) / 30;
            const y = -(window.innerHeight / 1.5 - event.pageY) / 7;

            eye.style.transform = `translateY(${y}px) translateX(${x}px)`;
        })
    }
}