export class HUD{
    staminaBar(finalValue = 0) {
        const iframe = document.getElementById('HUD');
        const progress = iframe.contentWindow.document.querySelector('.progress-done');
        let max = 100;
        progress.style.width = `${(finalValue / max) * 100}%`;
        progress.innerText = `${Math.ceil((finalValue / max) * 100)}%`;
        // console.log("finalValue", finalValue);

    }
}
