/*! terminal.js v2.0 | (c) 2014 Erik Österberg | https://github.com/eosterberg/terminaljs */
/*! Additional code | (c) 2015 Mark Ivanowich */

var Terminal = (function () {
	// PROMPT_TYPE
	var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3, PROMPT_LOAD = 4

	var fireCursorInterval = function (inputField, terminalObj) {
		var cursor = terminalObj._cursor
		setTimeout(function () {
			if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
				cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible'
				fireCursorInterval(inputField, terminalObj)
			} else {
				cursor.style.visibility = 'visible'
			}
		}, 500)
	}

	var firstPrompt = true;
	promptInput = function (terminalObj, message, PROMPT_TYPE, callback) {
		var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT)
		var inputField = document.createElement('input')

		inputField.style.position = 'absolute'
		inputField.style.zIndex = '-100'
		inputField.style.outline = 'none'
		inputField.style.border = 'none'
		inputField.style.opacity = '0'
		inputField.style.fontSize = '0.2em'

		terminalObj._inputLine.textContent = ''
		terminalObj._input.style.display = 'block'
		terminalObj.html.appendChild(inputField)
		fireCursorInterval(inputField, terminalObj)

		//I know I may have bad form in here. I need to review and revise. I am using message as a carrier for additional data.
		if(typeof(message) === 'object'){
			if (PROMPT_TYPE === PROMPT_LOAD){
					if(!message.width) message.width=20;
					if(!message.text.length) message.text='Loading...';
					terminalObj.printraw('<span id=\''+message.name+'\'>'+message.text + '<span>');
					var lastProgress = 0;
					var bar = document.getElementById(message.name);
					function processCheck(){
						if (typeof(message.progress) === 'function')
							lastProgress = message.progress();
						if( lastProgress >=100){
							clearInterval(processInterval);
							bar.removeAttribute('id');
							if (typeof(callback) === 'function')callback();
						}else{
							var barWidth = Math.floor((message.progress()/100)*message.width);
							var sections = "";
							for(var i=0;i<message.width;i++){
								sections += (i<barWidth)?"=":(i==barWidth)?">":"&nbsp;";
							}
							bar.innerHTML = message.text + " ["+sections+"]";
						}
					}
					var processInterval = setInterval(processCheck, 500);
			}
		}
		if (message.length) terminalObj.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message);

		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none'
		}

		inputField.onfocus = function () {
			inputField.value = terminalObj._inputLine.textContent
			terminalObj._cursor.style.display = 'inline'
		}

		terminalObj.html.onclick = function () {
			inputField.focus()
		}

		inputField.onkeydown = function (e) {
			if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
				e.preventDefault()
			} else if (shouldDisplayInput && e.which !== 13) {
				setTimeout(function () {
					terminalObj._inputLine.textContent = inputField.value
				}, 1)
			}
		}
		inputField.onkeyup = function (e) {
			if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
				terminalObj._input.style.display = 'none'
				var inputValue = inputField.value
				if (shouldDisplayInput) {
					terminalObj.history.push(inputValue);
					terminalObj.lasthistory=terminalObj.history.length;
					terminalObj.print(inputValue)
				}
				terminalObj.html.removeChild(inputField)
				if (typeof(callback) === 'function') {
					if (PROMPT_TYPE === PROMPT_CONFIRM) {
						callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
					} else if(PROMPT_TYPE !== PROMPT_LOAD) callback(inputValue)
				}
			}
			if (PROMPT_TYPE === PROMPT_INPUT){
				if(e.which === 38 && terminalObj.lasthistory!=-1){
					inputField.value=terminalObj.history[(terminalObj.lasthistory-=1)>0?terminalObj.lasthistory:terminalObj.lasthistory=0];
					terminalObj._inputLine.textContent = inputField.value;
				}else if(e.which === 40 && terminalObj.lasthistory!=-1){
					inputField.value=terminalObj.history[(terminalObj.lasthistory+=1)<terminalObj.history.length?terminalObj.lasthistory:terminalObj.lasthistory=terminalObj.history.length];
					if(terminalObj.lasthistory==terminalObj.history.length) inputField.value="";
					terminalObj._inputLine.textContent = inputField.value;
				}
			}
		}
		if (firstPrompt) {
			firstPrompt = false
			setTimeout(function () { inputField.focus()	}, 50)
		} else {
			inputField.focus()
		}
	}

	var terminalBeep;

	var TerminalConstructor = function (id) {
		// Linking audio to your site is not nice. Keep it open.
		if (!terminalBeep) {
			terminalBeep = document.createElement('audio')
			var source = '<source src="http://www.erikosterberg.com/terminaljs/beep.'
			terminalBeep.innerHTML = source + 'mp3" type="audio/mpeg">' + source + 'ogg" type="audio/ogg">'
			terminalBeep.volume = 0.05
		}

		this.html = document.createElement('div')
		this.html.className = 'Terminal'
		if (typeof(id) === 'string') { this.html.id = id }

		this._innerWindow = document.createElement('div')
		this._output = document.createElement('p')
		this._inputLine = document.createElement('span') //the span element where the users input is put
		this._cursor = document.createElement('span')
		this._input = document.createElement('p') //the full element administering the user input, including cursor

		this._shouldBlinkCursor = true

		//New by Mark
		this.history =[]
		this.lasthistory=-1;//-1 by default. 0 is a valuable number.


		this.beep = function () {
			terminalBeep.load()
			terminalBeep.play()
		}

		//New by Mark
		this.empty = function () {
			var newLine = document.createElement('div')
			newLine.innerHTML = '&nbsp;'
			this._output.appendChild(newLine)
		}

		this.print = function (message) {
			var newLine = document.createElement('div')
			newLine.textContent = message
			this._output.appendChild(newLine)
		}

		//New by Mark
		this.printraw = function (message) {
			//follows innerHTML, thus html elements can be added to a page.
			var newLine = document.createElement('div')
			newLine.innerHTML = message
			this._output.appendChild(newLine)
		}

		//New by Mark
		this.load = function (name, message, width, progress, callback){
			//message is what to show while loading. can be simple as "Loading..."
			//width is the loading bar in internal characters. Example 10 would be:
			//[=========>]
			//progress will be a function called to check status every half second
			//callback executes on full load.
			promptInput(this, {text:message, name: name, width: width, progress:progress}, PROMPT_LOAD, callback)
		}

		this.input = function (message, callback) {
			promptInput(this, message, PROMPT_INPUT, callback)
		}

		this.password = function (message, callback) {
			promptInput(this, message, PROMPT_PASSWORD, callback)
		}

		this.confirm = function (message, callback) {
			promptInput(this, message, PROMPT_CONFIRM, callback)
		}

		this.clear = function () {
			this._output.innerHTML = ''
		}
		
		//New by Mark
		this.clearHistory = function () {
			this.history = [];
			this.lasthistory = -1;
		}

		this.sleep = function (milliseconds, callback) {
			setTimeout(callback, milliseconds)
		}

		this.setTextSize = function (size) {
			this._output.style.fontSize = size
			this._input.style.fontSize = size
		}

		this.setTextColor = function (col) {
			this.html.style.color = col
			// this._cursor.style.background = col
			this._cursor.style.color = col
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
			// Why convert to string? Why? WHY?
			// bool = bool.toString().toUpperCase()
			// this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES')
			this._shouldBlinkCursor = bool;
		}

		this._input.appendChild(this._inputLine)
		this._input.appendChild(this._cursor)
		this._innerWindow.appendChild(this._output)
		this._innerWindow.appendChild(this._input)
		this.html.appendChild(this._innerWindow)

		this.setBackgroundColor('black')
		this.setTextColor('white')
		this.setTextSize('1em')
		this.setWidth('100%')
		this.setHeight('100%')

		this.html.style.fontFamily = 'Monaco, Courier'
		this.html.style.margin = '0'
		this._innerWindow.style.padding = '10px'
		this._input.style.margin = '0'
		this._output.style.margin = '0'
		// this._cursor.style.background = 'white'
		// this._cursor.innerHTML = 'C' //put something in the cursor..
		this._cursor.innerHTML = '&#9610;' //lets make this an actual block instead of a filled cursor
		this._cursor.style.display = 'none' //then hide it
		this._cursor.style.margin = '0' //size is just a bit off
		this._cursor.style.padding = '0' //size is just a bit off
		this._input.style.display = 'none'
	}

	return TerminalConstructor
}())
