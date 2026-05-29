import sys

def inject():
    with open('app.js', 'r') as f:
        js = f.read()

    # 1. Global showDeadDrops
    if "let showDeadDrops = false;" not in js:
        js = js.replace("let vfs = new VirtualFileSystem();", "let vfs = new VirtualFileSystem();\nlet showDeadDrops = false;")

    # 2. Modify VFS Node and addFolder
    # Wait, node creation is dynamically adding { name, type, ... }. I'll just rely on `node.isHidden`.

    # 3. Context Menu ctx-deaddrop logic
    ctx_logic = """
const ctxDeaddrop = document.getElementById('ctx-deaddrop');
if (ctxDeaddrop) {
    ctxDeaddrop.addEventListener('click', () => {
        const node = selectedNodes.values().next().value;
        if (node) {
            node.isHidden = !node.isHidden;
            saveVFSToDB();
            renderHostExplorer();
            broadcastTree();
        }
        hideContextMenu();
    });
}
"""
    if "ctxDeaddrop.addEventListener" not in js:
        js = js.replace("ctxRename.addEventListener('click', () => {", ctx_logic + "\nctxRename.addEventListener('click', () => {")

    # 4. Modify broadcastTree to filter hidden nodes
    # We'll recursively strip hidden nodes before sending, UNLESS the connection requested them (but for security, just strip them).
    # Wait, the easiest way to filter is to modify `getTree` in VirtualFileSystem.
    # Currently getTree: `getTree(unlockedFolders) { ... return this.root; }` (Wait, getTree builds a JSON).
    # Let's check how getTree works. I'll replace the definition.

    # 5. Search Bar Konami Code
    search_logic = """
    // Konami code for dead drops
    [hostSearch, document.getElementById('client-search')].forEach(input => {
        if (!input) return;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (input.value.trim().toLowerCase() === '/deaddrop') {
                    showDeadDrops = true;
                    input.value = '';
                    if (isHost) renderHostExplorer();
                    else renderClientExplorer(window.lastTree);
                    
                    // Glitch effect
                    document.body.style.animation = 'glitch-anim 0.2s';
                    setTimeout(() => document.body.style.animation = '', 200);
                }
            }
        });
    });
"""
    if "/deaddrop" not in js:
        js = js.replace("function renderHostExplorer() {", search_logic + "\nfunction renderHostExplorer() {")

    # 6. Render styling
    # In renderHostExplorer: `if (node.isHidden) div.classList.add('dead-drop');`
    # Wait, I need to patch the render logic. I will use a simple replace: `div.className = \`file-item ${node.type}\`;`
    
    render_patch = """div.className = `file-item ${node.type} ${node.isHidden ? 'dead-drop' : ''}`;"""
    js = js.replace("div.className = `file-item ${node.type}`;", render_patch)
    js = js.replace("div.className = `file-item ${item.type}`;", "div.className = `file-item ${item.type} ${item.isHidden ? 'dead-drop' : ''}`;")
    
    # 7. Hide in render if !showDeadDrops
    hide_patch = """
        if (node.isHidden && !showDeadDrops) return;
"""
    hide_patch_client = """
        if (item.isHidden && !showDeadDrops) return;
"""
    if "if (node.isHidden" not in js:
        js = js.replace("node.children.forEach(node => {", "node.children.forEach(node => {\n" + hide_patch)
        js = js.replace("node.children.forEach(item => {", "node.children.forEach(item => {\n" + hide_patch_client)

    # We also need to strip hidden files from the broadcastTree payload so guests can't just parse the raw JSON!
    # Let's modify VirtualFileSystem's `getTree` to do deep copy with filter.
    vfs_patch = """
    getTree(unlockedFolders) {
        function buildNode(node) {
            if (node.isHidden && !showDeadDrops) return null; // Strip hidden files from broadcast unless host activated it globally
            const data = { id: node.id, name: node.name, type: node.type, isLocked: node.isLocked, isHidden: node.isHidden };
            if (node.type === 'folder') {
                if (node.isLocked && !unlockedFolders.has(node.id)) {
                    data.children = [];
                } else {
                    data.children = Array.from(node.children).map(buildNode).filter(n => n !== null);
                }
            } else {
                data.size = node.fileObj ? node.fileObj.size : 0;
            }
            return data;
        }
        return buildNode(this.root);
    }
"""
    # Replace the existing getTree
    # I'll just use regex or split.
    # I know the current getTree looks like:
    # getTree(unlockedFolders) { ... }
    # I'll just write a quick script to find it.

    with open('app.js', 'w') as f:
        f.write(js)
    print("Injected Task 2: Dead Drops mostly, manually patching getTree next.")

if __name__ == '__main__':
    inject()
