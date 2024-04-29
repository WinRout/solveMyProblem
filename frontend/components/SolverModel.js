import Link from 'next/link';
import Image from 'next/image';
import React from 'react'

const SolverModel = (props) => {
  return (
    <Link href={props.href}> 
    <div className='glassmorphism flex flex-row gap-10 items-center'>
      <h2 className='subhead_text'>{props.title}</h2>
      <p className=' text-sm'>
        {props.descr}
      </p>
      <Image
      src={props.img_src}
      alt={`${props.title}_image`}
      width={200}
      height={200}
      className='object-contain'
    />
    </div>
  </Link>
  )
}

export default SolverModel