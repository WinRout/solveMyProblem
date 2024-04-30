const { Kafka } = require("kafkajs")
const mongoose = require("mongoose")

const kafka = new Kafka({
    clientId: "service-store-routing",
    brokers: ["localhost:29092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-store-routing" });


const main = async () => {

    await mongoose.connect("mongodb://user:pass@localhost:27018/Submissions?authSource=admin");

    const SubmissionSchema = new mongoose.Schema({
        submission_name: String,
        email: String,
        input_data: String,
        max_secs: Number,
        creation_date: Date,
        update_date: Date,
        execution_date: Date,
        execution_secs: Number,
        output_data: String
    })

    const Submission = mongoose.model("Submission", SubmissionSchema)

    await producer.connect()
    await consumer.connect()

    await consumer.subscribe({
        topics: [
            "create-submission-routing-request", // create a submission
            "update-submission-routing-request", // update a sumbission
            "get-submission-routing-request", // for the View/Edit submission screen 
            // The below topics are TO DO
            "get-user-submissions-request", // for the User's Submissions' list screen
            "get-all-submissions-request", // for the Admin's Submissions' list screen
            "results-submissions-routing-notification" // for updating results after execution
        ],
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message, topic }) => {

            if (topic === "create-submission-routing-request") {    
                const data = JSON.parse(message.value.toString());

                const newSubmission = new Submission({
                    submission_name: data.submission_name,
                    email: data.email,
                    input_data: data.input_data,
                    max_secs: data.max_secs,
                    // the below do not require data from message
                    creation_date: new Date().toISOString(),
                    update_date: new Date().toISOString(),
                    // the below fields will be updated after execution
                    execution_date: null,
                    execution_secs: null,
                    output_data: null,
                });
                
                await newSubmission.save();
            }

            else if (topic === "update-submission-routing-request") {
                const data = JSON.parse(message.value.toString());

                await Submission.findOneAndUpdate(
                    { email: data.email, submission_name: data.submission_name },
                    {
                        input_data: data.input_data,
                        max_secs: data.max_secs,
                        update_date: new Date().toISOString()
                    }
                );
            }

            else if (topic == "get-submission-routing-request") {
                const email = message.key.toString();
                const submission_name = message.value.toString();
                const submission = await Submission.findOne({ email: email, submission_name: submission_name });

                producer.send({
                    topic: "get-submission-routing-response",
                    messages: [
                        { key: email, value: JSON.stringify(submission) }
                    ]
                });
            }
        }
    });
    console.log("Service user-store-routing is running");

};


main();