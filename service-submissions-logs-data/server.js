const { Kafka } = require("kafkajs")
const mongoose = require("mongoose")

const kafka = new Kafka({
    clientId: "service-submissions-logs-data",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-submissions-logs-data" });


const main = async () => {

    await mongoose.connect("mongodb://user:pass@mongodb-submissions-logs-data:27017/Logs?authSource=admin");

    const LogSchema = new mongoose.Schema({
        email: String,
        execution_date: Date,
        execution_secs: Number,
    })

    const Log = mongoose.model("Log", LogSchema)

    await producer.connect()
    await consumer.connect()

    await consumer.subscribe({
        topics: [
            "solvers-general-response",
            "submissions-logs-get-request"
        ],
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message, topic }) => {

            if (topic == "solvers-general-response") {
                const data = JSON.parse(message.value.toString());
                
                // Create log
                const newLog = new Log({
                    email: data.email,
                    execution_date: data.execution_date,
                    execution_secs: data.execution_secs
                });
                
                await newLog.save();
            }
            else if (topic == "submissions-logs-get-request") {

                const logs = await Log.find({});
                producer.send({
                    topic: "submissions-logs-get-response",
                    messages: [ 
                        { value: JSON.stringify(logs) }
                    ]
                });
            }
        }
    });
    console.log("Service submissions-logs-data is running");

};


main();