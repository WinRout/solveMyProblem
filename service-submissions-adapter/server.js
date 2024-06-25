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
            "get-all-submissions-response",
            "solvers-general-response"
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
            // else if (topic == "solvers-general-response") {
            //     const data = JSON.parse(message.value.toString());
            //     // Set state of {type} solver to Running
            //     solverRunning[data.solver_type] = false
            // }
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
        so we "resolve" the promise after 500ms.
        - When received submission from kafka topic, I can continue
        */
        while (single_submission[email] === undefined) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        send_data = single_submission[email]
        single_submission[email] = undefined

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
        console.log(message)
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
        res.sendStatus(200);
    })

    app.listen(4011, () => {
		console.log("Service submissions-adapter is running");
	});

}

main();