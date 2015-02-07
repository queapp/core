Environment Variables
===

Name | Desc | Flag | Environment Variable
- | - | - | -
Backend Port | Network port to bind to | `--port` | `PORT`
Proxy Port | The port Que's frontend will be accessed at by the end user (by default, its the same as the Backend Port) | `--backendport` | `BACKENDPORT`
Hostname | Hostname to bind to | `--host` | `HOST`
Mongo URI | The database URI, in mongo format | `--db` | `MONGOURI`
Logging Location | Where to store Que's Logs (by default, its /logs) | `--logto` | `LOGTO`
Reset Que | Delete all users. After deletion, this process cannot be reverted. | `--treatasnew` | `TREATASNEW`
Block Cycle Time | Change the time between block cycles, in milliseconds | `--blockcycle` | `BLOCKCYCLE`
