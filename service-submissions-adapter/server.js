const { Kafka } = require("kafkajs");
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();

const kafka = new Kafka({
    clientId: "service-submissions-adapter",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-submissions-adapter" });

// For storing submissions got from kafka topic. For each account request (key: email, val: submission)
const single_submission = {};
const user_submissions = {};
let all_submissions = {};

// Multer setup
const storage = multer.memoryStorage();  // Store files in memory
const upload = multer({ storage });


const main = async () => {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({
        topics: [
            "get-submission-response",
            "get-user-submissions-response",
            "get-all-submissions-response"
        ],
        fromBeginning: true
    });





    await consumer.run({
        eachMessage: async ({ topic, message }) => {

            if (topic == "get-submission-response") {
                const email = message.key.toString();
                const submission = message.value.toString();
                single_submission[email] = JSON.parse(submission)
            }

            else if (topic == "get-user-submissions-response") {
                const email = message.key.toString()
                const submissions = message.value.toString();
                user_submissions[email] = JSON.parse(submissions)
            }

            else if (topic == "get-all-submissions-response") {
                const submissions = message.value.toString()
                all_submissions =  JSON.parse(submissions)
            }
        }
    })






    app.use((req, res, next) => {
        // for CORS shake... (:
		res.set({
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type"
		});

		next();
	}, express.json());



    app.get('/submission-get/:email/:submission_name', async (req, res) => {
        const email = req.params.email
        const submission_name = req.params.submission_name

        producer.send({
            topic: `get-submission-request`,
            messages: [
                { key: email, value: submission_name }
            ]
        });
        /*
        - A Promise represents the eventual outcome (resolve, reject) of an async operation.
        - In this case we want to asynchroniously wait to receive message in kafka topic,
        so we "resolve" the promise after 1000ms.
        - When received submission from kafka topic, I can continue
        */
        const MAX_TRIES = 5;

        for (let tries = 0; tries < MAX_TRIES; tries++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (single_submission[email] !== undefined) {
                break;
            }
        }
  
        send_data = single_submission[email]
        single_submission[email] = undefined

        res.send(send_data);
    });



    app.get('/user-submissions-get/:email', async (req, res) => {
        const email = req.params.email

        producer.send({
            topic: `get-user-submissions-request`,
            messages: [
                { value: email }
            ]
        });

        const MAX_TRIES = 5;

        for (let tries = 0; tries < MAX_TRIES; tries++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (user_submissions[email] !== undefined) {
                break;
            }
        }
  
        send_data = user_submissions[email]
        user_submissions[email] = undefined

        res.send(send_data);
    });



    app.get('/all-submissions-get', async (req, res) => {

        producer.send({
            topic: `get-all-submissions-request`,
            messages: [
                { value : 'dummy' }
            ]
        });

        const MAX_TRIES = 3;

        for (let tries = 0; tries < MAX_TRIES; tries++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (all_submissions !== undefined) {
                break;
            }
        }
  
        send_data = all_submissions
        all_submissions = undefined

        res.send(send_data);
    });



    app.post('/submission-create', 
        upload.fields([
            { name: 'pyFile', maxCount: 1 }, 
            { name: 'jsonFile', maxCount: 1 }]), 

        async (req, res) => {
        
        const pyFile = req.files.pyFile[0].buffer.toString('utf-8');
        const jsonFile = req.files.jsonFile[0].buffer.toString('utf-8');
        const metadata = JSON.parse(req.body.metadata);

        const message = {
            code: pyFile,
            input_data: jsonFile,
            metadata: metadata 
        }

        producer.send({
            topic: `create-submission-request`,
            messages: [
                {
                    value: JSON.stringify(message)
                }
            ]
        })
        res.sendStatus(200);
    });



    app.post('/submission-update', (req, res) => {
        producer.send({
            topic: `update-submission-request`,
            messages: [
                {
                    value: JSON.stringify(req.body)
                }
            ]
        })
        res.sendStatus(200);
    });



    app.post('/submission-delete', (req, res) => {
        producer.send({
            topic: `delete-submission-request`,
            messages: [
                {
                    value: JSON.stringify(req.body)
                }
            ]
        })
        res.sendStatus(200);
    });



    app.post('/submission-execute', (req, res) => {
        
        producer.send({
            topic: `execution-request`,
            messages: [
                {
                    key: req.body.email.toString(),
                    value: req.body.submission_name.toString()
                }
            ]
        })

        // Also notify user-data service to decrease credits by execution time
        // const spent_credits = -1 * Math.abs(data.execution_secs);
        // 1 credit spent per submission execution
        const spent_credits = -1
        
        producer.send({
            topic: "user-credits-update-request",
            messages: [ 
                { key: req.body.email.toString(), value: spent_credits.toString()}
            ]
        });
        res.sendStatus(200);
    })



    app.listen(4011, () => {
		console.log("Service submissions-adapter is running");
	});

}

main();