export class LoadingScreen {

	static #loadingElement;

	static init() {
		const newDiv = document.createElement("div");
		newDiv.id = "loading";
		// newDiv.innerHTML = "Test";
		document.body.appendChild(newDiv);
		this.#loadingElement = newDiv;
	}

	/**
	 * Sets the text of the loading screen to the given text
	 * @param {*} text 
	 */
	static set(text) {
		this.#loadingElement.innerHTML = text;
	}

	/**
	 * Removes the loading screen
	 */
	static remove() {
		this.#loadingElement.remove();
	}
}
