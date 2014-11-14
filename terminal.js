// wrap a 'new Terminal' call for backwards compatibility?
var terminal = function (id) {
	return new Terminal(id)
}

var Terminal = (function () {
	var firstInstance = true;
	var terminalBeep
	
	var setInputStyling = function (inputField) {
		inputField.style.position = 'absolute'
		inputField.style.zIndex = '-100'
		inputField.style.outline = 'none'
		inputField.style.border = 'none'
		inputField.style.opacity = '0'
		inputField.style.fontSize = '0.2em'
	}
	
	var fireCursorInterval = function (terminalObj) {
		var cursor = terminalObj._cursor
		setTimeout(function () {
			if (terminalObj._shouldBlinkCursor) {
				cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible'
				fireCursorInterval(terminalObj)
			} else {
				cursor.style.visibility = 'visible'
			}
		}, 500)
	}

	promptInput = function (terminalObj, string, shouldDisplayIt, callback) {
		var inputField = document.createElement('input')
		setInputStyling(inputField)
		terminalObj._input_line.textContent = ''
		fireCursorInterval(terminalObj)
		terminalObj._input.style.display = 'block'
		terminalObj.html.appendChild(inputField)
		if (string.length > 0) {
			terminalObj.print(string)
		}
		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none'
		}
		inputField.onfocus = function () {
			inputField.value = terminalObj._input_line.textContent
			terminalObj._cursor.style.display = 'inline'
		}
		terminalObj.html.addEventListener('click', function () {
			inputField.focus()
		}, false)
		inputField.addEventListener('keydown', function (e) {
			if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
				e.preventDefault()
			} else if (e.which !== 13) {
				setTimeout(function () {
					if (shouldDisplayIt) {
						terminalObj._input_line.textContent = inputField.value
					}
				}, 1)
			}
		}, false)
		inputField.addEventListener('keyup', function (e) {
			if (e.which === 13) {
				terminalObj._input.style.display = 'none'
				if (shouldDisplayIt) {
					terminalObj.print(inputField.value)
				}
				terminalObj.html.removeChild(inputField)
				if (typeof(callback) === 'function') {
					callback(inputField.value)
				}
			}
		}, false)
		if (firstInstance) {
			firstInstance = false
			setTimeout(function () {
				inputField.focus()
			}, 50)
		} else {
			inputField.focus()
		}
	}
	
	var TerminalInstance = function (id) {

		this._shouldBlinkCursor = true		

		this.html = document.createElement('div')
		if (typeof(id) === 'string') { this.html.id = id }

		this._inner_window = document.createElement('div')
		this._output = document.createElement('p')
		this._input_line = document.createElement('span') //the span element where the users input is put
		this._cursor = document.createElement('span')
		this._input = document.createElement('p') //the full element administering the user input, including cursor

		this.beep = function () {						
			terminalBeep.load()
			terminalBeep.play()
		}

		this.print = function (string) {
			var newLine = document.createElement('div')
			newLine.textContent = string
			this._output.appendChild(newLine)
		}
		
		this.password = function (string, callback) {
			promptInput(this, string, false, callback)
		}
		
		this.input = function (string, callback) {
			promptInput(this, string, true, callback)
		}
		
		this.clear = function () {
			this._output.innerHTML = ''
		}
		
		this.sleep = function (milliseconds, callback) {
			setTimeout(function () {
				callback()
			}, milliseconds)
		}
		
		this.setTextSize = function (size) {
			this._output.style.fontSize = size
			this._input.style.fontSize = size
		}
		
		this.setTextColor = function (col) {
			this.html.style.color = col
			this._cursor.style.background = col
		}
		
		this.setBackgroundColor = function (col) {
			this.html.style.background = col
		}
		
		this.setWidth = function (width) {
			this.html.style.width = width
		}
		
		this.setHeight = function (height) {
			this.html.style.height = height
		}
		
		this.blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase()
			this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES')
		}

		/* ------ set the structure: ------*/
		this._input.appendChild(this._input_line)
		this._input.appendChild(this._cursor)
		this._inner_window.appendChild(this._output)
		this._inner_window.appendChild(this._input)
		this.html.appendChild(this._inner_window)

		/* ------ set the default styling: ------*/
		this.setBackgroundColor('black')
		this.setTextColor('white')
		this.setTextSize('1em')
		this.setWidth('100%')
		this.setHeight('100%')

		this.html.style.fontFamily = 'Monaco, Courier'
		this.html.style.margin = '0'
		this._inner_window.style.padding = '10px'
		this._input.style.margin = '0'
		this._output.style.margin = '0'
		this._cursor.style.background = 'white'
		this._cursor.innerHTML = 'C' //put something in the cursor..
		this._cursor.style.display = 'none' //then hide it
		this._input.style.display = 'none'

		if (firstInstance) {
			terminalBeep = document.createElement('audio')
			terminalBeep.style.display = 'none'
			var source = '<source src="http://www.erikosterberg.com/terminaljs/beep.'
			terminalBeep.innerHTML = source + 'mp3" type="audio/mpeg">' + source + 'ogg" type="audio/ogg">'
			document.body.appendChild(terminalBeep)
			terminalBeep.volume = 0.05
		}

	}

	return TerminalInstance
}())
/*
terminal = (function () {
	"use strict";
	var theFirstTerminalInstance = true;

	var createANewTerminalWindow = function () {


		var isBlinkingCursor = true;
		var cursorInterval;


		var printLetter = function (inputField) {
			terminal_input_line.textContent = inputField.value;
		};
		var setInputStyling = function (inputField) {
			inputField.style.position = 'absolute';
			inputField.style.zIndex = '-100';
			inputField.style.outline = 'none';
			inputField.style.border = 'none';
			inputField.style.opacity = '0';
			inputField.style.fontSize = '0.2em';
		};
		var startCursorInterval = function () {
			cursorInterval = setInterval(function () {
				if (isBlinkingCursor) {
					blinkTheCursor();
				} else {
					terminal_cursor.style.visibility = 'visible';
				}
			}, 500);
		};
		var blinkTheCursor = function () {
			if (terminal_cursor.style.visibility === 'visible') {
				terminal_cursor.style.visibility = 'hidden';
			} else {
				terminal_cursor.style.visibility = 'visible';
			}
		};


		var html = function () {
			return terminal_window;
		};
		var print = function (string) {
			var newLine = document.createElement('div');
			newLine.textContent = string;
			terminal_output.appendChild(newLine);
		};
		var _input = function (string, show_input ,callback) {
			var inputField = document.createElement('input');
			setInputStyling(inputField);
			terminal_input_line.textContent = '';
			startCursorInterval();
			terminal_input.style.display = 'block';
			terminal_window.appendChild(inputField);
			if (string.length > 0) {
				print(string);
			}
			inputField.onblur = function () {
				terminal_cursor.style.display = 'none';
			};
			inputField.onfocus = function () {
				inputField.value = terminal_input_line.textContent;
				terminal_cursor.style.display = 'inline';
			};
			terminal_window.addEventListener('click', function () {
				inputField.focus();
			}, false);
			inputField.addEventListener('keydown', function (e) {
				if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
					e.preventDefault();
				} else if (e.which !== 13) {
					setTimeout(function () {
						if (show_input){
							printLetter(inputField);
						}
					}, 1);
				}
			}, false);
			inputField.addEventListener('keyup', function (e) {
				if (e.which === 13) {
					terminal_input.style.display = 'none';
					if (show_input){
						print(inputField.value);
					}
					terminal_window.removeChild(inputField);
					clearInterval(cursorInterval);
					if (typeof callback == 'function') {
						callback(inputField.value);
					}
				}
			}, false);
			//set focus on the top input field during load:
			if (theFirstTerminalInstance) {
				theFirstTerminalInstance = false;
				setTimeout(function () {
					inputField.focus();

				}, 50);
			} else {
				inputField.focus();
			}
		};
		var password = function (string, callback) {
			_input(string, false, callback);
		};
		var input = function (string, callback) {
			_input(string, true, callback);
		};
		var clear = function () {
			terminal_output.innerHTML = '';
		};
		var sleep = function (milliseconds, callback) {
			setTimeout(function () {
				callback();
			}, milliseconds);
		};
		var beep = function () {
			document.querySelector('#terminal_beep').volume = 0.05;
			document.querySelector('#terminal_beep').load();
			document.querySelector('#terminal_beep').play();
		};
		var setTextSize = function (size) {
			terminal_output.style.fontSize = size;
			terminal_input.style.fontSize = size;
		};
		var setTextColor = function (col) {
			terminal_window.style.color = col;
			terminal_cursor.style.background = col;
		};
		var setBackgroundColor = function (col) {
			terminal_window.style.background = col;
		};
		var setWidth = function (width) {
			terminal_window.style.width = width;
		};
		var setHeight = function (height) {
			terminal_window.style.height = height;
		};
		var blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase();
			if (bool === 'TRUE' || bool === '1' || bool === 'YES') {
				isBlinkingCursor = true;
			} else {
				isBlinkingCursor = false;
			}
		};

		var terminal_window = document.createElement('div');
		var terminal_inner_window = document.createElement('div');
		var terminal_output = document.createElement('p');
		var terminal_input_line = document.createElement('span'); //the span element where the users input is put
		var terminal_cursor = document.createElement('span');
		var terminal_input = document.createElement('p'); //the full element administering the user input, including cursor

		terminal_input.appendChild(terminal_input_line);
		terminal_input.appendChild(terminal_cursor);
		terminal_inner_window.appendChild(terminal_output);
		terminal_inner_window.appendChild(terminal_input);
		terminal_window.appendChild(terminal_inner_window);

		if (theFirstTerminalInstance) {
			var terminal_beep = document.createElement('audio');
			terminal_beep.setAttribute('id', 'terminal_beep');
			terminal_beep.style.display = 'none';
			terminal_beep.innerHTML = '<source src="http://www.erikosterberg.com/terminaljs/beep.mp3" type="audio/mpeg"><source src="http://www.erikosterberg.com/terminaljs/beep.ogg" type="audio/ogg">';
			terminal_window.appendChild(terminal_beep);
		}

		setBackgroundColor('black');
		setTextColor('white');
		setTextSize('1em');
		setWidth('100%');
		setHeight('100%');
		//terminal_window.style.overflow = 'scroll'; //looks shit in FF
		terminal_window.style.fontFamily = 'Monaco, Courier';
		terminal_window.style.margin = '0';
		terminal_inner_window.style.padding = '10px';
		terminal_input.style.margin = '0';
		terminal_output.style.margin = '0';
		terminal_cursor.style.background = 'white';
		terminal_cursor.innerHTML = 'C'; //put something in the cursor..
		terminal_cursor.style.display = 'none'; //then hide it
		terminal_input.style.display = 'none';


		return {
			html: html,
			print: print,
			input: input,
			password: password,
			clear: clear,
			sleep: sleep,
			beep: beep,
			setTextSize: setTextSize,
			setTextColor: setTextColor,
			setBackgroundColor: setBackgroundColor,
			setWidth: setWidth,
			setHeight: setHeight,
			blinkingCursor: blinkingCursor
		};
	};
	return createANewTerminalWindow;
}()); */