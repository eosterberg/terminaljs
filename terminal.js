/*!
 * terminal.js v2.0 | (c) 2014 Erik Österberg | https://github.com/eosterberg/terminaljs
 *
 * Modified 2019 by Norbert C. Maier https://github.com/normai/terminaljs/
 * version 0.2.1 — 20190213°0333
 * license : MIT License
 */

/**
 * This file hosts class Terminal plus some helper sequences
 *
 * id : file 20190208°1921
 * encoding : UTF-8-with-BOM
 * changes :
 *    • Supplement semicolons
 *    • Add beep.mp3 and beep.ogg [files 20190208°1845]
 *       from http://www.erikosterberg.com/terminaljs/
 *    • Add function getThisScriptFolder. The script tag in the
 *       page now must define attribute id="TerminalJsScriptTag"
 *    • Cosmetics for input prompt (see seq 20190312°0441)
 */

/**
 * This class provides a div with terminal functionalities
 *
 * id : class 20190208°1923
 */
var Terminal = (function () {
	// PROMPT_TYPE
	var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3;

	var fireCursorInterval = function (inputField, terminalObj) {
		var cursor = terminalObj._cursor;
		setTimeout(function () {
			if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
				cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible';
				fireCursorInterval(inputField, terminalObj);
			} else {
				cursor.style.visibility = 'visible';
			}
		}, 500);
	};

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
		fireCursorInterval(inputField, terminalObj);

		if (message.length) {
         terminalObj.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message);
      }

		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none';
		};

		inputField.onfocus = function () {
			inputField.value = terminalObj._inputLine.textContent;
			terminalObj._cursor.style.display = 'inline';
		};

		terminalObj.html.onclick = function () {
			inputField.focus();
		};

		inputField.onkeydown = function (e) {
			if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
				e.preventDefault();
			} else if (shouldDisplayInput && e.which !== 13) {
				setTimeout(function () {
					terminalObj._inputLine.textContent = inputField.value;
				}, 1);
			}
		};

      inputField.onkeyup = function (e) {
			if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
				terminalObj._input.style.display = 'none';
				var inputValue = inputField.value;
				if (shouldDisplayInput) {
               terminalObj.print(inputValue);
            }
				terminalObj.html.removeChild(inputField);
				if (typeof(callback) === 'function') {
					if (PROMPT_TYPE === PROMPT_CONFIRM) {
						callback(inputValue.toUpperCase()[0] === 'Y' ? true : false);
					} else callback(inputValue);
				}
			}
		};

      if (firstPrompt) {
			firstPrompt = false;
			setTimeout(function () { inputField.focus();	}, 50);
		} else {
			inputField.focus();
		}
	};

	var terminalBeep;

	var TerminalConstructor = function (id) {
		if (! terminalBeep) {
			terminalBeep = document.createElement('audio');

         ///var source = '<source src="http://www.erikosterberg.com/terminaljs/beep.';
			///terminalBeep.innerHTML = source + 'mp3" type="audio/mpeg">' + source + 'ogg" type="audio/ogg">';
         // [seq ..]
         var sAudioUrl = Trekta.getThisScriptFolder() + 'beep.';
         terminalBeep.innerHTML = '<source src="' + sAudioUrl + 'mp3" type="audio/mpeg">'
                                 + '<source src="' + sAudioUrl + 'ogg" type="audio/ogg">'
                                  ;

         terminalBeep.volume = 0.05;
		}

		this.html = document.createElement('div');
		this.html.className = 'Terminal';
		if (typeof(id) === 'string') {
         this.html.id = id;
      };

		this._innerWindow = document.createElement('div');
		this._output = document.createElement('p');
		this._inputLine = document.createElement('span'); // the span element where the users input is put
		this._cursor = document.createElement('span');
		this._input = document.createElement('p'); // the full element administering the user input, including cursor

      // cosmetics for the input prompt [seq 20190312°0441]
      // note : The CSS is provisory set in tools.html (ruleset 20190312°0451)
      // note : See todo 20190312°0441 'do style definitions inside terminal.js'
      this._inputLine.className = 'TerminalInput';

      this._shouldBlinkCursor = true;

		this.beep = function () {
			terminalBeep.load();
			terminalBeep.play();
		};

		this.print = function (message) {
			var newLine = document.createElement('div');

         // experiment [seq 20190312°0443] does not work as expected
         ///newLine.style = "background-color:Red;";
         ///newLine.className = 'TerminalPrint';

         newLine.textContent = message;
			this._output.appendChild(newLine);
		};

		this.input = function (message, callback) {
			promptInput(this, message, PROMPT_INPUT, callback);
		};

		this.password = function (message, callback) {
			promptInput(this, message, PROMPT_PASSWORD, callback);
		};

		this.confirm = function (message, callback) {
			promptInput(this, message, PROMPT_CONFIRM, callback);
		};

		this.clear = function () {
			this._output.innerHTML = '';
		};

		this.sleep = function (milliseconds, callback) {
			setTimeout(callback, milliseconds);
		};

		this.setTextSize = function (size) {
			this._output.style.fontSize = size;
			this._input.style.fontSize = size;
		};

		this.setTextColor = function (col) {
			this.html.style.color = col;
			this._cursor.style.background = col;
		};

		this.setBackgroundColor = function (col) {
			this.html.style.background = col;
		};

		this.setWidth = function (width) {
			this.html.style.width = width;
		};

		this.setHeight = function (height) {
			this.html.style.height = height;
		};

		this.blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase();
			this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES');
		};

		this._input.appendChild(this._inputLine);
		this._input.appendChild(this._cursor);
		this._innerWindow.appendChild(this._output);
		this._innerWindow.appendChild(this._input);
		this.html.appendChild(this._innerWindow);

		this.setBackgroundColor('black');
		this.setTextColor('white');
		this.setTextSize('1em');
		this.setWidth('100%');
		this.setHeight('100%');

		this.html.style.fontFamily = 'Monaco, Courier';
		this.html.style.margin = '0';
		this._innerWindow.style.padding = '10px';
		this._input.style.margin = '0';
		this._output.style.margin = '0';
		this._cursor.style.background = 'white';
		this._cursor.innerHTML = 'C'; // put something in the cursor..
		this._cursor.style.display = 'none'; // then hide it
		this._input.style.display = 'none';
	};

	return TerminalConstructor;
}());

/**
 * Use existing namespace or create it
 *
 * @id 20190209°0211
 */
Trekta = window.Trekta || {};

/**
 * Retrieve URL of the folder where this script resides
 *
 * @id 20190209°0221
 */
Trekta.getThisScriptFolder = ( function() {
   var sThisScriptUrl = document.getElementById('TerminalJsScriptTag').src;
   sThisScriptUrl = sThisScriptUrl.substring(0, sThisScriptUrl.length - 'terminal.js'.length );
   return function() {
      return sThisScriptUrl;
   };
})();

/* eof */
