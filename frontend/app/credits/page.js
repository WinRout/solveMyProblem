"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

import Form from "@/components/Form";
import { SERVER_PROPS_GET_INIT_PROPS_CONFLICT } from "next/dist/lib/constants";

const page = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { user, fetchUserData } = useUser();

  const [submitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState({ prompt: "", tag: "" });

  const createPrompt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:4010/user-credits-update", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: session?.user.email,
            credits: Number(post.credits),
        }),
      });

      if (response.ok) {
          alert(`${post.credits} credits added succesfully to your account!`)
          window.location.reload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='w-full max-w-full flex-start flex-col'>
      <h1 className='head_text text-left'>
        <span className='blue_gradient'>Add Credits</span>
      </h1>
      <p className='desc text-left max-w-md'>
        Credits enable you to utilize more computational resources and thus solve more intensive problems. 
      </p>
      <Form
        post={post}
        setPost={setPost}
        submitting={submitting}
        handleSubmit={createPrompt}
      />
    </section>
  );

};

export default page;