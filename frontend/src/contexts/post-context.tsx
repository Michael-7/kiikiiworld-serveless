import { Context, createContext, useContext, useState } from "react";
import { Post, PostType } from "@/types/post";

const examplePost: Post = {
  title: "",
  id: "",
  type: PostType.QUOTE,
  date: "",
  body: "",
  meta: {
    hide: false,
  },
};

type PostContextType = {
  value: Post;
  setValue: (post: Post) => void;
};

const PostContext: Context<PostContextType> = createContext({
  value: examplePost as Post,
  setValue: (post: Post) => {},
});

export function PostDataProvider({ children }: { children: React.ReactNode }) {
  const [post, setPost] = useState(examplePost);

  return <PostContext.Provider value={{value: post, setValue: setPost}}>{children}</PostContext.Provider>;
}

export function usePostContext() {
  return useContext(PostContext);
}
