let named = require('named');
let ttl = 300;
let redis = require('redis')
let boxes = {}
let redisClient = redis.createClient()
let express = require('express')
let dnsServer = named.createServer();
let bodyParser = require('body-parser')

let listen = process.env.LISTEN_IP || '127.0.0.1'

dnsServer.listen(53, listen, () => {
    console.log('DNS server started on port 53');
})

redisClient.hgetall('peers', (err, peers) => {
    if (err) {
        throw new Error('Could not query peers')
        process.exit(1)
    }

    if (peers) {
        boxes = peers
    }
})

dnsServer.on('query', (query) => {
    let domain = query.name()

    if (boxes.hasOwnProperty(domain)) {
        let target = new named.ARecord(boxes[domain], {})
        query.addAnswer(domain, target, ttl)
        console.log(`DNS Query for domain: "${domain}" resolved to: "${boxes[domain]}".`)
    }

    dnsServer.send(query)
})

let app = express()

app.use(bodyParser.json())

app.post('/box_update', (req, res) => {
    console.log(req.body.ip, req.body.serial)
    redisClient.hset('peers', req.body.serial, req.body.ip, (err) => {
        if (err) {
            console.log('Error inserting data on database')
            return res.send('err')
        }

        boxes[req.body.serial] = req.body.ip

        console.log(`New record for domain "${req.body.serial}": "${req.body.ip}"`)

        res.send('ok')
    })
})

app.get('/dns/centrals', (req, res) => {
    res.send(boxes)
})

app.listen(1337)
