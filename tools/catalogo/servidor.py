#!/usr/bin/env python3
"""Servidor local del editor y del recortador de fotos de Agresti.3D."""

import io
import json
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[2]
PROCESSOR = ROOT / "tools" / "recortar-fotos.py"
HOST = "127.0.0.1"
PORT = 8766
MAX_UPLOAD = 25 * 1024 * 1024
MAX_CATALOG = 10 * 1024 * 1024
MAX_PRODUCT_IMAGE = 300 * 1024
MAX_PRODUCT_VIDEO = 50 * 1024 * 1024
MAX_ETIQUETA_HTML = 2 * 1024 * 1024
VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}
SUPPORTED_EXTENSIONS = frozenset(
    {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff"}
)
HEIF_EXTENSIONS = (".heic", ".heif")


class EditorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _respond(self, status, message):
        body = message.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _respond_pdf(self, contenido):
        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", 'attachment; filename="agresti-etiquetas.pdf"')
        self.send_header("Content-Length", str(len(contenido)))
        self.end_headers()
        self.wfile.write(contenido)

    def _etiquetas_pdf(self):
        if not self._same_local_origin():
            self._respond(403, "El PDF solo se puede generar desde este editor local.")
            return
        body = self._request_body(MAX_ETIQUETA_HTML, "No se recibió la etiqueta.")
        if body is None:
            return
        try:
            data = json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._respond(400, "La etiqueta no es un JSON válido.")
            return
        html = str(data.get("html", ""))
        if len(html) < 50 or "<html" not in html.lower():
            self._respond(400, "El HTML de la etiqueta está vacío o incompleto.")
            return

        chrome_paths = (
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        )
        chrome = next((ruta for ruta in chrome_paths if Path(ruta).exists()), None)
        if not chrome:
            self._respond(
                503,
                "No se encontró Chrome para generar el PDF. Abrí el editor desde Chrome o instalá Chrome.",
            )
            return

        with tempfile.TemporaryDirectory(prefix="agresti-etiquetas-") as temporal:
            base = Path(temporal)
            html_path = base / "etiquetas.html"
            pdf_path = base / "etiquetas.pdf"
            html_path.write_text(html, encoding="utf-8")
            comando = [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-first-run",
                "--no-default-browser-check",
                f"--user-data-dir={base / 'chrome'}",
                "--no-pdf-header-footer",
                "--run-all-compositor-stages-before-draw",
                "--virtual-time-budget=10000",
                f"--print-to-pdf={pdf_path}",
                html_path.as_uri(),
            ]
            try:
                resultado = subprocess.run(
                    comando,
                    capture_output=True,
                    text=True,
                    stdin=subprocess.DEVNULL,
                    timeout=90,
                    check=False,
                )
            except subprocess.TimeoutExpired:
                self._respond(504, "La generación del PDF tardó demasiado. Intentá de nuevo.")
                return
            if not pdf_path.exists() or pdf_path.stat().st_size < 500:
                detalle = "\n".join(
                    parte.strip()
                    for parte in (resultado.stdout, resultado.stderr)
                    if parte and parte.strip()
                )
                self._respond(502, f"No se pudo generar el PDF.\n{detalle[:3000]}")
                return
            contenido = pdf_path.read_bytes()

        self._respond_pdf(contenido)

    def _same_local_origin(self):
        origin = self.headers.get("Origin")
        host = self.headers.get("Host", "")
        hosts_locales = {f"localhost:{PORT}", f"127.0.0.1:{PORT}"}
        if host not in hosts_locales:
            return False
        if not origin:
            # Los GET same-origin no mandan Origin; el Host local alcanza.
            return True
        parsed = urlsplit(origin)
        return (
            parsed.scheme == "http"
            and parsed.netloc == host
            and parsed.hostname in {"localhost", "127.0.0.1"}
        )

    def do_POST(self):
        if self.path == "/__local/publish":
            self._publish()
            return
        if self.path == "/__local/save-catalog":
            self._save_catalog()
            return
        if self.path == "/__local/save-photo":
            self._save_photo()
            return
        if self.path == "/__local/save-video":
            self._save_video()
            return
        if self.path == "/__local/etiquetas/pdf":
            self._etiquetas_pdf()
            return
        if self.path != "/__local/process-photo":
            self._respond(404, "Ruta no encontrada.")
            return
        if not self._same_local_origin():
            self._respond(403, "El procesador solo acepta solicitudes desde este editor local.")
            return

        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self._respond(400, "No se pudo leer el tamaño de la foto.")
            return

        if content_length <= 0:
            self._respond(400, "Elegí una foto para procesar.")
            return
        if content_length > MAX_UPLOAD:
            self._respond(413, "La foto supera 25 MB. Elegí una versión más liviana.")
            return

        filename = unquote(self.headers.get("X-File-Name", ""))
        extension = Path(filename).suffix.lower()
        if extension not in SUPPORTED_EXTENSIONS:
            self._respond(415, "Formato no compatible. Usá JPG, PNG, WEBP, HEIC o TIFF.")
            return

        try:
            self._process_photo(content_length, extension)
        except subprocess.TimeoutExpired:
            self._respond(504, "El recorte tardó demasiado. Probá con una foto más liviana.")
        except subprocess.CalledProcessError as error:
            detail = error.stderr.decode("utf-8", "replace").strip()
            message = detail or "macOS no pudo procesar esta foto."
            self._respond(422, message)
        except Image.DecompressionBombError:
            self._respond(
                422,
                "No se pudo leer la foto. Verificá que no esté dañada y tenga un formato compatible.",
            )
        except OSError:
            self._respond(
                422,
                "No se pudo leer la foto. Verificá que no esté dañada y tenga un formato compatible.",
            )
        except ValueError as error:
            self._respond(422, str(error))

    def _publish(self):
        if not self._same_local_origin():
            self._respond(403, "La publicación solo se puede iniciar desde este editor local.")
            return

        firebase = shutil.which("firebase")
        if not firebase:
            self._respond(503, "No se encontró Firebase CLI. Instalalo e iniciá sesión para publicar.")
            return

        try:
            result = subprocess.run(
                [firebase, "deploy", "--only", "hosting", "--project", "agresti-3d"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                stdin=subprocess.DEVNULL,
                timeout=300,
                check=False,
            )
        except subprocess.TimeoutExpired:
            self._respond(504, "Firebase tardó más de 5 minutos. Revisá tu conexión e intentá de nuevo.")
            return

        if result.returncode:
            detail = "\n".join(
                part.strip() for part in (result.stdout, result.stderr) if part and part.strip()
            )
            if not detail:
                detail = f"Firebase terminó con el código {result.returncode}."
            self._respond(502, f"No se pudo publicar.\n{detail[:4000]}")
            return

        self._respond(200, "Publicación completada. El sitio https://agresti3d.web.app ya está actualizado.")

    def _request_body(self, limit, required_message):
        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self._respond(400, "No se pudo leer el tamaño de los datos.")
            return None

        if content_length <= 0:
            self._respond(400, required_message)
            return None
        if content_length > limit:
            self._respond(413, "El archivo supera el tamaño permitido.")
            return None

        body = self.rfile.read(content_length)
        if len(body) != content_length:
            self._respond(400, "La carga quedó incompleta. Intentá de nuevo.")
            return None
        return body

    def _save_catalog(self):
        if not self._same_local_origin():
            self._respond(403, "El guardado solo se puede iniciar desde este editor local.")
            return

        body = self._request_body(MAX_CATALOG, "No se recibieron datos del catálogo.")
        if body is None:
            return

        try:
            catalog = json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._respond(400, "El catálogo no es un JSON válido.")
            return

        if not (
            isinstance(catalog, dict)
            and isinstance(catalog.get("categorias"), list)
            and isinstance(catalog.get("productos"), list)
        ):
            self._respond(400, "El catálogo debe incluir las listas de categorías y productos.")
            return

        catalog_path = ROOT / "data" / "catalog.json"
        backup_directory = ROOT / "tools" / "catalogo" / "backups"
        temporary_path = None

        try:
            backup_directory.mkdir(parents=True, exist_ok=True)
            backup_name = (
                f"catalog-{datetime.now().strftime('%Y%m%d-%H%M%S')}-"
                f"{uuid.uuid4().hex[:4]}.json"
            )
            (backup_directory / backup_name).write_bytes(catalog_path.read_bytes())

            with tempfile.NamedTemporaryFile(
                mode="wb",
                prefix=".catalog-",
                suffix=".tmp",
                dir=catalog_path.parent,
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                temporary_file.write(body)

            temporary_path.replace(catalog_path)

            # Copia embebida: el editor puede abrirse como archivo local y
            # cargar el catálogo sin depender del servidor.
            catalog_script = (
                "window.__AGRESTI_CATALOG__ = "
                + json.dumps(catalog, ensure_ascii=False, indent=2)
                + ";\n"
            )
            (ROOT / "data" / "catalog.js").write_text(catalog_script, encoding="utf-8")
        except OSError as error:
            self._respond(500, f"No se pudo guardar el catálogo o crear su respaldo: {error}")
            return
        finally:
            self._cleanup_temporary_file(temporary_path)

        self._respond(200, "Catálogo guardado en esta computadora. Ya podés publicarlo en la web.")

    def _save_photo(self):
        if not self._same_local_origin():
            self._respond(403, "El guardado de fotos solo se puede iniciar desde este editor local.")
            return

        product_id = self.headers.get("X-Product-Id", "")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", product_id):
            self._respond(400, "El ID del producto no es válido para guardar la foto.")
            return

        if self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower() != "image/webp":
            self._respond(415, "La foto debe estar procesada como WEBP.")
            return

        body = self._request_body(MAX_PRODUCT_IMAGE, "No se recibió una foto procesada.")
        if body is None:
            return

        try:
            with Image.open(io.BytesIO(body)) as image:
                if image.format != "WEBP" or image.size != (1200, 1200) or "A" not in image.getbands():
                    self._respond(422, "La foto debe ser WEBP cuadrada de 1200 × 1200 con transparencia.")
                    return
                image.verify()
        except (Image.DecompressionBombError, OSError):
            self._respond(422, "No se pudo leer la foto WEBP procesada.")
            return

        image_directory = ROOT / "img" / "productos"
        filename = f"{product_id}-nueva-{uuid.uuid4().hex}.webp"
        destination = image_directory / filename
        temporary_path = None

        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                prefix=".photo-",
                suffix=".tmp",
                dir=image_directory,
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                temporary_file.write(body)

            temporary_path.replace(destination)
        except OSError as error:
            self._respond(500, f"No se pudo guardar la foto: {error}")
            return
        finally:
            self._cleanup_temporary_file(temporary_path)

        self._respond(200, f"img/productos/{filename}")

    def _save_video(self):
        if not self._same_local_origin():
            self._respond(403, "El guardado de videos solo se puede iniciar desde este editor local.")
            return

        product_id = self.headers.get("X-Product-Id", "")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", product_id):
            self._respond(400, "El ID del producto no es válido para guardar el video.")
            return

        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        extension = VIDEO_TYPES.get(content_type)
        if not extension:
            self._respond(415, "El video debe ser MP4, WEBM o MOV.")
            return

        body = self._request_body(MAX_PRODUCT_VIDEO, "No se recibió un video.")
        if body is None:
            return

        es_mp4 = len(body) >= 12 and body[4:8] == b"ftyp"
        es_webm = body[:4] == b"\x1a\x45\xdf\xa3"
        if not (es_mp4 or es_webm):
            self._respond(422, "El archivo no parece un video válido.")
            return

        image_directory = ROOT / "img" / "productos"
        filename = f"{product_id}-video-{uuid.uuid4().hex}{extension}"
        destination = image_directory / filename
        temporary_path = None

        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                prefix=".video-",
                suffix=".tmp",
                dir=image_directory,
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                temporary_file.write(body)

            temporary_path.replace(destination)
        except OSError as error:
            self._respond(500, f"No se pudo guardar el video: {error}")
            return
        finally:
            self._cleanup_temporary_file(temporary_path)

        self._respond(200, f"img/productos/{filename}")

    def _cleanup_temporary_file(self, path):
        if not path or not path.exists():
            return
        try:
            path.unlink()
        except OSError as error:
            self.log_error("No se pudo limpiar el archivo temporal %s: %s", path, error)

    def _process_photo(self, content_length, extension):
        with tempfile.TemporaryDirectory(prefix="agresti-foto-") as directory:
            folder = Path(directory)
            source = folder / f"original{extension}"
            normalized = folder / "entrada.jpg"
            output = folder / "recorte.webp"

            remaining = content_length
            with source.open("wb") as image_file:
                while remaining:
                    chunk = self.rfile.read(min(1048576, remaining))
                    if not chunk:
                        raise OSError("La carga de la foto quedó incompleta.")
                    image_file.write(chunk)
                    remaining -= len(chunk)

            if extension in HEIF_EXTENSIONS:
                subprocess.run(
                    [
                        "sips",
                        "-s",
                        "format",
                        "jpeg",
                        str(source),
                        "--out",
                        str(normalized),
                    ],
                    check=True,
                    capture_output=True,
                    timeout=30,
                )
            else:
                with Image.open(source) as image:
                    if image.width * image.height > 100_000_000:
                        raise ValueError("La foto tiene demasiados píxeles para procesarla.")
                    ImageOps.exif_transpose(image).convert("RGB").save(
                        normalized, "JPEG", quality=96
                    )

            with Image.open(normalized) as image:
                if image.width * image.height > 100_000_000:
                    raise ValueError("La foto tiene demasiados píxeles para procesarla.")

            subprocess.run(
                [
                    sys.executable,
                    str(PROCESSOR),
                    "--entrada",
                    str(normalized),
                    "--salida",
                    str(output),
                ],
                check=True,
                capture_output=True,
                timeout=180,
            )

            result = output.read_bytes()

        self.send_response(200)
        self.send_header("Content-Type", "image/webp")
        self.send_header("Content-Length", str(len(result)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(result)

    def log_message(self, format, *args):
        if self.path == "/__local/process-photo":
            return
        super().log_message(format, *args)


def main():
    try:
        server = HTTPServer((HOST, PORT), EditorHandler)
    except OSError as error:
        raise SystemExit(
            f"No se pudo iniciar el editor en http://localhost:{PORT}: {error}. "
            "Cerrá el otro servidor local e intentá de nuevo."
        ) from error

    print(f"Editor local: http://localhost:{PORT}/tools/catalogo/")
    print("Las fotos se procesan en esta computadora. Para cerrar, presioná Ctrl+C.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor local detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
