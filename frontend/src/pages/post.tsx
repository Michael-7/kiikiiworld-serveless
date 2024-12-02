import Nav from "@/components/nav/nav";
import { PostForm, PostTypeKey, PostType, generatePost } from "@/types/post";
import Head from "next/head";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

// https://react-hook-form.com/get-started

export default function Post() {
  const APIURL = process.env.APIGATEWAY;

  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, watch, formState, setValue, reset } =
    useForm<PostForm>();

  useEffect(() => {
    setValue("id", crypto.randomUUID());
  }, [setValue]);

  const watchImage = watch("image");

  // --- IMAGE UPLOADING BLOC ---
  useEffect(() => {
    const handleFileChange = async (file: File) => {
      try {
        const getSignedUrl = fetch(
          `${APIURL}/image?fileName=${file.name}&fileType=${file.type}&fileSize=${file.size}`,
          {
            method: "GET",
          }
        );

        setLoadingImg(true);
        const signedUrlReq = await getSignedUrl;
        const signedUrl = await signedUrlReq.json();

        if (signedUrlReq.status === 200) {
          const imageUpload = await put(signedUrl.message, file);

          // Check if the upload was successful
          if (!imageUpload.ok) {
            throw new Error(`Upload failed with status: ${imageUpload.status}`);
          }

          // Derive the file's URL from the S3 bucket URL
          const fileUrl = signedUrl.message.split("?")[0]; // Remove query params
          setImages([...images, fileUrl]);

          setValue("image", undefined);
          setLoadingImg(false);
        }
      } catch {
        console.error("error uploading the file");
        setLoadingImg(false);
      }
    };

    const put = async (url: string, file: File) => {
      return fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Content-Length": file.size.toString(),
        },
        body: file,
      });
    };

    if (watchImage && watchImage.length === 1) {
      if (watchImage[0].size < 5242880) {
        handleFileChange(watchImage[0]);
      } else {
        console.warn("file too big");
      }
    }
  }, [watchImage, APIURL, images, setValue]);

  // --- POST SUBMIT BLOC ---
  const onSubmitPost: SubmitHandler<PostForm> = async (data) => {
    setLoading(true);

    const response = await fetch(`${APIURL}/posts`, {
      method: "POST",
      body: JSON.stringify(generatePost(data, images)),
    });

    try {
      const backendResponse = await response.json();
      setLoading(false);
      setResult("🚫 request failed");

      if (response.status === 200) {
        setResult("✅ request succeeded");
        resetForm();
      }
    } catch {
      setLoading(false);
      setResult("🚫 request failed");
    }
  };

  const resetForm = () => {
    reset();
    setValue("id", crypto.randomUUID());
    setImages([]);
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
              <span className="input__label">Type</span>
              <div className="input__radio-group">
                {Object.keys(PostType).map((type) => (
                  <label key={type} className="input__radio-item">
                    <input
                      type="radio"
                      id={`type-${type}`}
                      value={PostType[type as PostTypeKey]}
                      {...register("type", { required: true })}
                    />
                    {PostType[type as PostTypeKey]}
                  </label>
                ))}
              </div>
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
            {(watch("type") === PostType.QUOTE ||
              watch("type") === PostType.STORY) && (
              <label className="input">
                <span className="input__label">body</span>
                <textarea
                  id="body"
                  className="input__field"
                  {...register("body")}
                />
              </label>
            )}
            {watch("type") === PostType.IMAGE && (
              <>
                <label className="input">
                  <span className="input__label">file</span>
                  <input
                    type="file"
                    className="input__field"
                    accept=".jpg, .jpeg, .png"
                    multiple={true}
                    {...register("image")}
                  />
                </label>
                {loadingImg && <p>uploading...</p>}
              </>
            )}
            {watch("type") === PostType.VIDEO && (
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
            <div className="preview-upload">
              {images.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt={`img_${i}`}
                  className="preview-upload__img"
                />
              ))}
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
