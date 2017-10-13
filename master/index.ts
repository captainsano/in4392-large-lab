import * as AWS from 'aws-sdk'
import * as express from 'express'
import * as R from 'ramda'

const MANAGEMENT_PORT = parseInt(process.env.PORT || '3000', 10)
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

const managementServer = express()

AWS.config.update({region: AWS_REGION})

const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

const WEB_SERVER_TAG_KEY = 'process'
const WEB_SERVER_TAG_VALUE = 'imagemagick'

managementServer.get('/setup', (req, res) => {
    const params = {
        ImageId: 'ami-cd0f5cb6', // ubuntu-16.04-xenial-64bit
        InstanceType: 't2.nano',
        MinCount: 1,
        MaxCount: 1,
        TagSpecifications: [{
            ResourceType: 'instance',
            Tags: [{Key: WEB_SERVER_TAG_KEY, Value: WEB_SERVER_TAG_VALUE}]
        }]
    };

    ec2.runInstances(params, (err, data) => {
        if (err) {
            console.log('Got rejected: ', err)
            res.status(500)
        } else {
            console.log('---> Running instance: ', data)
            res.status(200).end()
        }
    })
})

/* {SB}: Didn't use promises because I keep getting some type errors */
managementServer.get('/teardown', (req, res) => {
    ec2.describeInstances({
        Filters: [{
            Name: `tag:${WEB_SERVER_TAG_KEY}`,
            Values: [WEB_SERVER_TAG_VALUE]
        }]
    }, (describeErr, {Reservations}) => {
        if (describeErr) {
            res.status(500).end()
        } else {
            const InstanceIds = R.compose(
                R.map(R.prop('InstanceId')),
                R.flatten,
                R.map(R.prop('Instances'))
            )(Reservations || []) as [string]

            if (InstanceIds.length > 0) {
                ec2.terminateInstances({InstanceIds}, (err, data) => {
                    if (err) {
                        res.status(500).end()
                    } else {
                        console.log('---- Terminating Instances ---')
                        console.log(data)
                        res.status(200).end()
                    }
                })
            } else {
                res.status(200).end()
            }
        }
    })
})

managementServer.listen(MANAGEMENT_PORT, () => console.log('Management server listening on port ', MANAGEMENT_PORT))
