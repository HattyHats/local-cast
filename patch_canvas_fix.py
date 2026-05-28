import re

with open('app.js', 'r') as f:
    content = f.read()

# Fix Whiteboard logic
old_logic = """const btnClearWhiteboard = document.getElementById('btn-clear-whiteboard');
const canvas = document.getElementById('whiteboard-canvas');
let ctx = null;"""

new_logic = """const btnClearWhiteboard = document.getElementById('btn-clear-whiteboard');
const wbCanvas = document.getElementById('whiteboard-canvas');
let wbCtx = null;"""

content = content.replace(old_logic, new_logic)
content = content.replace("canvas.width", "wbCanvas.width")
content = content.replace("canvas.height", "wbCanvas.height")
content = content.replace("canvas.toDataURL()", "wbCanvas.toDataURL()")
content = content.replace("canvas.getBoundingClientRect()", "wbCanvas.getBoundingClientRect()")
content = content.replace("canvas.addEventListener", "wbCanvas.addEventListener")
content = content.replace("ctx.drawImage", "wbCtx.drawImage")
content = content.replace("ctx.clearRect", "wbCtx.clearRect")
content = content.replace("ctx.beginPath", "wbCtx.beginPath")
content = content.replace("ctx.moveTo", "wbCtx.moveTo")
content = content.replace("ctx.lineTo", "wbCtx.lineTo")
content = content.replace("ctx.strokeStyle", "wbCtx.strokeStyle")
content = content.replace("ctx.lineWidth", "wbCtx.lineWidth")
content = content.replace("ctx.lineCap", "wbCtx.lineCap")
content = content.replace("ctx.stroke", "wbCtx.stroke")
content = content.replace("ctx.closePath", "wbCtx.closePath")
content = content.replace("ctx = wbCanvas.getContext('2d');", "wbCtx = wbCanvas.getContext('2d');")
content = content.replace("if (ctx)", "if (wbCtx)")

with open('app.js', 'w') as f:
    f.write(content)
