import { PostType, Post } from "@/types/post";
import Link from "next/link";
import Image from "next/image";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

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
      );
    case PostType.STORY:
      return await mdToHtml(post.body as string);
  }
}

function formatDate(inputDate: string): string {
  let formatDate = new Date(inputDate);
  return formatDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostComponent({ post }: { post: Post }) {
  const [data, setData] = useState<any>("...");

  useEffect(() => {
    async function getBody(post: Post) {
      const dataata = await getPostSpecificHtml(post);
      setData(dataata);
    }

    getBody(post);
  }, [post]);

  return (
    <div id="post">
      <div className="post">
        <div className="post__content">{data}</div>
        <div className="post__details">
          <span className="post__title">{post.title}</span>
          <span className="post__date">{formatDate(post.date)}</span>
        </div>
      </div>
    </div>
  );
}
