on run
	set appPath to POSIX path of (path to me)
	set publisherDirectory to do shell script "/usr/bin/dirname " & quoted form of appPath
	set toolsDirectory to do shell script "/usr/bin/dirname " & quoted form of publisherDirectory
	set projectRoot to do shell script "/usr/bin/dirname " & quoted form of toolsDirectory

	set choice to display dialog "¿Publicar los cambios de esta carpeta en agresti3d.web.app?" & return & return & "Se actualizará el sitio público usando Firebase Hosting. La Terminal se abrirá para mostrar el resultado." with title "Agresti.3D · Publicar" buttons {"Cancelar", "Publicar"} default button "Publicar" cancel button "Cancelar" with icon caution
	if button returned of choice is not "Publicar" then return

	set publishCommand to "cd " & quoted form of projectRoot & " && firebase deploy --only hosting --project agresti-3d"

	try
		tell application "Terminal"
			activate
			do script publishCommand
		end tell
	on error errorMessage
		display dialog "No se pudo iniciar la publicación." & return & return & errorMessage with title "Agresti.3D · Publicar" buttons {"Cerrar"} default button "Cerrar" with icon stop
	end try
end run
