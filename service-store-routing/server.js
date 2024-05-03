const { Kafka } = require("kafkajs")
const mongoose = require("mongoose")

const kafka = new Kafka({
    clientId: "service-store-routing",
    brokers: ["localhost:29092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-store-routing" });

// Boolean value to save the running state of the solver
let isRunning = false;

const main = async () => {

    await mongoose.connect("mongodb://user:pass@localhost:27018/Submissions?authSource=admin");

    const SubmissionSchema = new mongoose.Schema({
        submission_name: String,
        email: String,
        input_data: Object,
        max_secs: Number,
        creation_date: Date,
        update_date: Date,
        execution_date: Date,
        execution_secs: Number,
        output_data: Object
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
            // The above topics are TO DO 
            "execution-routing-request", // for when requested to execute a submission from adapter
            "solver-routing-response" // for updating results after execution
        ],
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message, topic }) => {

            if (topic == "solver-routing-response") {
                const data = JSON.parse(message.value.toString());
                // set running state of solver to false
                isRunning = false;
                
                await Submission.findOneAndUpdate(
                    { email: data.email, submission_name: data.submission_name },
                    {
                        execution_date: data.execution_date,
                        execution_secs: data.execution_secs,
                        output_data: data.output_data,
                    }
                );
            }

            else if (topic == "execution-routing-request") {
                const email = message.key.toString();
                const submission_name = message.value.toString()

                const submission = await Submission.findOne({ email: email, submission_name: submission_name });
                
                // send input data to solver model to execute submission
                producer.send({
                    topic: "solver-routing-request",
                    messages: [
                        { value: JSON.stringify(submission) }
                    ]
                })
                isRunning = true;
            }

            else if (topic === "create-submission-routing-request") {    
                const data = JSON.parse(message.value.toString());

                try {
                    // Delete all submissions matching email and submission_name
                    const deleteResult = await Submission.deleteMany({
                        email: data.email,
                        submission_name: data.submission_name
                    });
                    console.log("Number of documents deleted:", deleteResult.deletedCount);
                } catch (error) {
                    console.error("Error deleting submissions:", error);
                }

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
    console.log("Service store-routing is running");

};


main();