'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation'
import axios from 'axios';

import { useSession } from 'next-auth/react'
import { useUser } from '@/contexts/UserContext'

export default function SubmissionPage() {
  const router = useRouter();
  const { data: session } = useSession()
  const { user } = useUser();

  const [pyFile, setPyFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [submissionName, setSubmissionName] = useState('');
  const [message, setMessage] = useState('');

  const handlePyFileChange = (e) => {
    setPyFile(e.target.files[0]);
  };

  const handleJsonFileChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  const handleSubmissionNameChange = (e) => {
    setSubmissionName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pyFile || !jsonFile || !submissionName) {
      setMessage('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('pyFile', pyFile);
    formData.append('jsonFile', jsonFile);
    formData.append('metadata', JSON.stringify({
        "email": session?.user.email,
        "submission_name": submissionName,
    }));

    try {
      const response = await axios.post('http://localhost:4011/submission-create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      router.push(`/submission-list`);
    } catch (error) {
      setMessage('Failed to upload files');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-200 rounded-md">  {/* Added bg-gray-200 and rounded-md */}
      <h1 className="text-xl font-bold mb-4">Upload Files</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col bg-white rounded-md p-4 shadow-sm"> {/* Added bg-white, rounded-md, and shadow-sm */}
          <label htmlFor="submissionName" className="font-medium mb-2">Submission Name:</label>
          <input
            type="text"
            id="submissionName"
            value={submissionName}
            onChange={handleSubmissionNameChange}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <div className="flex flex-col bg-white rounded-md p-4 shadow-sm"> {/* Added bg-white, rounded-md, and shadow-sm */}
          <label htmlFor="pyFile" className="font-medium mb-2">Python File:</label>
          <input
            type="file"
            id="pyFile"
            accept=".py"
            onChange={handlePyFileChange}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <div className="flex flex-col bg-white rounded-md p-4 shadow-sm"> {/* Added bg-white, rounded-md, and shadow-sm */}
          <label htmlFor="jsonFile" className="font-medium mb-2">JSON File:</label>
          <input
            type="file"
            id="jsonFile"
            accept=".json"
            onChange={handleJsonFileChange}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400">
          Upload
        </button>
      </form>
      {message && <p className="text-red-500">{message}</p>}
    </div>
  );
};
