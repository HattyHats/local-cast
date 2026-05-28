import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Initialize conn.unlockedFolders
content = content.replace("conn.isAuthenticated = !hostPassword;", "conn.isAuthenticated = !hostPassword;\n        conn.unlockedFolders = new Set();")

# 2. Add autoEnterFolderId logic
content = content.replace("let activeAuthFolderId = null;", "let activeAuthFolderId = null;\nlet autoEnterFolderId = null;")

# 3. On FOLDER_AUTH_SUCCESS, set autoEnterFolderId
old_auth_success = "} else if (data.type === 'FOLDER_AUTH_SUCCESS') {\n                folderPasswordModal.classList.add('hidden');"
new_auth_success = "} else if (data.type === 'FOLDER_AUTH_SUCCESS') {\n                folderPasswordModal.classList.add('hidden');\n                autoEnterFolderId = activeAuthFolderId;"
content = content.replace(old_auth_success, new_auth_success)

# 4. On TREE receive, auto enter if needed
old_tree_receive = """            if (data.type === 'TREE') {
                clientVFS = data.tree;
                if (clientCurrentDir.id === 'root') clientCurrentDir = clientVFS;
                else {
                    function find(n, id) {
                        if (n.id === id) return n;
                        if (n.children) {
                            for (let c of n.children) {
                                const f = find(c, id);
                                if (f) return f;
                            }
                        }
                        return null;
                    }
                    const updated = find(clientVFS, clientCurrentDir.id);
                    if (updated) clientCurrentDir = updated;
                    else clientCurrentDir = clientVFS;
                }
                renderClientExplorer();
            }"""

new_tree_receive = """            if (data.type === 'TREE') {
                clientVFS = data.tree;
                
                function find(n, id) {
                    if (n.id === id) return n;
                    if (n.children) {
                        for (let c of n.children) {
                            const f = find(c, id);
                            if (f) return f;
                        }
                    }
                    return null;
                }
                
                if (autoEnterFolderId) {
                    const toEnter = find(clientVFS, autoEnterFolderId);
                    if (toEnter) clientCurrentDir = toEnter;
                    autoEnterFolderId = null;
                } else {
                    if (clientCurrentDir.id === 'root' || clientCurrentDir.id === clientVFS.id) {
                        clientCurrentDir = clientVFS;
                    } else {
                        const updated = find(clientVFS, clientCurrentDir.id);
                        if (updated) clientCurrentDir = updated;
                        else clientCurrentDir = clientVFS;
                    }
                }
                
                renderClientExplorer();
            }"""
content = content.replace(old_tree_receive, new_tree_receive)

with open('app.js', 'w') as f:
    f.write(content)
