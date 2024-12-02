export interface BasePost {
  id: string;
  type: PostType;
  date: string;
  title: string;
}

export interface VideoPost extends BasePost {
  type: PostType.VIDEO;
  body: string;
}

export interface ImagePost extends BasePost {
  type: PostType.IMAGE;
  body: string[];
}

export interface QuotePost extends BasePost {
  type: PostType.QUOTE;
  body: string;
}

export interface StoryPost extends BasePost {
  type: PostType.STORY;
  body: string;
}

export type Post = VideoPost | ImagePost | QuotePost | StoryPost;

export enum PostType {
  VIDEO = "video",
  IMAGE = "image",
  QUOTE = "quote",
  STORY = "story",
}

export type PostTypeKey = keyof typeof PostType;

export interface PostForm {
  id: string;
  type: string;
  date: string;
  title: string;
  body: string;
  videoUrl: string;
  image: FileList | undefined;
}

export function generatePost(data: PostForm, images: string[]): Post {
  const basePost = {
    id: data.id,
    date: data.date,
    title: data.title,
  };

  switch (data.type) {
    case PostType.IMAGE:
      return { ...basePost, type: PostType.IMAGE, body: images };
    case PostType.VIDEO:
      return { ...basePost, type: PostType.VIDEO, body: data.videoUrl };
    case PostType.QUOTE:
      return { ...basePost, type: PostType.QUOTE, body: data.body };
    case PostType.STORY:
      return { ...basePost, type: PostType.STORY, body: data.body };
    default:
      return { ...basePost, type: PostType.QUOTE, body: "undefined" };
  }
}

export function mapPosts(data: any): Post[] {
  const posts: any[] = data.message.Items;

  const formattedPosts = posts.reverse().map((post) => {
    console.log(post);
    console.log(post.Content);
    const dateId = post.DateId.S.split("__");
    return {
      id: dateId[1],
      type: post.PostType.S,
      date: dateId[0],
      ...JSON.parse(post.Content.S),
    };
  });

  console.log(formattedPosts);
  return formattedPosts;
}
