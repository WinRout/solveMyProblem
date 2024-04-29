
import '@/styles/globals.css';

export const metadata = {
  title: "solveMyProblem"
};

export default function CreateSubmissionLayout({ children }) {
  return (
    <section className='w-full max-w-full flex-start flex-col'>
        <h1 className='head_text text-left'>
            <span className='blue_gradient'>Create Submission</span>
        </h1>
        {children}
    </section>
  );
}
