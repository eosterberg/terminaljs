terminaljs
==========

terminal.js is a dead simple JavaScript library for emulating a shell environment.


A terminal.js instance offers the following methods:

- .html()
  
Returns the top DOM element of the terminal instance.

- .print(message)
  Prints the message on a new line.

- .input(message, callback)
  Prints the message, and shows a prompt where the user can write. When the user presses enter, the callback function fires. The callback takes one argument, which is the user input.

- .clear()
  Clears the screen.

- .sleep(milliseconds, callback)
  Works exactly like the JavaScript "setTimeout" function. Waits for the number of milliseconds given, then executes the callback.

- .beep()
  Plays a retro digital tone.

- .setTextSize()
- .setTextColor()
- .setBackgroundColor()
- .setWidth()
- .setHeight()
  All the ".set" methods accepts any CSS-compliant value.

- .blinkingCursor(boolean)
  Set to true by default.
