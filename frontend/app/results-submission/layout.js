
import '@/styles/globals.css';

export const metadata = {
  title: "solveMyProblem"
};

export default function ResultSubmissionLayout({ children }) {
  return (
    <section className='w-full max-w-full flex-start flex-col'>
        <h1 className='head_text text-left'>
            <span className='blue_gradient'>Submission's Results</span>
        </h1>
        {children}
    </section>
  );
}
