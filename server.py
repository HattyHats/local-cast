import http.server
import socketserver
import urllib.parse
import sys

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/log_error'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if 'msg' in query:
                print("JS ERROR LOGGED:", query['msg'][0], file=sys.stderr)
            self.send_response(200)
            self.end_headers()
            return
        super().do_GET()

with socketserver.TCPServer(("", 8080), CustomHandler) as httpd:
    print("serving at port", 8080)
    httpd.serve_forever()
