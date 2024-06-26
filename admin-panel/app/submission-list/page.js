'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'


const UserSubmissions = ({}) => {
  const router = useRouter()
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:4011/all-submissions-get`);
      const data = await response.json();
      setSubmissions(data.submissions);
    };

    fetchData();
  }, []);

  const handleExecute = async (submission) => {
    const body = {
      submission_name: submission.submission_name,
      email: submission.email,
    };

    try {
      const response = await fetch('http://localhost:4011/submission-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to execute submission');
      }

      console.log('Submission executed successfully!');
    } catch (error) {
      console.error('Error executing submission:', error);
    }
    window.location.reload();
  };

  const handleEdit = (submission) => {
    router.push(`/edit-submission/${submission._id}?data=${JSON.stringify({"email":submission.email, "submission_name":submission.submission_name})}`);
  };

  const handleResults = (submission) => {
    router.push(`/results-submission/${submission._id}?data=${JSON.stringify({"email":submission.email, "submission_name":submission.submission_name})}`);
  };

  const handleDelete = async (submission) => {
    const body = {
      submission_name: submission.submission_name,
      email: submission.email,
    };

    try {
      const response = await fetch('http://localhost:4011/submission-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to execute submission');
      }

      console.log('Submission executed successfully!');
    } catch (error) {
      console.error('Error executing submission:', error);
    }
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <ul className="list-disc space-y-4">
          {submissions.map((submission) => (
            <li key={submission._id} className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
              <div className="flex flex-col">
                <span className="font-bold">{submission.submission_name}</span>
                <span className="text-gray-500">{submission.state}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-700">{submission.email}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 ${
                    submission.state === 'Draft' ? '' : 'disabled opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleExecute(submission)}
                  disabled={submission.state !== 'Draft'}
                >
                  Execute
                </button>
                <button
                  className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 ${
                    submission.state === 'Draft' ? '' : 'disabled opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleEdit(submission)}
                  disabled={submission.state !== 'Draft'}
                >
                  Edit
                </button>
                <button
                  className={`px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-700 ${
                    submission.state === 'Executed' ? '' : 'disabled opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleResults(submission)}
                  disabled={submission.state !== 'Executed'}
                >
                  Results
                </button>
                <button
                  className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700`}
                  onClick={() => handleDelete(submission)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSubmissions;
