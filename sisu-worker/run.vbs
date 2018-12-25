' Option Explicit

Sub RunAutomation
    ' Declare local variables
    Dim objRhino, objRhinoScript, objShell, runfile
    
    runfile = Wscript.Arguments.Item(0)

    ' Create a Rhino application object
    On Error Resume Next
    Set objRhino = CreateObject("Rhino.Application")

    If Err.Number <> 0 Then
        Call WScript.Echo("Failed to create Rhino object.")
        Exit Sub
    End If
        Call WScript.Echo("Rhino object created.")

    WScript.Sleep(500)

    Call objRhino.RunScript("_-RunPythonScript " & runfile, 0)
    Call WScript.Echo("Done!")
End Sub

Call RunAutomation