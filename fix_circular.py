import re

with open('app.js', 'r') as f:
    content = f.read()

save_func_old = 'async function saveVFSToDB() { if(isHost) await localforage.setItem("vfs_root", vfs.root); }'
save_func_new = """async function saveVFSToDB() {
    if(!isHost) return;
    function stripParents(node) {
        return {
            id: node.id,
            name: node.name,
            type: node.type,
            size: node.size,
            mime: node.mime,
            fileObj: node.fileObj,
            children: node.children ? node.children.map(stripParents) : []
        };
    }
    await localforage.setItem("vfs_root", stripParents(vfs.root));
}"""
content = content.replace(save_func_old, save_func_new)

load_logic_old = """const savedRoot = await localforage.getItem("vfs_root");
    if (savedRoot) { vfs.root = savedRoot; vfs.currentDir = vfs.root; }"""
load_logic_new = """const savedRoot = await localforage.getItem("vfs_root");
    if (savedRoot) {
        function linkParents(node, parent) {
            node.parent = parent;
            if (node.children) node.children.forEach(c => linkParents(c, node));
        }
        linkParents(savedRoot, null);
        vfs.root = savedRoot;
        vfs.currentDir = vfs.root;
    }"""
content = content.replace(load_logic_old, load_logic_new)

with open('app.js', 'w') as f:
    f.write(content)

print("Fixed circular references")
