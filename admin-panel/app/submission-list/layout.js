
import '@/styles/globals.css';

export default function MySubmissionLayout({ children }) {
  return (
    <section className='w-full max-w-full flex-start flex-col'>
        {children}
    </section>
  );
}
