with open('app.js', 'r') as f:
    content = f.read()

whiteboard_logic = """
// --- WHITEBOARD LOGIC ---
const whiteboardModal = document.getElementById('whiteboard-modal');
const btnWhiteboard = document.getElementById('btn-whiteboard');
const btnCloseWhiteboard = document.getElementById('btn-close-whiteboard');
const btnClearWhiteboard = document.getElementById('btn-clear-whiteboard');
const canvas = document.getElementById('whiteboard-canvas');
let ctx = null;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

if (btnWhiteboard && canvas) {
    ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const container = document.getElementById('whiteboard-container');
        if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
            const data = canvas.toDataURL();
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = data;
        }
    }
    
    window.addEventListener('resize', () => {
        if (!whiteboardModal.classList.contains('hidden')) resizeCanvas();
    });

    btnWhiteboard.addEventListener('click', () => {
        whiteboardModal.classList.remove('hidden');
        resizeCanvas();
        if (!isHost && hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'REQUEST_WHITEBOARD' });
        }
    });

    btnCloseWhiteboard.addEventListener('click', () => {
        whiteboardModal.classList.add('hidden');
    });
    
    btnClearWhiteboard.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isHost) {
            Object.values(connections).forEach(c => {
                if (c.open && c.isAuthenticated) c.send({ type: 'WHITEBOARD_CLEAR' });
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send({ type: 'WHITEBOARD_CLEAR' });
        }
    });

    function drawLine(x0, y0, x1, y1, color, emit) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();
        
        if (!emit) return;
        
        const w = canvas.width;
        const h = canvas.height;
        
        const payload = {
            type: 'WHITEBOARD_DRAW',
            x0: x0 / w, y0: y0 / h,
            x1: x1 / w, y1: y1 / h,
            color: color
        };

        if (isHost) {
            Object.values(connections).forEach(c => {
                if (c.open && c.isAuthenticated) c.send(payload);
            });
        } else if (hostConnection && hostConnection.open) {
            hostConnection.send(payload);
        }
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onDown(e) {
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function onMove(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        drawLine(lastX, lastY, pos.x, pos.y, guestColor, true);
        lastX = pos.x;
        lastY = pos.y;
    }

    function onUp(e) {
        if (!isDrawing) return;
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseout', onUp);
    
    canvas.addEventListener('touchstart', onDown, {passive: true});
    canvas.addEventListener('touchmove', onMove, {passive: true});
    canvas.addEventListener('touchend', onUp);
}
"""

content += "\n" + whiteboard_logic

# Add Host Handlers
old_host_chat = """            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {"""
new_host_chat = """            } else if (data.type === 'WHITEBOARD_DRAW' && conn.isAuthenticated) {
                if (ctx) {
                    const w = canvas.width; const h = canvas.height;
                    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
                }
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) c.send(data);
                });
            } else if (data.type === 'WHITEBOARD_CLEAR' && conn.isAuthenticated) {
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                Object.values(connections).forEach(c => {
                    if (c.id !== conn.id && c.open && c.isAuthenticated) c.send(data);
                });
            } else if (data.type === 'REQUEST_WHITEBOARD' && conn.isAuthenticated) {
                if (canvas) conn.send({ type: 'WHITEBOARD_SYNC', image: canvas.toDataURL() });
            } else if (data.type === 'REQUEST_SCRATCHPAD' && conn.isAuthenticated) {"""
content = content.replace(old_host_chat, new_host_chat)

# Add Client Handlers
old_client_recv = """            } else if (data.type === 'SCRATCHPAD_UPDATE') {"""
new_client_recv = """            } else if (data.type === 'WHITEBOARD_DRAW') {
                if (ctx) {
                    const w = canvas.width; const h = canvas.height;
                    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false);
                }
            } else if (data.type === 'WHITEBOARD_CLEAR') {
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else if (data.type === 'WHITEBOARD_SYNC') {
                if (ctx && data.image) {
                    const img = new Image();
                    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    img.src = data.image;
                }
            } else if (data.type === 'SCRATCHPAD_UPDATE') {"""
content = content.replace(old_client_recv, new_client_recv)

with open('app.js', 'w') as f:
    f.write(content)
