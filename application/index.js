"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const app_server_1 = require("./lib/app-server");
const health_server_1 = require("./lib/health-server");
const APP_PORT = parseInt(process.env.PORT || '3000', 10);
const HEALTH_PORT = parseInt(process.env.PORT || '3001', 10);
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_SOURCE_BUCKET = process.env.AWS_S3_SOURCE_BUCKET || 'com.largelab.imageset';
/* Get image from S3 as a stream */
const getImageStream = function (source) {
    const s3 = new AWS.S3();
    return s3.getObject({
        Bucket: AWS_S3_SOURCE_BUCKET,
        Key: source
    }).createReadStream();
};
const appServer = app_server_1.default({ getImageStream });
const healthServer = health_server_1.default();
AWS.config.update({ region: AWS_REGION });
appServer.listen(APP_PORT, () => console.log('App server listening on port ', APP_PORT));
healthServer.listen(HEALTH_PORT, () => console.log('Health server listening on port ', HEALTH_PORT));
