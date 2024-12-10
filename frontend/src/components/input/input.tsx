"use client";

import { PostForm } from "@/types/post";
import { HTMLAttributes } from "react";
import { UseFormRegister } from "react-hook-form";

type inputProps = HTMLAttributes<HTMLInputElement> & {
  register: UseFormRegister<PostForm>;
};

export default function Input({ children, register, ...rest }: inputProps) {
  return (
    <label className="input">
      {children}
      <input {...register("id", { required: true })} {...rest} />
    </label>
  );
}
