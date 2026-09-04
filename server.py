import http.server
import socketserver
import urllib.parse
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8888

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path.startswith('/log_error'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if 'msg' in query:
                print("JS ERROR LOGGED:", query['msg'][0], file=sys.stderr)
            self.send_response(200)
            self.end_headers()
            return
        super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving Local-Cast at http://localhost:{PORT}")
    sys.stdout.flush()
    httpd.serve_forever()
