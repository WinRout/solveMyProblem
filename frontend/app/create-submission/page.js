import React from 'react'
import SolverModel from '@/components/SolverModel'
function page() {
  return (
    <div>
      <p className='desc'>
        Choose the solver model that suits your needs.
      </p>

      <div className='flex flex-col gap-5 mt-10'>
        <SolverModel 
          title='Routing'
          descr='One of the most common optimization tasks is vehicle routing, 
          in which the goal is to find the best routes for a fleet of vehicles visiting a set of locations. 
          Usually, "best" means routes with the least total distance or cost.'
          img_src='https://developers.google.com/static/optimization/images/routing/vrpgs_solution.svg'
          href='/create-submission/routing'
        />
      </div>
    </div>
  )
}

export default page