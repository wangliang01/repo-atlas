"""本地预览 out/：模拟 Caddy 的 clean URL 回退（/picks/x -> picks/x.html）。"""
import http.server
import os
import socketserver

ROOT = os.path.join(os.path.dirname(__file__), "..", "out")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path.rstrip("/") == "/picks":
            self.send_response(308)
            self.send_header("Location", "/")
            self.end_headers()
            return
        if path != "/" and not os.path.splitext(path)[1]:
            candidate = os.path.join(ROOT, path.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                self.path = path + ".html"
        return super().do_GET()


with socketserver.TCPServer(("127.0.0.1", 4173), Handler) as httpd:
    print("preview on http://127.0.0.1:4173")
    httpd.serve_forever()
