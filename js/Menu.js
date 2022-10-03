export class Menu {

    constructor() {
        const eye = document.getElementById('pupil');
        window.addEventListener('mousemove', (event) => {
            const x = -(window.innerWidth / 2 - event.pageX) / 10;
            const y = -(window.innerHeight / 2 - event.pageY) / 10;

            eye.style.transform = `translateY(${y}px) translateX(${x}px)`;

        })
    }
}