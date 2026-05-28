import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Fix getTree in VFS class
old_getTree = """    getTree(dir = this.root) {
        return {
            id: dir.id,
            name: dir.name,
            type: dir.type,
            children: dir.children.map(c => c.type === 'folder' ? this.getTree(c) : { id: c.id, name: c.name, type: 'file', size: c.size, mime: c.mime })
        };
    }"""

new_getTree = """    getTree(unlockedSet = new Set()) {
        function clone(node) {
            const n = { id: node.id, type: node.type, name: node.name, size: node.size, mime: node.mime, isLocked: !!node.password };
            if (node.children) {
                if (node.password && !unlockedSet.has(node.id)) {
                    n.children = []; // Hide contents
                } else {
                    n.children = node.children.map(clone);
                }
            }
            return n;
        }
        return clone(this.root);
    }"""
content = content.replace(old_getTree, new_getTree)

# 2. Fix conn.send({ type: 'TREE', tree: vfs.getTree() }) to pass conn.unlockedFolders
content = re.sub(r"conn\.send\(\{\s*type:\s*'TREE',\s*tree:\s*vfs\.getTree\(\)\s*\}\);", "conn.send({ type: 'TREE', tree: vfs.getTree(conn.unlockedFolders || new Set()) });", content)

with open('app.js', 'w') as f:
    f.write(content)
