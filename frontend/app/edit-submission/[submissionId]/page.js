'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";

const EditSubmission = ({ params }) => {
    const submissionId = params.submissionId

    const router = useRouter();
    const { data: session } = useSession();
    const {user} = useUser();
    const [submission, setSubmission] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [code, setCode] = useState('');
    const [inputData, setInputData] = useState('');

    useEffect(() => {
        const fetchData = async () => {
     
        const response = await fetch(`http://localhost:4011/submission-get/${session?.user.email}/${submissionId}`);
        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch submission');
        }

        setSubmission(data);
        setCode(data.code); // Set initial code state
        setInputData(data.input_data); // Set initial inputData state

        };
        fetchData();
    }, [session?.user.email]);

    const handleSave = async () => {
        // Implement logic to update submission on server (e.g., using axios)
        // Replace with your actual update logic
        try {
            const response = await fetch('http://localhost:4011/submission-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "email": session?.user.email,
                    "submission_name": submission.submission_name,
                    "code": code,
                    "input_data": inputData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to execute submission');
            }
        
            console.log('Submission executed successfully!');
        } catch (error) {
          console.error('Error executing submission:', error);
        }

        router.push('/submission-list'); // Redirect back to user submissions page
    };

    const handleCodeUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'text/x-python') {
        setErrorMessage('Invalid file uploaded. Please select a Python file (.py)');
        return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setCode(e.target.result);
        reader.readAsText(file);
    };

    const handleInputDataUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/json') {
        setErrorMessage('Invalid file uploaded. Please select a JSON file (.json)');
        return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setInputData(e.target.result);
        reader.readAsText(file);
    };

    const handleDownloadCode = async () => {
        const blob = new Blob([code], { type: 'text/x-python' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${submission.submission_name}-code.py`;
        link.click();
    };

    const handleDownloadInputData = async () => {
        const blob = new Blob([inputData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${submission.submission_name}-input_data.json`;
        link.click();
    };

    return (
        <div className="container mx-auto px-4 py-8">
          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : submission ? (
            <form onSubmit={(e) => e.preventDefault()}>

            {/* Styled box for submission details */}
            <div className="bg-gray-200 rounded-md p-4 flex justify-between mb-4">
                <div>
                <p className="font-medium">Submission Name:</p>
                <p>{submission.submission_name}</p>
                </div>
                <div>
                <p className="font-medium">Created:</p>
                <p>{new Date(submission.creation_date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
                </div>
                <div>
                <p className="font-medium">Updated:</p>
                <p>{submission.update_date ? new Date(submission.update_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}</p>
                </div>
            </div>
      
          {/* Code editing section */}
          <div className="mb-4">
            <label htmlFor="codeUpload" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 cursor-pointer">
              {code ? 'Change Code' : 'Upload Code'} (.py)
            </label>
            <button
                type="button" // Use button type for download functionality
                onClick={handleDownloadCode}
                className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ml-2"
              >
                Download Code
            </button>
            <input
              type="file"
              id="codeUpload"
              accept=".py"
              onChange={handleCodeUpload}
              style={{ display: 'none' }} // Hide the input element
            />
            <div className="mt-2">
              {code && (  // Conditionally render code content
                <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-64">
                  {code}
                </pre>
              )}

            </div>
          </div>

          {/* Input data editing section (similar logic) */}
          <div className="mb-4">
            <label htmlFor="inputDataUpload" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 cursor-pointer">
              {inputData ? 'Change Input Data' : 'Upload Input Data'} (.json)
            </label>
            <button
                type="button" // Use button type for download functionality
                onClick={handleDownloadInputData}
                className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ml-2"
              >
                Download Input Data
            </button>
            <input
              type="file"
              id="inputDataUpload"
              accept=".json"
              onChange={handleInputDataUpload}
              style={{ display: 'none' }} // Hide the input element
            />
            <div className="mt-2">
              {inputData && (  // Conditionally render input data content
                <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-64">
                  {inputData}
                </pre>
              )}
            </div>
          </div>
      
              <button
                type="submit"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <p>Loading submission</p>)
          }
          </div>)};

export default EditSubmission;
