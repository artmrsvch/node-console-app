const fs = require("fs");
const yargs = require("yargs");
const path = require("path");
const Events = require("events");
const basicPaths = {
    source: null,
    dist: null
};
const argv = yargs
    .usage("Usage: $0 [option]")
    .help("help")
    .alias("help", "h")
    .version("0.0.1")
    .alias("version", "v")
    .example("$0 --entry ./filesSort --output ./dist -D => Sortings folder")
    .option("entry", {
        alias: "e",
        describe: "Путь к читаемой директории",
        demandOption: true
    })
    .option("output", {
        alias: "o",
        describe: "Путь куда сортировать файлы",
        default: "./dist"
    })
    .option("delete", {
        alias: "D",
        type: "boolean",
        describe: "Необходимо удалить исходную директорию после сортировки?",
        default: false
    })
    .epilog("App for week_1").argv;

basicPaths.source = path.normalize(path.join(__dirname, argv.entry));
basicPaths.dist = path.normalize(path.join(__dirname, argv.output));

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
            argv.delete &&
                fs.unlink(currentPath, err => {
                    err && console.log("UNLINK", err);
                    eventEmitter.emit("observeEmptyDir", pathToDir);
                });
        });
    });
};
const contorolLocationFile = (file, currentPath, pathToDir) => {
    const dir = path.join(basicPaths.dist, file[0].toUpperCase());
    if (!fs.existsSync(path.join(basicPaths.dist, `${file[0]}`))) {
        fs.mkdir(dir, err => {
            err && console.log("MKLITER", err);
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
            err && console.log("LSTAT", err);
            if (stats.isDirectory()) {
                fs.readdir(pathToElem, (err, files) => {
                    err && console.log("READFOREACH", err);
                    searchFile(files, pathToElem);
                });
            }
            stats.isFile() && contorolLocationFile(elem, pathToElem, rootPath);
        });
    });
};
argv.output === "./dist" && !fs.existsSync(path.join(__dirname, "dist"))
    ? fs.mkdir(basicPaths.dist, err => err && console.log("MKDIST", err))
    : !fs.existsSync(basicPaths.dist) &&
      fs.mkdir(basicPaths.dist, err => err && console.log("MKNEWOUT", err));

fs.readdir(basicPaths.source, (err, data) => {
    err && console.log("READBASIC", err);
    searchFile(data, basicPaths.source);
});
