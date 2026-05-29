import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    js = js.replace('myPeerId', '(peer ? peer.id : null)')

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Fixed peer id")

if __name__ == '__main__':
    inject()
