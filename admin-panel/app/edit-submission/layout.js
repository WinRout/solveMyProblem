
import '@/styles/globals.css';

export const metadata = {
  title: "solveMyProblem"
};

export default function EditSubmissionLayout({ children }) {
  return (
    <section className='w-full max-w-full flex-start flex-col'>
        {children}
    </section>
  );
}
