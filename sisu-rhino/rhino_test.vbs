' Try creating a Rhino Application object
Dim objRhino
Set objRhino = CreateObject("Rhino.Application")
Call WScript.Echo("Rhino object created.")
Call WScript.Echo(objRhino.IsInitialized)

' Create a shell object
Set objShell = WScript.CreateObject("WScript.Shell")
' Get the desktop folder
strDesktop = objShell.SpecialFolders("Desktop")
strPath = Chr(34) & strDesktop & "\test-rhino.3dm" & Chr(34)

WScript.Echo(strPath)

' Save the file  
Call objRhino.RunScript("_Line 0,0,0 2,2,2", 0)
Call objRhino.RunScript("_-Save " & strPath, 0)

Wscript.Echo "Done"

' For Each arg In args
'   Wscript.Echo "arg: "+arg
' Next