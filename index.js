const fs = require("fs");
const yargs = require("yargs");
const util = require("util");
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
const readdir = util.promisify(fs.readdir);
const rmdir = util.promisify(fs.rmdir);
const mkdir = util.promisify(fs.mkdir);
const lstat = util.promisify(fs.lstat);

eventEmitter.on("observeEmptyDir", async dir => {
    try {
        const readEmptyDir = await readdir(dir);
        if (fs.existsSync(dir)) {
            if (!readEmptyDir.length) {
                await rmdir(dir);
                const faterPath = path.parse(dir).dir;
                eventEmitter.emit("observeEmptyDir", faterPath);
            }
        }
    } catch (e) {
        console.log("emit error", e);
    }
});
const moveFile = async (file, dir, currentPath, pathToDir) => {
    const inPath = path.join(dir, file);
    const open = util.promisify(fs.open);
    const copyFile = util.promisify(fs.copyFile);
    const unlink = util.promisify(fs.unlink);
    try {
        if (!fs.existsSync(inPath)) {
            await open(inPath, "w");
            await copyFile(currentPath, inPath);
        }
        argv.delete && (await unlink(currentPath));
        eventEmitter.emit("observeEmptyDir", pathToDir);
    } catch (e) {
        console.log(e);
    }
};
const contorolLocationFile = async (file, currentPath, pathToDir) => {
    try {
        const dir = path.join(basicPaths.dist, file[0].toUpperCase());
        if (!fs.existsSync(path.join(basicPaths.dist, `${file[0]}`))) {
            await mkdir(dir);
            moveFile(file, dir, currentPath, pathToDir);
        } else {
            moveFile(file, dir, currentPath, pathToDir);
        }
    } catch (e) {
        console.log("controlLocate", e);
    }
};
const searchFile = (data, rootPath) => {
    data.forEach(async elem => {
        try {
            const pathToElem = path.join(rootPath, elem);
            const stats = await lstat(pathToElem);
            stats.isDirectory() && readdir(pathToElem).then(files => searchFile(files, pathToElem));
            stats.isFile() && contorolLocationFile(elem, pathToElem, rootPath);
        } catch (e) {
            console.log("each", e);
        }
    });
};

try {
    argv.output === "./dist" && !fs.existsSync(path.join(__dirname, "dist"))
        ? mkdir(basicPaths.dist)
        : !fs.existsSync(basicPaths.dist) && mkdir(basicPaths.dist);
    readdir(basicPaths.source).then(data => searchFile(data, basicPaths.source));
} catch (e) {
    console.log(e);
}
