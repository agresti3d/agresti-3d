on run
	set appPath to POSIX path of (path to me)
	set catalogDirectory to do shell script "/usr/bin/dirname " & quoted form of appPath
	set toolsDirectory to do shell script "/usr/bin/dirname " & quoted form of catalogDirectory
	set projectRoot to do shell script "/usr/bin/dirname " & quoted form of toolsDirectory
	set controllerPath to projectRoot & "/tools/catalogo/control-editor.py"
	set statusCommand to "python3 " & quoted form of controllerPath & " status"

	try
		set editorState to do shell script "/bin/zsh -lc " & quoted form of statusCommand
	on error errorMessage
		display dialog errorMessage with title "Agresti.3D · Editor" buttons {"Cerrar"} default button "Cerrar" with icon stop
		return
	end try

	if editorState is "running" then
		set choice to display dialog "El editor está encendido." & return & return & "¿Querés apagarlo?" with title "Agresti.3D · Editor" buttons {"Dejar encendido", "Apagar editor"} default button "Dejar encendido" with icon note
		if button returned of choice is "Apagar editor" then
			set stopCommand to "python3 " & quoted form of controllerPath & " stop"
			try
				do shell script "/bin/zsh -lc " & quoted form of stopCommand
				display notification "El editor y el recorte de fotos quedaron apagados." with title "Agresti.3D"
			on error errorMessage
				display dialog errorMessage with title "Agresti.3D · Editor" buttons {"Cerrar"} default button "Cerrar" with icon stop
			end try
		end if
	else
		set choice to display dialog "El editor está apagado." & return & return & "¿Querés iniciarlo y abrirlo en el navegador?" with title "Agresti.3D · Editor" buttons {"Ahora no", "Iniciar editor"} default button "Iniciar editor" with icon note
		if button returned of choice is "Iniciar editor" then
			set startCommand to "python3 " & quoted form of controllerPath & " start"
			try
				do shell script "/bin/zsh -lc " & quoted form of startCommand
				open location "http://localhost:8766/tools/catalogo/"
				display notification "Editor abierto. Volvé a hacer doble clic en esta aplicación para apagarlo." with title "Agresti.3D"
			on error errorMessage
				display dialog errorMessage with title "Agresti.3D · Editor" buttons {"Cerrar"} default button "Cerrar" with icon stop
			end try
		end if
	end if
end run
