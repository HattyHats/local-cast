with open('index.html', 'r') as f:
    html = f.read()

# Remove the script tags from their current position
script_block = """    <script src="./localforage.min.js"></script>
    <script src="./qrcode.min.js"></script>
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
    <script src="./app.js"></script>
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch(err => {
                    console.log('SW Registration failed: ', err);
                });
            });
        }
    </script>"""

html = html.replace(script_block, "")

# Add them right before </body>
html = html.replace("</body>", script_block + "\n</body>")

with open('index.html', 'w') as f:
    f.write(html)
