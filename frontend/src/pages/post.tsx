import Nav from '@/components/nav/nav';
import { generatePost, PostForm, PostType, PostTypeKey } from '@/types/post';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePostContext } from '@/contexts/post-context';
import { useSearchParams } from 'next/navigation';
import { getToken } from '@/util/token';
import { mdToHtml } from '@/components/post/post';

// https://react-hook-form.com/get-started

export default function Post() {
  const APIURL = process.env.APIGATEWAY;

  const postState = usePostContext().value;

  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<boolean>(useSearchParams()?.get('edit') === 'true' && postState.id != '');
  const [previewText, setPreviewText] = useState<any>(<div></div>);


  const { register, handleSubmit, watch, setValue, reset } =
    useForm<PostForm>();

  const previewTxt = watch('body');
  const postType = watch('type');
  const watchImage = watch('image');

  useEffect(() => {
    if (editMode) {
      setValue('id', postState.id);
      setValue('title', postState.title);
      setValue('date', postState.date);
      setValue('type', postState.type);

      switch (postState.type) {
        case PostType.IMAGE:
          setImages(postState.body);
          break;
        case PostType.VIDEO:
          setValue('videoUrl', postState.body);
          break;
        case PostType.QUOTE:
          setValue('body', postState.body);
          break;
        case PostType.STORY:
          setValue('body', postState.body);
          break;
        default:
          break;
      }
    } else {
      setValue('id', crypto.randomUUID());
    }
  }, [setValue, editMode, postState]);

  // ---------- IMAGE UPLOADING BLOC ----------
  useEffect(() => {
    const handleFileChange = async (file: File) => {
      try {
        const getSignedUrl = fetch(
          `${APIURL}/image?fileName=${file.name}&fileType=${file.type}&fileSize=${file.size}`,
          {
            method: 'GET',
            headers: {
              'Authorization': getToken(),
            },
          },
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
          const fileUrl = signedUrl.message.split('?')[0]; // Remove query params
          setImages([...images, fileUrl]);

          setValue('image', undefined);
          setLoadingImg(false);
        }
      } catch {
        console.error('error uploading the file');
        setLoadingImg(false);
      }
    };

    const put = async (url: string, file: File) => {
      return fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString(),
        },
        body: file,
      });
    };

    if (watchImage && watchImage.length === 1) {
      if (watchImage[0].size < 5242880) {
        handleFileChange(watchImage[0]);
      } else {
        console.error('!!!! file too big !!!!');
        setResult('🚫 file too big');
      }
    }
  }, [watchImage, APIURL, images, setValue]);

  // ---------- POST SUBMIT BLOC ----------
  const onSubmitPost: SubmitHandler<PostForm> = async (data) => {
    setLoading(true);

    let response;

    if (editMode) {
      response = await fetch(`${APIURL}/posts`, {
        method: 'PATCH',
        headers: {
          'Authorization': getToken(),
        },
        body: JSON.stringify(generatePost(data, images, postState.meta)),
      });
    } else {
      response = await fetch(`${APIURL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': getToken(),
        },
        body: JSON.stringify(generatePost(data, images, { hide: false })),
      });
    }

    try {
      const backendResponse = await response.json();
      setLoading(false);
      setResult('🚫 request failed');

      if (response.status === 200) {
        setResult('✅ request succeeded');
        resetForm();
      }
    } catch {
      setLoading(false);
      setResult('🚫 request failed');
    }
  };

  const resetForm = () => {
    reset();
    setValue('id', crypto.randomUUID());
    setEditMode(false);
    setImages([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const markdown = await mdToHtml(previewTxt);
        setPreviewText(markdown);
      } catch (error) {
        setPreviewText(<p>Cannot process this text to mardown.</p>);
      }
    };

    fetchData();
  }, [previewTxt]);

  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="post-form">
        <div
          className={`post-container ${
            loading ? 'post-container--loading' : ''
          }`}
        >
          <form onSubmit={handleSubmit(onSubmitPost)} className="form">
            <h1 className="post__title">Add Post</h1>
            <label className={editMode ? 'input input--disabled' : 'input'}>
              <span className="input__label">id</span>
              <input
                className="input__field"
                type="text"
                id="id"
                disabled
                {...register('id', { required: true })}
              />
            </label>
            <label className={editMode ? 'input input--disabled' : 'input'}>
              <span className="input__label">Type</span>
              <div className="input__radio-group">
                {Object.keys(PostType).map((type) => (
                  <label key={type} className="input__radio-item">
                    <input
                      type="radio"
                      id={`type-${type}`}
                      value={PostType[type as PostTypeKey]}
                      {...register('type', { required: true })}
                    />
                    {PostType[type as PostTypeKey]}
                  </label>
                ))}
              </div>
            </label>
            <label className={editMode ? 'input input--disabled' : 'input'}>
              <span className="input__label">datetime</span>
              <input
                className="input__field"
                type="datetime-local"
                id="type"
                disabled={editMode}
                {...register('date', { required: true })}
              />
            </label>
            <label className="input">
              <span className="input__label">title</span>
              <input
                className="input__field"
                type="text"
                id="title"
                {...register('title', { required: true })}
              />
            </label>
            {(postType === PostType.QUOTE ||
              postType === PostType.STORY) && (
              <label className="input">
                <span className="input__label">body</span>
                <textarea
                  id="body"
                  className="input__field"
                  rows={5}
                  {...register('body')}
                />
              </label>
            )}
            {postType === PostType.IMAGE && (
              <>
                <label className="input">
                  <span className="input__label">file</span>
                  <input
                    type="file"
                    className="input__field"
                    accept=".jpg, .jpeg, .png"
                    multiple={true}
                    {...register('image')}
                  />
                </label>
                {loadingImg && <p>uploading...</p>}
              </>
            )}
            {postType === PostType.VIDEO && (
              <label className="input">
                <span className="input__label">url</span>
                <input
                  className="input__field"
                  type="text"
                  id="title"
                  {...register('videoUrl')}
                />
              </label>
            )}
            <button type="submit" className="button">
              {editMode ? 'Edit Post' : 'Add Post'}
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
            {(postType === PostType.QUOTE || postType === PostType.STORY) &&
              <div id="post" className="post__markdown">
                {previewText}
              </div>
            }
          </form>
        </div>
      </main>
    </>
  );
}
