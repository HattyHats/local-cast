import sys

def inject():
    with open('style.css', 'r') as f:
        css = f.read()
    
    new_css = """
/* V4 MEGA UPGRADE STYLES */

/* Dead Drop Glow */
.dead-drop {
    color: var(--neon-red) !important;
    text-shadow: 0 0 10px rgba(255,0,0,0.5);
    font-style: italic;
}

/* Burn Overlay Animation */
@keyframes burnPulse {
    0% { background: rgba(255, 0, 0, 0.1); }
    50% { background: rgba(255, 0, 0, 0.4); }
    100% { background: rgba(255, 0, 0, 0.1); }
}
#burn-overlay.active {
    display: flex !important;
    animation: burnPulse 0.5s infinite;
}

/* Whisper Messages */
.whisper-message {
    padding: 0.5rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    word-break: break-all;
}
.whisper-message.self {
    border-left: 2px solid var(--neon-blue);
}
.whisper-message.other {
    border-left: 2px solid var(--neon-pink);
}

/* Radar Pulse Animation */
@keyframes radarSweep {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.radar-sweep {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: conic-gradient(from 0deg, rgba(57,255,20,0) 70%, rgba(57,255,20,0.4) 100%);
    border-radius: 50%;
    animation: radarSweep 2s linear infinite;
    pointer-events: none;
}
"""
    if "V4 MEGA UPGRADE STYLES" not in css:
        with open('style.css', 'a') as f:
            f.write(new_css)
    print("Injected V4 CSS successfully.")

if __name__ == '__main__':
    inject()
