const { Kafka } = require("kafkajs")
const mongoose = require("mongoose")

const kafka = new Kafka({
    clientId: "service-user-data",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-user-data" });


const main = async () => {

    await mongoose.connect("mongodb://user:pass@mongodb-user-data:27017/Users?authSource=admin");

    const userSchema = new mongoose.Schema({
        email: String,
        name: String,
        credits: Number
    })

    const User = mongoose.model("User", userSchema)

    await producer.connect()
    await consumer.connect()

    await consumer.subscribe({
        topics: [
            "user-create-request",
            "user-credits-update-request",
            "user-get-request",
        ],
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message, topic }) => {

            if (topic === "user-create-request") {    
                const email = message.key.toString();
                const name = message.value.toString();

                const newUser = new User({
                    email: email,
                    name: name,
                    credits: 0
                });
                
                await newUser.save();
            }

            else if (topic === "user-credits-update-request") {
                const email = message.key.toString();
                const added_credits = Number(message.value.toString());

                await User.findOneAndUpdate(
                    { email: email},
                    { $inc: { credits: added_credits }}
                );
            }

            else if (topic == "user-get-request") {
                const email = message.value.toString();
                const user = await User.findOne({ email: email });

                producer.send({
                    topic: "user-get-response",
                    messages: [
                        { key: email, value: JSON.stringify(user) }
                    ]
                });
            }
        }
    });
    console.log("Service user-data is running");

};


main();