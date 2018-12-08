' Option Explicit

Sub RunAutomation
    ' Declare local variables
    Dim objRhino, objRhinoScript, objShell

    ' Create a Rhino application object
    On Error Resume Next
    Set objRhino = CreateObject("Rhino.Application")

    If Err.Number <> 0 Then
        Call WScript.Echo("Failed to create Rhino object.")
        Exit Sub
    End If
        Call WScript.Echo("Rhino object created.")

    WScript.Sleep(500)

    Set args = Wscript.Arguments
    Set filename = args(0)

    Call objRhino.RunScript("_-Open " & filename, 0)
    ' Call objRhino.RunScript("_-RunPythonScript ""D:\Autorhino\test.py""", 0)
    ' Call objRhino.RunScript("_-RunPythonScript ""test.py""", 0)

    Call WScript.Echo("Done!")   
End Sub

Call RunAutomation