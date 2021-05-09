/*! terminal.js v2.1-alpha | https://github.com/eosterberg/terminaljs */

module.exports = (function () {
	// PROMPT_TYPE
	var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3;

	var firstPrompt = true;
	promptInput = function (terminalObj, message, PROMPT_TYPE, callback) {
		var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT);
		var inputField = document.createElement('input');

		inputField.style.position = 'absolute';
		inputField.style.zIndex = '-100';
		inputField.style.outline = 'none';
		inputField.style.border = 'none';
		inputField.style.opacity = '0';
		inputField.style.fontSize = '0.2em';

		terminalObj._inputLine.textContent = '';
		terminalObj._input.style.display = 'block';
		terminalObj.html.appendChild(inputField);
		terminalObj.fireCursorInterval(inputField);

		if (message.length) {
			terminalObj.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message);
		}

		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none';
		}

		inputField.onfocus = function () {
			inputField.value = terminalObj._inputLine.textContent;
			terminalObj._cursor.style.display = 'inline';
		}

		terminalObj.html.onclick = function () {
			inputField.focus();
		}
		inputField.onkeydown = function (e) {
			if (e.code === 'ArrowUp' || e.code === 'ArrowRight' || e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'Tab') {
				e.preventDefault();
			} else if (shouldDisplayInput && e.code !== 'Enter') {
				setTimeout(function () {
					terminalObj._inputLine.textContent = inputField.value
				}, 1);
			}
		}
		inputField.onkeyup = function (e) {
			if (PROMPT_TYPE === PROMPT_CONFIRM || e.code === "Enter") {
				terminalObj._input.style.display = 'none';
				var inputValue = inputField.value;
				if (shouldDisplayInput) {
					terminalObj.print(inputValue);
				} else {
					terminalObj.html.removeChild(inputField);	
				}
				if (typeof(callback) === 'function') {
					if (PROMPT_TYPE === PROMPT_CONFIRM) {
						callback(inputValue.toUpperCase()[0] === 'Y' ? true : false);
					} else {
						callback(inputValue);
					};
				}
			}
		}
		if (firstPrompt) {
			firstPrompt = false;
			setTimeout(function () { 
				inputField.focus()	
			}, 50);
		} else {
			inputField.focus();
		}
	}


	var TerminalConstructor = function (containerId) {

		let terminalObj = this;

		this.html = document.createElement('div');
		this.html.className = 'Terminal';

		this._innerWindow = document.createElement('div');
		this._output = document.createElement('p');
		this._inputLine = document.createElement('span'); //the span element where the users input is put
		this._cursor = document.createElement('span');
		this._input = document.createElement('p'); //the full element administering the user input, including cursor
		this._shouldBlinkCursor = true;

		this.cursorTimer;
		this.fireCursorInterval = function (inputField) {
			if (terminalObj.cursorTimer) { clearTimeout(terminalObj.cursorTimer); }
			terminalObj.cursorTimer = setTimeout(function () {
				if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
					terminalObj._cursor.style.visibility = terminalObj._cursor.style.visibility === 'visible' ? 'hidden' : 'visible';
					terminalObj.fireCursorInterval(inputField);
				} else {
					terminalObj._cursor.style.visibility = 'visible';
				}
			}, 500);
		};

		this.print = function (message) {
			var newLine = document.createElement('div');
			newLine.textContent = message;
			this._output.appendChild(newLine);
			return this;
		}

		this.input = function (message, callback) {
			promptInput(this, message, PROMPT_INPUT, callback);
			return this;
		}

		this.password = function (message, callback) {
			promptInput(this, message, PROMPT_PASSWORD, callback);
			return this;
		}

		this.confirm = function (message, callback) {
			promptInput(this, message, PROMPT_CONFIRM, callback);
			return this;
		}

		this.clear = function () {
			this._output.innerHTML = '';
			return this;
		}

		this.sleep = function (milliseconds, callback) {
			setTimeout(callback, milliseconds);
			return this;
		}

		this.setTextSize = function (size) {
			this._output.style.fontSize = size;
			this._input.style.fontSize = size;
			return this;
		}

		this.setTextColor = function (col) {
			this.html.style.color = col;
			this._cursor.style.background = col;
			return this;
		}

		this.setBackgroundColor = function (col) {
			this.html.style.background = col;
			return this;
		}

		this.setWidth = function (width) {
			this.html.style.width = width;
			return this;
		}

		this.setHeight = function (height) {
			this.html.style.height = height;
			return this;
		}

		this.blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase();
			this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES');
			return this;
		}

		this._input.appendChild(this._inputLine);
		this._input.appendChild(this._cursor);
		this._innerWindow.appendChild(this._output);
		this._innerWindow.appendChild(this._input);
		this.html.appendChild(this._innerWindow);

		this.setBackgroundColor('black')
			.setTextColor('white')
			.setTextSize('1em')
			.setWidth('100%')
			.setHeight('100%');

		this.html.style.fontFamily = 'Monaco, Courier';
		this.html.style.margin = '0';
		this._innerWindow.style.padding = '10px';
		this._input.style.margin = '0';
		this._output.style.margin = '0';
		this._cursor.style.background = 'white';
		this._cursor.innerHTML = 'C'; //put something in the cursor..
		this._cursor.style.display = 'none'; //then hide it
		this._input.style.display = 'none';

		if (typeof(containerId) === 'string') { 
			let container = document.getElementById(containerId);
			container.innerHTML = "";
			container.appendChild(this.html);
		} else {
			throw "terminal-js-emulator requires (string) parent container id in the constructor";
		}
	}

	return TerminalConstructor;
}())