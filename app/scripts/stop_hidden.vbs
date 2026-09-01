' Launches stop.ps1 with zero visible window. See start_hidden.vbs for why
' this indirection (rather than `powershell -WindowStyle Hidden` directly
' from the shortcut) is used.
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
target = """" & scriptDir & "\stop.ps1"""

command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File " & target
CreateObject("WScript.Shell").Run command, 0, False
