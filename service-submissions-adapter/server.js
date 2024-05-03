const { Kafka } = require("kafkajs");
const express = require("express");

const app = express();

const kafka = new Kafka({
    clientId: "service-submissions-adapter",
    brokers: ["localhost:29092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-submissions-adapter" });

// For storing submissions got from kafka topic
const single_submission = {};
const user_subissions = {};
const all_submissions = {};
// For storing the state of the solvers (running or not)
const solverRunning = {
    "routing": false,
    "scheduling": false,
    "assignments": false,
    "packing": false
};

const main = async () => {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({
        topics: [
            "get-submission-routing-response",
            "get-user-submissions-response",
            "get-all-submissions-response",
            "solvers-general-response"
        ],
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (topic == "get-submission-routing-response") {
                const email = message.key.toString();
                const submission = message.value.toString();
                single_submission[email] = JSON.parse(submission)
            }
            else if (topic == "solvers-general-response") {
                const data = JSON.parse(message.value.toString());
                // Set state of {type} solver to Running
                solverRunning[data.solver_type] = false
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

    app.get('/submission-get/:type/:email/:submission_name', async (req, res) => {
        const type = req.params.type
        const email = req.params.email
        const submission_name = req.params.submission_name

        producer.send({
            topic: `get-submission-${type}-request`,
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
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.send(single_submission[email]);

        single_submission[email] = undefined
    });

    app.post('/submission-create/:type', (req, res) => {
        producer.send({
            topic: `create-submission-${req.params.type}-request`,
            messages: [
                {
                    value: JSON.stringify(req.body)
                }
            ]
        })
        res.sendStatus(200);
    });

    app.post('/submission-update/:type', (req, res) => {
        producer.send({
            topic: `update-submission-${req.params.type}-request`,
            messages: [
                {
                    value: JSON.stringify(req.body)
                }
            ]
        })
        res.sendStatus(200);
    });

    app.post('/submission-execute/:type', (req, res) => {
        producer.send({
            topic: `execution-${req.params.type}-request`,
            messages: [
                {
                    key: req.body.email.toString(),
                    value: req.body.submission_name.toString()
                }
            ]
        })
        // Set state of {type} solver to Running
        solverRunning[req.params.type] = true

        res.sendStatus(200);
    })

    app.get('/solvers-state/', (req, res) => {
        res.send(solverRunning)
    })

    app.listen(4011, () => {
		console.log("Service submissions-adapter is running");
	});

}

main();