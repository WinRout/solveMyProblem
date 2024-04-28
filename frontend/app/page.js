import Image from "next/image";

export default function Home() {
  return (
    <section className="w-full flex-center flex-col">
      <h1 className="head_text text-center">
        Find your
        <span className='orange_gradient text-center'> Solutions</span>
      </h1>
      <p className='desc text-center'>
      solveMyProblem utilizes a software suite, 
      tuned for tackling the world's toughest problems. We give you the computational power
      and the algorithms. You only give the input data.
    </p>
    </section>
  );
}
