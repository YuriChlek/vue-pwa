const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const rimraf = require('rimraf');

const baseThemeDir = 'app';
const sourceDir = path.join(__dirname, 'src', baseThemeDir);
const targetDir = path.join(__dirname, 'src', 'generated');
const themesDir = path.join(__dirname, 'src', 'theme');
const chokibarWatchDirs = ['./src/app', './src/theme'];

let themes = [];
let themesDirs = [sourceDir];
let directoryNames = []

if (fs.existsSync(targetDir)) {
    fsExtra.remove(targetDir, (err) => {
        if (err) {
            ForceRemoving(err.path)
            return;
        }
        console.log('Removing starting direction success.');
    });
}

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.readdir(themesDir, { withFileTypes: true }, (err, files) => {
    if (err) {
        console.error('An error occurred while retrieving the list of directory items:', err);
        return;
    }

    const directories = files.filter(file => file.isDirectory());
    directoryNames = directories.map(directory => directory.name);

    directoryNames.map(item => {
        themes.push(require(themesDir + '\\' + item + '\\registration.js'))
    })

    themes = [...topologicalSort(themes)]

    let dirs = themes.map(item => {
         return item.dir
    })

    directoryNames = [...dirs]

    dirs = dirs.map(item => {
        return themesDir + '\\' + item
    })

    const result = themesDirs.concat(dirs);

    themesDirs = [...result]

    CopyAllFiles();

    directoryNames = directoryNames.map(item => 'theme\\' + item);

    directoryNames.unshift(baseThemeDir);

    chokidar.watch(chokibarWatchDirs).on('all', (event, path) => {
        if (event === 'change') {
            ApplyFilesChanges(path);
        } else if (event === 'add') {
            CopyAllFiles();
        } else if (event === 'unlink' || event === 'unlinkDir') {
            RemoveFiles(path)
        }
    });
});

const CopyFiles = (path) => {
    let filePath = sourceDir;

    if (path) {
        filePath = path
    }

    try {
        if (!fs.existsSync(sourceDir)) {
            return;
        }

        fsExtra.copySync(filePath, targetDir, {
            filter: filterFunction,
            overwrite: true,
            recursive: true
        })
        //console.log('Files copied successfully.');
    } catch (err) {
        console.error('An error occurred while copying files:', err);
    }
}

const filterFunction = (src) => {
    return !src.endsWith('registration.js')
}

const topologicalSort = (themesData) => {
    const graph = {};
    const result = [];
    const visited = {};
    let data = themesData.filter(item => item.enable);

    data.forEach(item => {
        if (!graph[item.theme]) {
            graph[item.theme] = [];
        }
        if (item.parent !== '*') {
            graph[item.parent] = graph[item.parent] || [];
            graph[item.parent].push(item.theme);
        }
    });

    function dfs(node) {
        visited[node] = true;

        if (graph[node]) {
            graph[node].forEach(neighbor => {
                if (!visited[neighbor]) {
                    dfs(neighbor);
                }
            });
        }

        result.unshift(node);
    }

    Object.keys(graph).forEach(node => {
        if (!visited[node]) {
            dfs(node);
        }
    });


    return result.map(theme => data.find(item => item.theme === theme));
}

const ApplyFilesChanges = (filePath) => {
    const changedFilePath = path.join(__dirname, filePath);
    let sourceFilePath = '';
    let themeIndex = null

    directoryNames.map((item, index) => {
        if (changedFilePath.includes('\\' + item + '\\')  && item === directoryNames[directoryNames.length - 1]) {
            sourceFilePath = changedFilePath.replace(item, 'generated');
            CopyChanges(changedFilePath, sourceFilePath);
            themeIndex = index
        }
    })

    if (themeIndex < directoryNames.length) {
        CopyAllFiles();
    }
}

const CopyChanges = (changedFilePath, sourceFilePath) => {
    fs.copyFile(
        changedFilePath,
        sourceFilePath,
        fs.constants.COPYFILE_FICLONE,
        (err) => {
            if (err) {
                console.error('An error occurred while copying files:', err);
            }
        })
}

const CopyAllFiles = () => {
    themesDirs.map(item => {
        CopyFiles(item)
    })
}

const RemoveFiles = (folderPath) => {
    let changedFilePath = !folderPath?.includes(__dirname) ? path.join(__dirname, folderPath) : folderPath;
    let sourceFilePath = '';

    directoryNames.map((item) => {
        if (folderPath.includes('\\' + item + '\\') && item === directoryNames[directoryNames.length - 1]) {
            sourceFilePath = changedFilePath.replace(item, 'generated');

            setTimeout(() => {
                fsExtra.remove(sourceFilePath, (err) => {
                    if (err) {
                        console.error('Deleting error:', err);
                        return;
                    }
                    console.log('Success.');
                });
            }, 1000)
        }
    })
}

const ForceRemoving = (path) => {
    rimraf(path, function (err) {
        if (err) {
            console.error('Error deleting directory:', err);
        }
    });
}
