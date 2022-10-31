export class Menu {

    constructor() {
        this._initMainMenu();
    }

    _initMainMenu() {
        this._initHelpMenu();
        this._initCredits()
        this.eyeAnimation();
    }

    _initHelpMenu() {
        const modalContainer = document.querySelector('.modal_container');
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
            if(event.target == modalContainer) {
                modal.style.display = 'none';
            }
        })

    }

    _initCredits() {
        const creditsBtn = document.getElementById('credits_button');
        const menuContent = document.querySelector('.main_menu_container');
        const credits = document.querySelector('.crawl');
        const fadeContainer = document.getElementById('fade_container');

        creditsBtn.addEventListener('click', () => {
            this.showCredits(menuContent, credits, fadeContainer);
        })
    }

    showCredits(menuContent, credits, fadeContainer) {
        menuContent.style.display = 'none';
        credits.classList.add('crawl-animation');
        fadeContainer.classList.add('fade');

        this.playMusic(true);

        // After credits end, menu content resets and music stops
        setInterval(() => {
            menuContent.style.display = 'flex';
            credits.classList.remove('crawl-animation');
            fadeContainer.classList.remove('fade');
            this.playMusic(false);
        }, 26800)
    }

    playMusic(isPlaying) {
        const music = document.getElementById('creditsMusic');

        if (!isPlaying) {
            music.currentTime = 0;
            return music.pause();
        }

        music.play();
    }

    // Eye animation for ghost on main menu
    eyeAnimation() {
        const eye = document.getElementById('pupil');
        window.addEventListener('mousemove', (event) => {
            const x = -(window.innerWidth / 2 - event.pageX) / 30;
            const y = -(window.innerHeight / 1.5 - event.pageY) / 7;

            eye.style.transform = `translateY(${y}px) translateX(${x}px)`;
        })
    }
}