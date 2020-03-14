const fs = require("fs");
const path = require("path");
const { outputPath, inputPath } = {
    outputPath: path.join(__dirname, "src"),
    inputPath: path.join(__dirname, "dist")
};

const moveFile = (file, dir, currentPath) => {
    const inPath = path.join(dir, file);
    fs.openSync(inPath, "w");
    fs.copyFileSync(currentPath, inPath);
    fs.unlinkSync(currentPath);
};
const contorolLocationFile = (file, currentPath) => {
    const dir = path.join(inputPath, file[0].toUpperCase());
    if (!fs.existsSync(path.join(inputPath, `${file[0]}`))) {
        fs.mkdirSync(dir);
        moveFile(file, dir, currentPath);
    } else {
        moveFile(file, dir, currentPath);
    }
};
const searchFile = (data, pathRoute) => {
    data.forEach(elem => {
        const thatPath = path.join(pathRoute, elem);
        const stat = fs.lstatSync(thatPath);
        stat.isDirectory() && searchFile(fs.readdirSync(thatPath), thatPath);
        stat.isFile() && contorolLocationFile(elem, thatPath);
    });
    fs.rmdirSync(pathRoute);
};

fs.readdir(outputPath, (err, data) => {
    if (err) console.log(err);
    searchFile(data, outputPath);
});
