const { Kafka } = require("kafkajs")
const mongoose = require("mongoose")

const kafka = new Kafka({
    clientId: "service-submissions",
    brokers: ["kafka-broker:9092"],
    retries: 10,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "service-submissions" });

const main = async () => {

    await mongoose.connect("mongodb://user:pass@mongodb-submissions:27017/Submissions?authSource=admin");

    const SubmissionSchema = new mongoose.Schema({
        submission_name: String,
        email: String,
        code: Object,
        input_data: Object,
        creation_date: Date,
        update_date: Date,
        execution_date: Date,
        execution_secs: Number,
        output_data: Object,
        error: String
    })

    const Submission = mongoose.model("Submission", SubmissionSchema)

    await producer.connect()
    await consumer.connect()

    await consumer.subscribe({
        topics: [
            "create-submission-request", // create a submission
            "update-submission-request", // update a sumbission
            "delete-submission-request", // delete a sumbission
            "get-submission-request", // for the View/Edit submission screen 
            "execution-request-accepted", // for when requested to execute a submission from adapter
            "solver-response" // for updating results after execution
        ],
        fromBeginning: false
    })

    await consumer.run({
        eachMessage: async ({ message, topic }) => {

            if (topic == "solver-response") {
                const data = JSON.parse(message.value.toString());
                // set running state of solver to false
                
                await Submission.findOneAndUpdate(
                    { email: data.email, submission_name: data.submission_name },
                    {
                        execution_date: data.execution_date,
                        execution_secs: data.execution_secs,
                        output_data: data.output_data,
                        error: data.error
                    }
                );
            }

            else if (topic == "execution-request-accepted") {
                const email = message.key.toString();
                const submission_name = message.value.toString()

                const submission = await Submission.findOne({ email: email, submission_name: submission_name });
                
                // send input data to solver model to execute submission
                producer.send({
                    topic: "solver-request",
                    messages: [
                        { value: JSON.stringify(submission) }
                    ]
                })
            }

            else if (topic === "create-submission-request") {    
                const data = JSON.parse(message.value.toString());

                const code = data.code
                const input_data =  data.input_data
                const metadata = data.metadata

                try {
                    // Delete all submissions matching email and submission_name
                    const deleteResult = await Submission.deleteMany({
                        email: metadata.email,
                        submission_name: metadata.submission_name
                    });
                    console.log("Number of documents deleted:", deleteResult.deletedCount);
                } catch (error) {
                    console.error("Error deleting submissions:", error);
                }

                const newSubmission = new Submission({
                    submission_name: metadata.submission_name,
                    email: metadata.email,
                    code: code,
                    input_data: input_data,
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

            else if (topic === "update-submission-request") {
                const data = JSON.parse(message.value.toString());

                await Submission.findOneAndUpdate(
                    { email: data.email, submission_name: data.submission_name },
                    {
                        code: data.code,
                        input_data: data.input_data,
                        update_date: new Date().toISOString()
                    }
                );
            }

            else if (topic === "delete-submission-request") {
                const data = JSON.parse(message.value.toString());

                await Submission.findOneAndDelete(
                    { email: data.email, submission_name: data.submission_name },
                );
            }

            else if (topic == "get-submission-request") {
                const email = message.key.toString();
                const submission_name = message.value.toString();
                const submission = await Submission.findOne({ email: email, submission_name: submission_name });

                producer.send({
                    topic: "get-submission-response",
                    messages: [
                        { key: email, value: JSON.stringify(submission) }
                    ]
                });
            }
        }
    });
    console.log("Service submissions is running");

};


main();