' Launches start.ps1 with zero visible window. Used instead of
' `powershell -WindowStyle Hidden` directly: that flag can still flash a
' window briefly (or be overridden) depending on how it's invoked, while
' WScript.Shell.Run's window-style argument (0 = hidden) does not.
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
target = """" & scriptDir & "\start.ps1"""

command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File " & target
CreateObject("WScript.Shell").Run command, 0, False
