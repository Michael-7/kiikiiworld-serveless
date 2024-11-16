import Nav from "@/components/nav/nav";
import { PostTypeKey, PostTypes } from "@/types/post";
import Head from "next/head";
import { FormEvent, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

// https://react-hook-form.com/get-started

type Inputs = {
  id: string;
  type: string;
  date: string;
  title: string;
  body: string;
  videoUrl: string;
  image: Blob;
};

export default function Post() {
  const APIURL =
    "https://c9yd8397u2.execute-api.eu-central-1.amazonaws.com/live";

  const { register, handleSubmit, watch, formState, setValue } =
    useForm<Inputs>();

  useEffect(() => {
    setValue("id", crypto.randomUUID());
  }, [setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);

    const response = await fetch(`${APIURL}/test`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const backendResponse = await response.json();
    console.log(backendResponse);
  };

  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="post-form">
        <div className="post-container">
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <h2>Add Post</h2>
            <label className="input">
              <span className="input__label">id</span>
              <input
                className="input__field"
                type="text"
                id="id"
                disabled
                {...register("id", { required: true })}
              />
            </label>
            <label className="input">
              <span className="input__label">type</span>
              <select
                id="type"
                className="input__field"
                {...register("type", { required: true })}
              >
                <option value="">--Please choose an option--</option>
                {Object.keys(PostTypes).map((type) => (
                  <option key={type} value={type}>
                    {PostTypes[type as PostTypeKey]}
                  </option>
                ))}
              </select>
            </label>
            <label className="input">
              <span className="input__label">datetime</span>
              <input
                className="input__field"
                type="datetime-local"
                id="type"
                {...register("date", { required: true })}
              />
            </label>
            <label className="input">
              <span className="input__label">title</span>
              <input
                className="input__field"
                type="text"
                id="title"
                {...register("title", { required: true })}
              />
            </label>
            {(watch("type") === PostTypes.quote ||
              watch("type") === PostTypes.story) && (
              <label className="input">
                <span className="input__label">body</span>
                <textarea
                  id="body"
                  className="input__field"
                  {...register("body")}
                />
              </label>
            )}
            {watch("type") === PostTypes.photo && (
              <label className="input">
                <span className="input__label">file</span>
                <input
                  type="file"
                  className="input__field"
                  {...register("image")}
                />
              </label>
            )}
            {watch("type") === PostTypes.video && (
              <label className="input">
                <span className="input__label">url</span>
                <input
                  className="input__field"
                  type="text"
                  id="title"
                  {...register("videoUrl")}
                />
              </label>
            )}
            <button type="submit" className="button">
              Add Post
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
