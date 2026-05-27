import re

with open('app.js', 'r') as f:
    content = f.read()

# Add selectedNodes state
content = re.sub(
    r'(const incomingTransfers = \{\};)',
    r'\1\nlet selectedNodes = new Set();',
    content
)

# Update moveNode signature and usage
move_node_old = """function moveNode(nodeId, targetFolderId) {
    const node = vfs.findNode(nodeId);
    const target = vfs.findNode(targetFolderId);
    
    if (!node || !target || target.type !== 'folder') return;
    
    // Prevent moving into itself or its descendants
    let curr = target;
    while(curr) {
        if(curr.id === node.id) return;
        curr = curr.parent;
    }
    
    // Remove from old parent
    if (node.parent) {
        node.parent.children = node.parent.children.filter(c => c.id !== node.id);
    }
    
    // Add to new parent
    saveVFSToDB();
    node.parent = target;
    target.children.push(node);
    
    renderHostExplorer();
    broadcastTree();
}"""
move_node_new = """function moveNode(nodeId, targetFolderId, autoRender = true) {
    const node = vfs.findNode(nodeId);
    const target = vfs.findNode(targetFolderId);
    
    if (!node || !target || target.type !== 'folder') return false;
    
    let curr = target;
    while(curr) {
        if(curr.id === node.id) return false;
        curr = curr.parent;
    }
    
    if (node.parent) {
        node.parent.children = node.parent.children.filter(c => c.id !== node.id);
    }
    
    node.parent = target;
    target.children.push(node);
    
    if (autoRender) {
        saveVFSToDB();
        renderHostExplorer();
        broadcastTree();
    }
    return true;
}"""
content = content.replace(move_node_old, move_node_new)

# Update renderHostExplorer dragstart and click handling
render_old = """        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', child.id);
            e.dataTransfer.effectAllowed = 'move';
        });"""

render_new = """        if (selectedNodes.has(child.id)) item.classList.add('selected');
        
        item.addEventListener('click', (e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey) {
                if (selectedNodes.has(child.id)) {
                    selectedNodes.delete(child.id);
                    item.classList.remove('selected');
                } else {
                    selectedNodes.add(child.id);
                    item.classList.add('selected');
                }
            } else {
                selectedNodes.clear();
                document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
            }
        });
        
        item.addEventListener('dragstart', (e) => {
            if (!selectedNodes.has(child.id)) {
                selectedNodes.clear();
                document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
                selectedNodes.add(child.id);
                item.classList.add('selected');
            }
            e.dataTransfer.setData('application/json', JSON.stringify(Array.from(selectedNodes)));
            e.dataTransfer.effectAllowed = 'move';
        });"""
content = content.replace(render_old, render_new)

# Update dragover drop handling for folders
drop_old = """            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.borderColor = 'transparent';
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId && draggedId !== child.id) {
                    moveNode(draggedId, child.id);
                }
            });"""

drop_new = """            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.borderColor = 'transparent';
                try {
                    const ids = JSON.parse(e.dataTransfer.getData('application/json'));
                    let moved = false;
                    ids.forEach(id => {
                        if (id !== child.id && moveNode(id, child.id, false)) moved = true;
                    });
                    if (moved) {
                        selectedNodes.clear();
                        saveVFSToDB();
                        renderHostExplorer();
                        broadcastTree();
                    }
                } catch(err) {
                    // Fallback
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId && draggedId !== child.id) moveNode(draggedId, child.id);
                }
            });"""
content = content.replace(drop_old, drop_new)

# Same for Breadcrumbs drop
crumb_drop_old = """        crumb.addEventListener('drop', (e) => {
            e.preventDefault();
            crumb.style.color = '';
            crumb.style.textShadow = '';
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId && draggedId !== node.id) {
                moveNode(draggedId, node.id);
            }
        });"""
crumb_drop_new = """        crumb.addEventListener('drop', (e) => {
            e.preventDefault();
            crumb.style.color = '';
            crumb.style.textShadow = '';
            try {
                const ids = JSON.parse(e.dataTransfer.getData('application/json'));
                let moved = false;
                ids.forEach(id => {
                    if (id !== node.id && moveNode(id, node.id, false)) moved = true;
                });
                if (moved) {
                    selectedNodes.clear();
                    saveVFSToDB();
                    renderHostExplorer();
                    broadcastTree();
                }
            } catch(err) {
                const draggedId = e.dataTransfer.getData('text/plain');
                if (draggedId && draggedId !== node.id) moveNode(draggedId, node.id);
            }
        });"""
content = content.replace(crumb_drop_old, crumb_drop_new)

# Add clear selection on empty area click
clear_selection = """    hostExplorerGrid.addEventListener('click', (e) => {
        if (e.target === hostExplorerGrid) {
            selectedNodes.clear();
            document.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
        }
    });"""
content = content.replace("renderHostExplorer();\n}", "renderHostExplorer();\n" + clear_selection + "\n}")

with open('app.js', 'w') as f:
    f.write(content)
