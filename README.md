# Dynamic nameserver

You can entries via a HTTP endpoint.


## Running

1. Run the server as root:

```bash
sudo node server.js
```

2. Add the nameserver to resolv.conf as the primary nameserver

```bash
vim /etc/resolv.conf
```

3. To add new entries, make a POST request with the IP and the "serial" as json body:


```bash
curl -X POST -H 'Content-Type: application/json' -d '{"ip": 172.30.0.4, "serial": "raspberry-pi-123"}'
```

4. Test it:

```bash
ping raspberry-pi-123
```

Should output:

```bash
PING raspberry-pi-123 (172.30.0.4) 56(84) bytes of data.
...
```
