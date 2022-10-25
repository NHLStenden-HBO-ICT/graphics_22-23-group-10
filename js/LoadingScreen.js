export class LoadingScreen {
	static init() {
		const newDiv = document.createElement("div");
		newDiv.id = "loading";
		// newDiv.innerHTML = "Test";
		document.body.appendChild(newDiv);
	}

	static set(text) {
		document.getElementById("loading").innerHTML = text;
	}

	static remove() {
		document.getElementById("loading").remove();
	}
}
