# terminal.js <sup><sub><sub>v0.2.1 — 20190213°0333</sub></sub></sup>

terminal.js by Erik Osterberg is a dead simple JavaScript library for emulating a shell environment.

_The present flavour is derivative by Norber C. Maier. The changes are :_
- _The beep files are on-board_
- _Some cursor cosmetics is applied_
- _For the beep files to be found, the script tag must have an ID attribute :_
   _<small>&lt;script&nbsp;src="./terminal.js"&nbsp;**id="TerminalJsScriptTag"**&gt;&lt;/script&gt;</small>_

### Initialization

    var myTerminal = new Terminal(id)

### Properties and methods

    .html
This is the top DOM element of the terminal instance. If you want to modify styling via CSS, all instances belong to a .Terminal class. The element will also get the ID from the constructor argument.

    .print(message)
Prints the message on a new line.

    .input(message, callback)
Prints the message, and shows a prompt where the user can write. When the user presses enter, the callback function fires. The callback takes one argument, which is the user input.

    .password(message, callback)
The same as input but the input of the user will be hidden just like an old-fashioned terminal.

    .confirm(message, callback)
Displays a confirm message, with a " (y/n)" automatically appended at the end. The callback receives the yes/no value as a boolean.

    .clear()
Clears the screen.

    .sleep(milliseconds, callback)
Works exactly like the JavaScript "setTimeout" function. Waits for the number of milliseconds given, then executes the callback.

    .beep()
Plays a retro digital tone.

    .setTextSize()
    .setTextColor()
    .setBackgroundColor()
    .setWidth()
    .setHeight()
All the ".set" methods accepts any CSS-compliant value.

    .blinkingCursor(boolean)
Set to true by default.

Read more at: [erikosterberg.com/terminaljs](http://www.erikosterberg.com/terminaljs)

### License

The MIT License (MIT)

Copyright (c) 2014 Erik Österberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<sup><sub><sub>܀[project 20190213°0211][file 20190208°1941]</sub></sub></sup>
