const { Kafka } = require("kafkajs");
const express = require("express");

const app = express();

const kafka = new Kafka({
    clientId: "service-user-data-adapter",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-user-data-adapter" });

// For storing users got from kafka topic
const users = {};

const main = async () => {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({
        topics: [
            "user-get-response"
        ],
        fromBeginning: true
    });
    
    // kafka messages handling
    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (topic === "user-get-response") {
                const email = message.key.toString();
                const user = JSON.parse(message.value.toString());
                users[email] = user;
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

    app.get('/user-get/:email', async (req, res) => {
        const email = req.params.email;

        producer.send({
            topic: "user-get-request",
            messages: [
                { value: email }
            ]
        });
        /*
        - A Promise represents the eventual outcome (resolve, reject) of an async operation.
        - In this case we want to asynchroniously wait to receive message in kafka topic,
        so we "resolve" the promise after 1000ms.
        - When received user from kafka topic, I can continue
        */
        const MAX_TRIES = 5;

        for (let tries = 0; tries < MAX_TRIES; tries++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (users[email] !== undefined) {
            break; // Exit loop if user data is found
          }
        }

        send_data = users[email];
        // Forget user, so next time will be surely updated before res.send
        users[email] = undefined;
        // If user is null, it means that he is not in the User database
        res.send(send_data === null ? {} : send_data);
    });

    app.post('/user-create', (req, res) => {
        producer.send({
            topic: "user-create-request",
            messages: [
                { 
                    key: req.body.email, 
                    value: req.body.name 
                }
            ]
        });

        res.sendStatus(200);
    });

    app.post('/user-credits-update', (req, res) => {
        producer.send({
            topic: "user-credits-update-request",
            messages: [
                {
                    key: req.body.email,
                    value: req.body.credits.toString()
                }
            ]
        });
      
        res.sendStatus(200);     
    });

    app.listen(4010, () => {
		console.log("Service user-data-adapter is running");
	});
}

main();