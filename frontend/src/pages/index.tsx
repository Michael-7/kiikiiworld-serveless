import Post from "@/components/post/post";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/nav/nav";
import Menu from "@/components/menu/menu";
import Head from "next/head";
import { Post as PostT, mapPosts } from "@/types/post";

export default function Home() {
  const APIURL = process.env.APIGATEWAY;
  const MAXYEAR = 2021;
  const filter = useSearchParams()?.get("filter");

  const [allPosts, setAllPosts] = useState<PostT[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setloading] = useState(false);

  const getPosts = useCallback(async () => {
    setloading(true);
    const req = await fetch(`${APIURL}/posts?postYear=${year}`, {
      method: "GET",
    });

    const data = await req.json(); // Parse the JSON body
    console.log(data);

    setAllPosts((posts) => [...posts, ...mapPosts(data)]);
    setloading(false);
  }, [setAllPosts, APIURL, year]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 5
    ) {
      if (!loading && year !== MAXYEAR) {
        setYear((prevPage) => prevPage - 1); // Load next page
      }
    }
  }, [loading, year]);

  useEffect(() => {
    try {
      getPosts();
    } catch (err) {
      console.error("Failed to fetch posts");
    }
  }, [getPosts, APIURL]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // useEffect(() => {
  //   const workingPosts = [...allPosts];

  //   const sortedPosts = workingPosts.sort((postOne, postTwo) => {
  //     return (
  //       new Date(postTwo.date).valueOf() - new Date(postOne.date).valueOf()
  //     );
  //   });

  //   if (filter) {
  //     const filteredPosts = sortedPosts.filter(
  //       (post) => post.category === filter
  //     );
  //     setShownPosts(filteredPosts);
  //   } else {
  //     setShownPosts(sortedPosts);
  //   }
  // }, [filter, setShownPosts]);

  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="index">
        <div className="post-container">
          <div className="post-list">
            {allPosts.map((post) => (
              <Post key={post.id} post={post}></Post>
            ))}

            {loading && <h3>Loading...</h3>}

            {year === MAXYEAR && (
              <h3>
                You reached the end of the line ~ the universe did not exist
                before this point...
              </h3>
            )}
          </div>
        </div>
      </main>
      <Menu></Menu>
    </>
  );
}
