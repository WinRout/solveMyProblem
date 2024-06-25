const { Kafka } = require("kafkajs")
const mongoose = require("mongoose")

const kafka = new Kafka({
    clientId: "service-user-submissions",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-user-submissions" });


const main = async () => {

    await mongoose.connect("mongodb://user:pass@mongodb-user-submissions:27017/UserSubmissions?authSource=admin");

    const UserSubmissionSchema = new mongoose.Schema({
        submission_name: String,
        email: String,
        state: String
    })

    const UserSubmission = mongoose.model("UserSubmission", UserSubmissionSchema)

    await producer.connect()
    await consumer.connect()

    await consumer.subscribe({
        topics: [
            "create-submission-request", // subscribe to create a User Submission
            "execution-request", // subscribe to update state to 'In Queue'
            "solver-execution-start", // subscribe to update state to 'Running'
            "solvers-general-response", // subscribe to update state to 'Executed'
            "get-user-submissions-request", // for the User's Submissions' list screen
            "get-all-submissions-request", // for the Admin's Submissions' list screen
        ],
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message, topic }) => {

            if (topic == "create-submission-request") {
                const data = JSON.parse(message.value.toString());
                const metadata = data.metadata

                try {
                    // Delete all submissions matching email and submission_name
                    const deleteResult = await UserSubmission.deleteMany({
                        submission_name: metadata.submission_name,
                        email: metadata.email,
                    });
                    console.log("Number of documents deleted:", deleteResult.deletedCount);
                } catch (error) {
                    console.error("Error deleting submissions:", error);
                }
                const newUserSubmission = new UserSubmission({
                    submission_name: metadata.submission_name,
                    email: metadata.email,
                    state: "Draft"
                });
                
                await newUserSubmission.save();
            }

            else if (topic == "execution-request") {
                const email = message.key.toString();
                const submission_name = message.value.toString()

                await UserSubmission.findOneAndUpdate(
                    { email: email, submission_name: submission_name },
                    {
                        state: "In Queue"
                    }
                );
            }

            else if (topic == "solver-execution-start") {
                const data = JSON.parse(message.value.toString())

                await UserSubmission.findOneAndUpdate(
                    { email: data.email, submission_name: data.submission_name },
                    {
                        state: "Running"
                    }
                );
            }

            else if (topic == "solvers-general-response") {
                const data = JSON.parse(message.value.toString())

                await UserSubmission.findOneAndUpdate(
                    { email: data.email, submission_name: data.submission_name },
                    {
                        state: "Executed"
                    }
                );
            }

            else if (topic == "get-user-submissions-request") {
                const email = message.value.toString();
                const user_submissions = await UserSubmission.find({ email: email });
                producer.send({
                    topic: "get-user-submissions-response",
                    messages: [
                        { key: email, value: JSON.stringify({'email':email, 'submissions':user_submissions}) }
                    ]
                })
            }

            else if (topic == "get-all-submissions-request") {
                const user_submissions = await UserSubmission.find({});
                producer.send({
                    topic: "get-all-submissions-response",
                    messages: [
                        { value: JSON.stringify({'submissions':user_submissions}) }
                    ]
                })
            }
        }});
    console.log("Service user-submissions is running")
};

main();