import * as AWS from 'aws-sdk'

import createAppServer from './lib/app-server'
import createHealthServer from './lib/health-server'

const APP_PORT = parseInt(process.env.PORT || '3000', 10)
const HEALTH_PORT = parseInt(process.env.PORT || '3001', 10)

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const AWS_S3_SOURCE_BUCKET = process.env.AWS_S3_SOURCE_BUCKET || 'com.largelab.imageset'

/* Get image from S3 as a stream */
const getImageStream = function (source: string) {
    const s3 = new AWS.S3()

    return s3.getObject({
        Bucket: AWS_S3_SOURCE_BUCKET,
        Key: source
    }).createReadStream()
}

const appServer = createAppServer({getImageStream})
const healthServer = createHealthServer()

AWS.config.update({region: AWS_REGION})


appServer.listen(APP_PORT, () => console.log('App server listening on port ', APP_PORT))

healthServer.listen(HEALTH_PORT, () => console.log('Health server listening on port ', HEALTH_PORT))
