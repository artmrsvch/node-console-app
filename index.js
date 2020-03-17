const fs = require("fs");
const path = require("path");
const Events = require("events");

const { outputPath, inputPath } = {
    outputPath: path.join(__dirname, "src"),
    inputPath: path.join(__dirname, "dist")
};
const eventEmitter = new Events();

eventEmitter.on("observeEmptyDir", dir => {
    fs.readdir(dir, (err, data) => {
        err && console.log("READEMIT", err);
        if (fs.existsSync(dir)) {
            if (!data.length) {
                fs.rmdir(dir, err => {
                    err && console.log("RMDIR", err);
                    const faterPath = path.parse(dir).dir;
                    eventEmitter.emit("observeEmptyDir", faterPath);
                });
            }
        }
    });
});
const moveFile = (file, dir, currentPath, pathToDir) => {
    const inPath = path.join(dir, file);
    fs.open(inPath, "w", err => {
        err && console.log("OPEN", err);
        fs.copyFile(currentPath, inPath, err => {
            err && console.log("COPY", err);
            fs.unlink(currentPath, err => {
                err && console.log("UNLINK", err);
                eventEmitter.emit("observeEmptyDir", pathToDir);
            });
        });
    });
};
const contorolLocationFile = (file, currentPath, pathToDir) => {
    const dir = path.join(inputPath, file[0].toUpperCase());
    if (!fs.existsSync(path.join(inputPath, `${file[0]}`))) {
        fs.mkdir(dir, err => {
            err && console.log(err);
            moveFile(file, dir, currentPath, pathToDir);
        });
    } else {
        moveFile(file, dir, currentPath, pathToDir);
    }
};
const searchFile = (data, rootPath) => {
    data.forEach(elem => {
        const pathToElem = path.join(rootPath, elem);
        fs.lstat(pathToElem, (err, stats) => {
            err && console.log(err);
            if (stats.isDirectory()) {
                fs.readdir(pathToElem, (err, files) => {
                    err && console.log(err);
                    searchFile(files, pathToElem);
                });
            }
            stats.isFile() && contorolLocationFile(elem, pathToElem, rootPath);
        });
    });
};
fs.readdir(outputPath, (err, data) => {
    err && console.log(err);
    fs.mkdir(inputPath, err => {
        err && console.log(err);
        searchFile(data, outputPath);
    });
});
