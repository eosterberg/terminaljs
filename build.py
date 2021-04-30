#
# file         : 20210427°1711 terminaljs/build.py
# encoding     : UTF-8-with-BOM
# interpeter   : Python 3.7.8
# requirements : • Closure Compiler on drive • Java path set • Python path set

"""
   This minifies TerminalJs
"""

import os, sys

sBinGoCloCom = 'G:/work/gipsydrive/app.composer/trunk/bin/goclocom/closure-compiler-v20210406.jar'
sSp = ' '

os.chdir(os.path.dirname(__file__))

print('* TerminalJs build *')

# Build yes or no?
bBuild = True
if os.path.isfile('./terminal.min.js') :
   if os.path.getmtime('./terminal.js') < os.path.getmtime('./terminal.min.js') :
      bBuild = False

sCmd = 'java.exe -jar' + sSp + sBinGoCloCom \
      + sSp + './terminal.js' \
      + sSp + '--js_output_file' + sSp + './terminal.min.js' \
      + sSp + '--create_source_map' + sSp + './terminal.min.js.map' \
      + sSp + '--formatting' + sSp + 'PRETTY_PRINT' \
      + sSp + '--charset UTF-8'

if bBuild == True :
   print(' - building ...')
   os.system(sCmd)
else :
   print(' - is up-to-date')

print(' - TerminalJs done.')
