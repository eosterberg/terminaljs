/*! terminal.js | https://github.com/eosterberg/terminaljs */

module.exports = (function () {

	var VERSION = '3.0.2';

	// PROMPT_TYPE
	var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3;

	var firstPrompt = true;
	promptInput = function (terminalObj, message, PROMPT_TYPE, callback) {
		var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT || PROMPT_TYPE === PROMPT_CONFIRM);
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
			}
		}
		inputField.onkeyup = function (e) {
			
			var inputValue = inputField.value;

			if (shouldDisplayInput && e.code !== 'Enter') {
				terminalObj._inputLine.textContent = inputField.value;
			}

			if (PROMPT_TYPE === PROMPT_CONFIRM && e.code !== 'Enter') {
				if (e.code !== 'KeyY' && e.code !== 'KeyN') { // PROMPT_CONFIRM accept only "Y" and "N" 
					terminalObj._inputLine.textContent = inputField.value = '';
					return;
				}
				if (terminalObj._inputLine.textContent.length > 1) { // PROMPT_CONFIRM accept only one character
					terminalObj._inputLine.textContent = inputField.value = terminalObj._inputLine.textContent.substr(-1);
				}
			}
			
			if (e.code === "Enter") {

				if (PROMPT_TYPE === PROMPT_CONFIRM) {
					if (!inputValue.length) { // PROMPT_CONFIRM doesn't accept empty string. It requires answer.
						return;		
					}
				}
				
				terminalObj._input.style.display = 'none';
				if (shouldDisplayInput) {
					terminalObj.print(inputValue);
				}
				
				if (terminalObj._backend) {
					var xhr = new XMLHttpRequest()
					xhr.open("POST", terminalObj._backend, true);
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xhr.onreadystatechange = function() {
						if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
							let _respond = xhr.responseText; // mb some extra validation here?
							let respond = JSON.parse(_respond);
							if (respond.length !== 2) {
								throw `Back-end failed: respond suppose to have 2 params but you've got ${respond.length}`;
							}
							switch (respond[0]) {
								case 1:
									terminalObj.input(respond[1]);
								break;
								case 2:
									terminalObj.password(respond[1]);
								break;
								case 3:
									terminalObj.confirm(respond[1]);
								break;
								default:
									throw `Back-end failed (${terminalObj._backend}) - invalid PROMPT_TYPE: ${respond[0]}`;
							}
							terminalObj.scrollBottom(); // scroll to the bottom of the terminal
						}
					}
					xhr.send("command="+encodeURIComponent(inputValue));
				} else if (typeof(callback) === 'function') {
					if (PROMPT_TYPE === PROMPT_CONFIRM) {
						if (inputValue.toUpperCase()[0] === 'Y') {
							callback(true);
						} else if (inputValue.toUpperCase()[0] === 'N') {
							callback(false);
						} else {
							throw `PROMPT_CONFIRM failed: Invalid input (${inputValue.toUpperCase()[0]}})`;
						}
					} else {
						callback(inputValue);
					}
					terminalObj.html.removeChild(inputField); // remove input field in the end of each callback	
					terminalObj.scrollBottom(); // scroll to the bottom of the terminal
				}

			}
		}
		inputField.focus();
	}


	var TerminalConstructor = function (containerId) {

		let terminalObj = this;

		this.html = document.createElement('div');
		this.html.className = 'Terminal';

		this._innerWindow = document.createElement('div');
		this._output = document.createElement('p');
		this._promptPS = document.createElement('span'); 
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

		this.scrollBottom = function() {
			this.html.scrollTop = this.html.scrollHeight;
		}

		this.print = function (message) {
			var newLine = document.createElement('div');
			newLine.textContent = message;
			this._output.appendChild(newLine);
			this.scrollBottom();
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

		this.setPrompt = function (promptPS) {
			this._promptPS.textContent = promptPS;
			return this;
		}

		this.connect = function(url, showConnectionNotification) {
			var connectionNotification = ``;
			this._backend = url;
			if (showConnectionNotification) {
				connectionNotification = `Connected to ${url}`;
			}
			this.input(connectionNotification);
			return this;
		}

		this.getVersion = function() {
			console.info(`TerminalJS ${VERSION}`)
			return VERSION;
		}

		this._input.appendChild(this._promptPS);
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

		this.html.style.fontFamily = 'Ubuntu Mono, Monaco, Courier';
		this.html.style.margin = '0';
		this.html.style.overflow = 'auto';
		this.html.style.whiteSpace = 'pre';
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