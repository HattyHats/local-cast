import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    if "let showDeadDrops" not in js:
        js = js.replace("let radarBlips = [];", "let radarBlips = [];\nlet showDeadDrops = false;")

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected let showDeadDrops = false;")

if __name__ == '__main__':
    inject()
