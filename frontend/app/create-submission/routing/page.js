'use client'
import Link from 'next/link'
import React, {useState} from 'react'
import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'
import { useUser } from '@/contexts/UserContext'

import InputDataTable from '@/components/InputDataTable'

const Map = dynamic(
  () => import('@/components/Map'),
  { 
    loading: () => <p>A map is loading...</p>,
    ssr: false
  }
)

function page() {

  const { data: session } = useSession()
  const { user } = useUser();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [post, setPost] = useState({ prompt: "", tag: "" });
  const [submitting, setIsSubmitting] = useState(false)

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      try {
        const jsonData = JSON.parse(reader.result);
        setData(jsonData);
        setError(null);
      } catch (error) {
        setError('Error reading file: Invalid JSON format');
      }
    };

    reader.onerror = (error) => {
      setError(`Error reading file: ${error.message}`);
    };
  };

  console.log(user?.credits)

  return (
    <section className='w-full flex flex-col mt-5 gap-2 mb-10'>
      <h2 className='text-3xl mb-5'>Vehicle Routing</h2>
      {session && session?.user && user?.credits>0 ? (
        <div>
          <p>Upload the .json file of input data.</p>
          <div>
          <input type="file" className="glassmorphism" accept=".json" onChange={handleFileChange} />
          </div>
          {error && <p className="error">{error}</p>}
          {data && (
            <div className='flex flex-col gap-5'>
              <div className='flex flex-row gap-20'>
                <div className='w-1/2'>
                  <p className='desc mb-3'>Location Input Data</p>
                  <Map 
                  zoom={10}
                  locations={data.Locations}
                  />
                </div>
                <div>
                  <p className='desc mb-3'>Other Input Data</p>
                  <InputDataTable 
                    data={{
                      "Total Vehicles": data.num_vehicles,
                      "Depot": data.depot,
                      "Maximum Travel Distance": data.max_distance
                    }}
                  />
                </div>
              </div>

            <form
            onSubmit={()=>(setTimeout(10))}
            className='mt-10 w-1/2 flex flex-col gap-7 glassmorphism'
          >
            <label>
              <span className='font-satoshi font-semibold text-base text-gray-700'>
                Submission Name
              </span>

              <input
                type="text"
                value={post.credits}
                onChange={(e) => setPost({ ...post, credits: e.target.value })}
                placeholder='Give your submission a name.'
                required
                className='form_input font-semibold'
              />
            </label>

            <div className='flex-end mx-3 mb-5 gap-4'>
              <Link href='/create-submission' className='text-gray-500 text-sm'>
                Cancel
              </Link>

              <button
                type='submit'
                disabled={submitting}
                className='px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white'
              >
                {submitting ? `Creating...` : `Create`}
              </button>
            </div>
          </form>
          </div>
          )}
        </div>
      ) : (
        <p className='desc'>You don't have enough credits. Please add more credits to create a submission.</p>
      )}


    </section>
  )
}

export default page