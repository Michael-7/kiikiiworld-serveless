import Nav from "@/components/nav/nav";
import { PostTypeKey, PostTypes } from "@/types/post";
import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { XMLParser } from "fast-xml-parser";

// https://react-hook-form.com/get-started

type Inputs = {
  id: string;
  type: string;
  date: string;
  title: string;
  body: string;
  videoUrl: string;
  image: FileList;
};

export default function Post() {
  const APIURL = process.env.APIGATEWAY;

  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, watch, formState, setValue, reset } =
    useForm<Inputs>();

  useEffect(() => {
    setValue("id", crypto.randomUUID());
  }, [setValue]);

  const watchImage = watch("image");

  useEffect(() => {
    console.log(watchImage);

    const handleFileChange = async (file: File) => {
      try {
        const getSignedUrl = await fetch(
          `${APIURL}/image?fileName=${file.name}&fileType=${file.type}&fileSize=${file.size}`,
          {
            method: "GET",
          }
        );

        const signedUrlReq = await getSignedUrl;
        const signedUrl = await signedUrlReq.json();

        if (signedUrlReq.status === 200) {
          const imageUpload = await put(signedUrl.message, file);
          console.log(imageUpload);
        }
      } catch {
        console.log("error uploading the file");
      }
    };

    const put = async (url: string, file: File) => {
      const req = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Content-Length": file.size.toString(),
        },
        body: file,
      });

      return req;
    };

    if (watchImage && watchImage.length === 1) {
      if (watchImage[0].size < 5242880) {
        handleFileChange(watchImage[0]);
      } else {
        console.warn("file too big");
      }
    }
  }, [watchImage]);

  const onSubmitPost: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);

    const response = await fetch(`${APIURL}/posts`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    try {
      const backendResponse = await response.json();
      setLoading(false);
      console.log(backendResponse);
      setResult("🚫 request failed");

      if (response.status === 200) {
        setResult("✅ request succeeded");
        reset();
        setValue("id", crypto.randomUUID());
      }
    } catch {
      setLoading(false);
      setResult("🚫 request failed");
    }
  };

  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="post-form">
        <div
          className={`post-container ${
            loading ? "post-container--loading" : ""
          }`}
        >
          <form onSubmit={handleSubmit(onSubmitPost)} className="form">
            <h1 className="post__title">Add Post</h1>
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
                  accept=".jpg, .jpeg, .png"
                  multiple={false}
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
            <p>{result}</p>
          </form>
        </div>
      </main>
    </>
  );
}
