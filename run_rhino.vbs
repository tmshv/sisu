Option Explicit

Sub TestRhinoAutomation
  ' Declare local variables
  Dim objRhino, objShell, strDesktop, strPath
  
  ' Create a Rhino 5 64-bit application object
  On Error Resume Next
  Set objRhino = CreateObject("Rhino5x64.Application")
  If Err.Number <> 0 Then
    On Error Resume Next
    ' Create a Rhino 5 32-bit application object
    Set objRhino = CreateObject("Rhino5.Application")
    If Err.Number <> 0 Then
      ' Call WScript.Echo("Failed to create Rhino object.")
      Exit Sub
    End If
  End If
  ' Call WScript.Echo("Rhino object created.")

  WScript.Sleep(1000)

  Call objRhino.RunScript("_-RunPythonScript ""C:\Users\Mini\Desktop\DWG_TEST\test.py""", 0)
  ' Call objRhino.RunScript("_-RunPythonScript ""test.py""", 0)
  ' Call WScript.Echo("Script executed.")

  ' Run some commands
  Call objRhino.RunScript("_Circle 0 10", 0)
  Call objRhino.RunScript("_Line -5,-5,0 5,5,0", 0)
  ' Call objRhino.RunScript("_Line 5,-5,0 -5,5,0", 0)
  ' Call WScript.Echo("Geometry created.")
  
  ' Create a shell object
  Set objShell = WScript.CreateObject("WScript.Shell")
  ' Call WScript.Echo("Shell object created.")
  
  ' Get the desktop folder
  strDesktop = objShell.SpecialFolders("Desktop")
  strPath = Chr(34) & strDesktop & "\TestRhinoAutomation.3dm" & Chr(34)

  ' Save the file  
  Call objRhino.RunScript("_-Save " & strPath, 0)
  ' Call WScript.Echo("File saved.")
 
  ' Exit Rhino
  Call objRhino.RunScript("_Exit", 0)
  ' Call WScript.Echo("Done!")
   
End Sub

Sub Hi
  ' Call WScript.Echo("Hi")
End Sub

' Run the subroutine defined above
Call Hi
Call TestRhinoAutomation