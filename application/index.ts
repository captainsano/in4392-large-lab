import createAppServer from './lib/app-server'
import createHealthServer from "./lib/health-server";

const APP_PORT = parseInt(process.env.PORT || '3000', 10)
const HEALTH_PORT = parseInt(process.env.PORT || '3001', 10)

const appServer = createAppServer()
const healthServer = createHealthServer()

appServer.listen(APP_PORT, () => console.log('App server listening on port ', APP_PORT))

healthServer.listen(HEALTH_PORT, () => console.log('Health server listening on port ', HEALTH_PORT))
