import Link from "next/link";

const Form = ({ post, setPost, submitting, handleSubmit }) => {
  return (
      <form
        onSubmit={handleSubmit}
        className='mt-10 w-1/2 flex flex-col gap-7 glassmorphism'
      >
        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            New Credits
          </span>

          <input
            type="number"
            value={post.credits}
            onChange={(e) => setPost({ ...post, credits: e.target.value })}
            placeholder='How many credits to add?'
            required
            className='form_input font-semibold'
          />
        </label>

        <div className='flex-end mx-3 mb-5 gap-4'>
          <Link href='/' className='text-gray-500 text-sm'>
            Cancel
          </Link>

          <button
            type='submit'
            disabled={submitting}
            className='px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white'
          >
            {submitting ? `Adding...` : `Add`}
          </button>
        </div>
      </form>
  );
};

export default Form;