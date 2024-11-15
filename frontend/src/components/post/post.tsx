import BasePost from "@/types/post";
import { Categories } from "@/types/categories";
import { MDXContent } from "../mdx/mdx";
import Link from "next/link";
import Image from "next/image";

function getPostSpecificHtml(post: BasePost) {
  switch (post.category) {
    case Categories.photo:
      if (post.image) {
        return (
        <Link href={post.image && getImageUrl(post.image)}>
          <Image src={post.image && getImageUrl(post.image)}
          className="post__image"
          alt={post.title}
          height="480"
          width="640">
          </Image>
        </Link>)
      }
    case Categories.quote:
      return <MDXContent code={post.body} components={{}} />
    case Categories.video:
      return (
        <iframe className="post__video"
          src={post.video}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen>
        </iframe>
      )
    case Categories.story:
      return <MDXContent code={post.body} components={{}} />
    case Categories.project:
      return <MDXContent code={post.body} components={{}} />
  }

  return <p>* ERROR: UNKNOWN POST TYPE *</p>
}

function formatDate(inputDate: string): string {
  let formatDate = new Date(inputDate);
  return formatDate.toLocaleDateString('en-US', {  
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getImageUrl(id: string): string {
  return `/blog/${id}`;
}

export default function Post({post}: {post: BasePost}) {
  return (
    <div id="post">
      <div className="post">
        <div className="post__content">
          {getPostSpecificHtml(post)}
        </div>
        <div className="post__details">
          <span className="post__title">{post.title}</span>
          <span className="post__date">{formatDate(post.date)}</span>
        </div>
      </div>
    </div>
  )
}