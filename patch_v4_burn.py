import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    # Add selectors at top
    selectors = """
const btnBurn = document.getElementById('btn-burn');
const burnOverlay = document.getElementById('burn-overlay');
const burnCountdown = document.getElementById('burn-countdown');
"""
    if "const burnOverlay" not in js:
        js = js.replace("const btnBurn = document.getElementById('btn-burn');", selectors)
    
    # Replace btnBurn listener inside setupHostActions
    old_burn = """    btnBurn.addEventListener('click', () => {
        if (confirm("WARNING: This will instantly destroy the server and wipe all files. Are you sure?")) {
            triggerBurnSequence();
        }
    });"""
    
    new_burn = """    btnBurn.addEventListener('click', () => {
        const time = prompt("SET BURN TIMER (seconds) or 0 for instant:", "10");
        if (time !== null && !isNaN(time)) {
            const seconds = parseInt(time, 10);
            startBurnCountdown(seconds);
            Object.values(connections).forEach(c => {
                if (c.open) c.send({ type: 'BURN_NOTICE', seconds: seconds });
            });
        }
    });"""
    
    if "SET BURN TIMER" not in js:
        js = js.replace(old_burn, new_burn)

    # Add Burn Logic
    burn_logic = """
let burnTimerInterval = null;
function startBurnCountdown(seconds) {
    if (burnTimerInterval) clearInterval(burnTimerInterval);
    burnOverlay.classList.add('active');
    
    let left = seconds;
    burnCountdown.innerText = left.toFixed(2);
    
    const start = Date.now();
    const target = start + (seconds * 1000);
    
    burnTimerInterval = setInterval(() => {
        const now = Date.now();
        let remaining = (target - now) / 1000;
        if (remaining <= 0) {
            remaining = 0;
            clearInterval(burnTimerInterval);
            triggerBurnSequence();
        }
        burnCountdown.innerText = remaining.toFixed(2);
    }, 50);
}

// Modify triggerBurnSequence to be more aggressive
function triggerBurnSequence() {
    vfs = new VirtualFileSystem();
    connections.forEach(conn => conn.close());
    connections = [];
    document.body.innerHTML = '<div style="background:#000; color:#f00; height:100vh; width:100vw; display:flex; justify-content:center; align-items:center; flex-direction:column;"><h1 style="font-size:10vw; margin:0; text-shadow: 0 0 50px #f00;">NETWORK DESTROYED</h1><p>All traces wiped from memory.</p></div>';
}
"""
    if "function startBurnCountdown" not in js:
        js = js.replace("function triggerBurnSequence() {", burn_logic + "\n//")

    # Add BURN_NOTICE handler in handleClientMessage
    if "case 'BURN_NOTICE':" not in js:
        js = js.replace("case 'TREE':", "case 'BURN_NOTICE':\n                    startBurnCountdown(data.seconds);\n                    break;\n                case 'TREE':")
        js = js.replace("case 'GUEST_UPLOAD_ENABLED':", "case 'BURN_NOTICE':\n                    startBurnCountdown(data.seconds);\n                    break;\n                case 'GUEST_UPLOAD_ENABLED':")

    with open('app.js', 'w') as f:
        f.write(js)
    print("Injected Task 1: Burn Notice")

if __name__ == '__main__':
    inject()
