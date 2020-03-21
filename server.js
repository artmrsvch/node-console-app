const interval = process.env.interval
const end = process.env.end
const http = require('http')
const port = 3000

const requestHandler = (req, res) => {
    if (req.method === "GET") {
        const timeID = setInterval(() => {
            console.log(convertDateToUTC(new Date))
        }, interval)
        setTimeout(() => {
            clearInterval(timeID)
            res.end(`${convertDateToUTC(new Date)}`);
        }, end)
    }
}
const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()) }