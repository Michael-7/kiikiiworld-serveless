"use client";

import { Inputs } from "@/pages/post";
import { HTMLAttributes } from "react";
import { UseFormRegister } from "react-hook-form";

type inputProps = HTMLAttributes<HTMLInputElement> & {
  register: UseFormRegister<Inputs>;
};

export default function Input({ children, register, ...rest }: inputProps) {
  return (
    <label className="input">
      {children}
      <input {...register("id", { required: true })} {...rest} />
    </label>
  );
}
