import sys

def inject():
    with open('index.html', 'r') as f:
        html = f.read()

    log_script = """<script>
window.onerror = function(msg, src, lineno, colno, error) {
    console.log("ERROR INTERCEPTED:", msg);
    fetch('/log_error?msg=' + encodeURIComponent(msg + ' at ' + lineno + ':' + colno));
};
</script>"""
    if "ERROR INTERCEPTED" not in html:
        html = html.replace("<head>", "<head>\n" + log_script)
        
    with open('index.html', 'w') as f:
        f.write(html)

if __name__ == '__main__':
    inject()
