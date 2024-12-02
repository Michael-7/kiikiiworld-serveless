import { PostType, Post } from "@/types/post";
import { MDXContent } from "../mdx/mdx";
import Link from "next/link";
import Image from "next/image";

function getPostSpecificHtml(post: Post) {
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
      return <p>{post.body}</p>;
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
      return <p>{post.body}</p>;
  }

  return <p>* ERROR: UNKNOWN POST TYPE *</p>;
}

function formatDate(inputDate: string): string {
  let formatDate = new Date(inputDate);
  return formatDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getImageUrl(id: string): string {
  return `/blog/${id}`;
}

export default function PostComponent({ post }: { post: Post }) {
  return (
    <div id="post">
      <div className="post">
        <div className="post__content">{getPostSpecificHtml(post)}</div>
        <div className="post__details">
          <span className="post__title">{post.title}</span>
          <span className="post__date">{formatDate(post.date)}</span>
        </div>
      </div>
    </div>
  );
}
