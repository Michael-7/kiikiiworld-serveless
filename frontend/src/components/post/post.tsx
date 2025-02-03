import { Post, PostType } from '@/types/post';
import Link from 'next/link';
import Image from 'next/image';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { usePostContext } from '@/contexts/post-context';
import { getToken } from '@/util/token';

async function mdToHtml(string: string) {
  const html = await marked.parse(string);
  const sanitizedHtml = DOMPurify.sanitize(html);
  return (
    <div
      className="post__markdown"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    ></div>
  );
}

async function getPostSpecificHtml(post: Post) {
  switch (post.type) {
    case PostType.IMAGE:
      if (post.body) {
        return (
          <Link href={post.body[0]}>
            <Image
              src={post.body[0]}
              className="post__image"
              alt={post.title}
              height="480"
              width="640"
            ></Image>
          </Link>
        );
      }
    case PostType.QUOTE:
      return await mdToHtml(post.body as string);
    case PostType.VIDEO:
      return (
        <iframe
          className="post__video"
          src={post.body}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      )
        ;
    case PostType.STORY:
      return await mdToHtml(post.body as string);
  }
}

function formatDate(inputDate: string): string {
  let formatDate = new Date(inputDate);
  return formatDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PostComponent({ post, admin }: {
  post: Post;
  admin: boolean;
}) {
  const APIURL = process.env.APIGATEWAY;

  const [data, setData] = useState<any>('...');
  const [deleted, setDeleted] = useState<boolean>(false);
  const [hidden, setHidden] = useState(post.meta.hide);
  const postState = usePostContext();

  useEffect(() => {
    async function getBody(post: Post) {
      const dataata = await getPostSpecificHtml(post);
      setData(dataata);
    }

    getBody(post);
  }, [post]);

  async function deletePost() {
    try {
      const deletePost = fetch(
        `${APIURL}/posts?id=${post.id}&type=${post.type}&date=${post.date}`, {
          method: 'DELETE',
          headers: {
            'Authorization': getToken(),
          },
        },
      );

      const deleted = await deletePost;

      if (deleted.status === 200) {
        setDeleted(true);
      }
    } catch (err) {
      console.warn('u failed G');
    }
  }

  async function hidePost() {
    const newPost = {
      ...post,
      meta: {
        hide: !hidden,
      },
    };

    try {
      const hidePost = fetch(`${APIURL}/posts`, {
        method: 'PATCH',
        headers: {
          'Authorization': getToken(),
        },
        body: JSON.stringify(newPost),
      });

      const hiddenReq = await hidePost;

      if (hiddenReq.status === 200) {
        console.log('success G');
        setHidden(!hidden);
      }

    } catch {
      console.warn('u failed G');
    }
  }

  if (deleted || (hidden && !admin)) {
    return undefined;
  }

  const getPostClasses = () => {
    const baseClass = 'post';
    if (admin && hidden) {
      return `${baseClass} post--hide`;
    }
    return baseClass;
  };

  const editPost = () => {
    postState.setValue(post);
  };

  return (
    <div id="post">
      <div className={getPostClasses()}>
        {admin && (
          <div className="post__edit">
            <Link href={{ pathname: '/post', query: { edit: true } }}>
              <button onClick={editPost}>Edit</button>
            </Link>
            <button onClick={deletePost}>Delete</button>
            <button onClick={hidePost}>{hidden ? 'Show' : 'Hide'}</button>
          </div>
        )}
        <div className="post__content">{data}</div>
        <div className="post__details">
          <span className="post__title">{post.title}</span>
          <span className="post__date">{formatDate(post.date)}</span>
        </div>
      </div>
    </div>
  );
}
