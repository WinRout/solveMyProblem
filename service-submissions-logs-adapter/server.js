const { Kafka } = require("kafkajs");
const express = require("express");

const app = express();

const kafka = new Kafka({
    clientId: "service-submissions-logs-adapter",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-submissions-logs-adapter" });

// a variable for storing responses from kafka
let logs = undefined

const main = async () => {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({
        topics: [
            "submissions-logs-get-response"
        ],
        fromBeginning: true
    });
    
    // kafka messages handling
    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (topic === "submissions-logs-get-response") {
                logs = JSON.parse(message.value.toString());
            }
        }
    });

    // express app (api for frontend) handling
    app.use((req, res, next) => {
        // for CORS shake... (:
		res.set({
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type"
		});

		next();
	}, express.json());

    app.get('/submissions-statistics-get/:email', async (req, res) => {

        producer.send({
            topic: "submissions-logs-get-request",
            messages: [
                { value: req.params.email }
            ]
        });


        const MAX_TRIES = 3;

        for (let tries = 0; tries < MAX_TRIES; tries++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (logs!== undefined) {
                break;
            }
        }
  
        send_data = logs
        logs = undefined

        res.send(send_data);
    });



    app.listen(4012, () => {
		console.log("Service submissions-logs-adapter is running");
	});
}

main();