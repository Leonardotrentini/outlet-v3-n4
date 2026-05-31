#!/usr/bin/env python3
"""Servidor local com charset UTF-8 para a pagina salva."""
import http.server
import socketserver
from pathlib import Path

PORT = 8080
ROOT = Path(__file__).parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if self.path.endswith(".html") or self.path.endswith("/"):
            self.send_header("Content-Type", "text/html; charset=utf-8")
        elif self.path.endswith(".css"):
            self.send_header("Content-Type", "text/css; charset=utf-8")
        elif self.path.endswith(".js") or self.path.endswith(".download"):
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Servindo em http://localhost:{PORT}/")
        httpd.serve_forever()
