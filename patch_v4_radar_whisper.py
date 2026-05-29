import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    selectors = """
const btnRadar = document.getElementById('btn-radar');
const radarModal = document.getElementById('radar-modal');
const btnCloseRadar = document.getElementById('btn-close-radar');
const radarCanvas = document.getElementById('radar-canvas');

const whisperModal = document.getElementById('whisper-modal');
const btnCloseWhisper = document.getElementById('btn-close-whisper');
const whisperMessages = document.getElementById('whisper-messages');
const whisperInput = document.getElementById('whisper-input');
const whisperForm = document.getElementById('whisper-form');

let radarBlips = [];
let whisperTarget = null;
"""
    if "const btnRadar" not in js:
        js = js.replace("const btnStreamDirect = document.getElementById('btn-stream-direct');", "const btnStreamDirect = document.getElementById('btn-stream-direct');\n" + selectors)

    # UI Listeners
    ui_listeners = """
if (btnRadar) {
    btnRadar.addEventListener('click', () => {
        radarModal.classList.remove('hidden');
    });
}
if (btnCloseRadar) {
    btnCloseRadar.addEventListener('click', () => {
        radarModal.classList.add('hidden');
    });
}
if (btnCloseWhisper) {
    btnCloseWhisper.addEventListener('click', () => {
        whisperModal.classList.add('hidden');
    });
}

function openWhisper(targetId, alias, color) {
    whisperTarget = targetId;
    document.getElementById('whisper-target-name').innerText = 'Whispering: ' + alias;
    document.getElementById('whisper-target-name').style.color = color;
    whisperMessages.innerHTML = '';
    if(radarModal) radarModal.classList.add('hidden');
    whisperModal.classList.remove('hidden');
}

if (whisperForm) {
    whisperForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!whisperInput.value.trim() || !whisperTarget) return;
        const msg = whisperInput.value.trim();
        
        const div = document.createElement('div');
        div.className = 'whisper-message self';
        div.innerText = `You: ${msg}`;
        whisperMessages.appendChild(div);
        whisperMessages.scrollTop = whisperMessages.scrollHeight;
        
        if (isHost) {
            const conn = connections.find(c => c.peer === whisperTarget);
            if (conn && conn.open) {
                conn.send({ type: 'WHISPER', fromId: myPeerId, fromAlias: 'Host', fromColor: guestColor, msg });
            }
        } else {
            if (hostConnection && hostConnection.open) {
                hostConnection.send({ type: 'WHISPER_RELAY', targetId: whisperTarget, msg, fromId: myPeerId, fromAlias: guestAlias, fromColor: guestColor });
            }
        }
        
        whisperInput.value = '';
    });
}

if (radarCanvas) {
    radarCanvas.addEventListener('click', (e) => {
        const rect = radarCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (const blip of radarBlips) {
            const dx = x - blip.x;
            const dy = y - blip.y;
            if (Math.sqrt(dx*dx + dy*dy) < 20) {
                openWhisper(blip.id, blip.alias, blip.color);
                break;
            }
        }
    });

    function drawRadar() {
        requestAnimationFrame(drawRadar);
        if (radarModal && radarModal.classList.contains('hidden')) return;
        
        canvas = radarCanvas;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 20;

        ctx.strokeStyle = 'rgba(57,255,20,0.2)';
        ctx.lineWidth = 1;
        for(let i=1; i<=3; i++) {
            ctx.beginPath(); ctx.arc(cx, cy, (radius/3)*i, 0, Math.PI*2); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();

        ctx.fillStyle = guestColor || '#39ff14';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText("YOU", cx + 10, cy + 4);

        function hashStr(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
            return Math.abs(hash);
        }
        
        radarBlips = [];
        for (const [id, data] of Object.entries(scratchpadAliases)) {
            if (id === myPeerId) continue;
            const h = hashStr(id);
            const angle = (h % 360) * (Math.PI / 180);
            const dist = 30 + (h % (radius - 50));
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            
            radarBlips.push({ id, x, y, alias: data.alias, color: data.color });
            ctx.fillStyle = data.color || '#39ff14';
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText(data.alias || 'Guest', x + 8, y + 4);
        }
    }
    requestAnimationFrame(drawRadar);
}

function handleWhisper(data) {
    if (whisperModal.classList.contains('hidden') || whisperTarget !== data.fromId) {
        openWhisper(data.fromId, data.fromAlias, data.fromColor);
    }
    const div = document.createElement('div');
    div.className = 'whisper-message other';
    div.style.borderLeftColor = data.fromColor;
    div.innerText = `${data.fromAlias}: ${data.msg}`;
    whisperMessages.appendChild(div);
    whisperMessages.scrollTop = whisperMessages.scrollHeight;
}
"""
    if "function drawRadar()" not in js:
        js = js.replace("function startBurnCountdown", ui_listeners + "\nfunction startBurnCountdown")

    # Add WHISPER handlers in Host and Client logic
    # Host handles WHISPER_RELAY
    host_relay = """                case 'WHISPER_RELAY':
                    if (data.targetId === myPeerId) {
                        handleWhisper(data);
                    } else {
                        const targetConn = connections.find(c => c.peer === data.targetId);
                        if (targetConn && targetConn.open) {
                            targetConn.send({ type: 'WHISPER', fromId: data.fromId, fromAlias: data.fromAlias, fromColor: data.fromColor, msg: data.msg });
                        }
                    }
                    break;
                case 'WHISPER':
                    handleWhisper(data);
                    break;
"""
    if "case 'WHISPER_RELAY':" not in js:
        js = js.replace("case 'GUEST_UPLOAD_ENABLED':", host_relay + "                case 'GUEST_UPLOAD_ENABLED':")

    client_relay = """                case 'WHISPER':
                    handleWhisper(data);
                    break;
"""
    if "case 'WHISPER':" not in js and "case 'TREE':" in js:
        # Find handleClientMessage switch
        js = js.replace("case 'BURN_NOTICE':", client_relay + "                case 'BURN_NOTICE':")

    with open('app.js', 'w') as f:
        f.write(js)
    
    print("Injected Tasks 4 and 5: Radar and Whispers")

if __name__ == '__main__':
    inject()
