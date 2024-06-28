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

  useEffect(() => {
      const fetchData = async () => {
      // try {
          const response = await fetch(`http://localhost:4011/submission-get/${session?.user.email}/${submissionId}`);
          const data = await response.json();

          if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch submission');
          }

          setSubmission(data);
      // } catch (error) {
      //     setErrorMessage(error.message);
      // }
      };
      fetchData();
  }, [session?.user.email]);

  const handleBack = async () => {
      router.push('/submission-list'); // Redirect back to user submissions page
  };

  const handleDownloadOutput = async () => {
    const blob = new Blob([submission.output_data], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${submission.submission_name}-output.txt`;
    link.click();
  };

  const handleDownloadCode = async () => {
    const blob = new Blob([submission.code], { type: 'text/x-python' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${submission.submission_name}-code.py`;
    link.click();
  };

  const handleDownloadInputData = async () => {
    const blob = new Blob([submission.input_data], { type: 'application/json' });
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
              <p className="font-medium">Executed:</p>
              <p>{new Date(submission.execution_date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
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

            {/* Styled box for execution details */}
            <div className="bg-gray-200 rounded-md p-4 flex gap-40 mb-4">
            <div>
              <p className="font-medium">Execution Time:</p>
              <p>{submission.execution_secs.toFixed(2)} sec</p>
              </div>
            </div>
      
          {/* Output section */}
          <div className="mb-4 bg-gray-300 p-2 rounded-md">
            <button
                type="button" // Use button type for download functionality
                onClick={handleDownloadOutput}
                className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ml-2"
              >
                Download Output Data
            </button>
            <div className="mt-2">
              {submission.output_data && (  // Conditionally render code content
                <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-64">
                  {submission.output_data}
                </pre>
              )}

            </div>
            <p>Error:</p>
            <div className="mt-2">
              {submission.error && (  // Conditionally render code content
                <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-64">
                  {submission.error}
                </pre>
              )}

            </div>
          </div>

          {/* Input data section  */}
          <div className="mb-4 bg-gray-300 p-2 rounded-md">
            <button
                type="button" // Use button type for download functionality
                onClick={handleDownloadInputData}
                className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ml-2"
              >
                Download Input Data
            </button>
            <div className="mt-2">
              {submission.input_data && (  // Conditionally render input data content
                <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-64">
                  {submission.input_data}
                </pre>
              )}
            </div>
          </div>

          {/* Code section */}
          <div className="mb-4 bg-gray-300 p-2 rounded-md">
            <button
                type="button" // Use button type for download functionality
                onClick={handleDownloadCode}
                className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ml-2"
              >
                Download Code
            </button>
            <div className="mt-2">
              {submission.code && (  // Conditionally render code content
                <pre className="bg-gray-100 p-2 rounded-md overflow-auto max-h-64">
                  {submission.code}
                </pre>
              )}

            </div>
          </div>

      
              <button
                type="submit"
                onClick={handleBack}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              >
                Back
              </button>
            </form>
          ) : (
            <p>Loading submission</p>)
          }
          </div>)};

export default EditSubmission;
