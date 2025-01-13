import Post from '@/components/post/post';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Nav from '@/components/nav/nav';
import Menu from '@/components/menu/menu';
import Head from 'next/head';
import { mapPosts, Post as PostT } from '@/types/post';

export default function Home() {
  const APIURL = process.env.APIGATEWAY;
  const MAXYEAR = 2021;
  const filter = useSearchParams()?.get('filter');
  const admin = useSearchParams()?.get('admin');

  const [allPosts, setAllPosts] = useState<PostT[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setloading] = useState(false);

  const getPosts = useCallback(async () => {
    setloading(true);

    const req = await fetch(`${APIURL}/posts?postYear=${year}`, {
      method: 'GET',
    });

    const data = await req.json(); // Parse the JSON body

    setAllPosts((posts) => [...posts, ...mapPosts(data)]);

    if (allPosts.length < 3) {
      setYear(year - 1);
    }

    setloading(false);
  }, [setAllPosts, APIURL, year]);

  const getPostsByCategory = useCallback(async () => {
    setloading(true);
    const req = await fetch(`${APIURL}/posts?type=${filter}`, {
      method: 'GET',
    });

    const data = await req.json(); // Parse the JSON body

    setAllPosts(mapPosts(data));
    setloading(false);
  }, [setAllPosts, APIURL, filter]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 5
    ) {
      if (!loading && year !== MAXYEAR && !filter) {
        setYear((prevPage) => prevPage - 1); // Load next page
      }
    }
  }, [loading, year, filter]);

  useEffect(() => {
    try {
      if (filter) {
        getPostsByCategory();
      } else {
        getPosts();
      }
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  }, [getPosts, APIURL, getPostsByCategory, filter]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // RESET STATE ON FILTER CHANGE
  useEffect(() => {
    setAllPosts([]);
    setYear(new Date().getFullYear());
  }, [filter]);

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
              <Post key={post.id} post={post} admin={!!admin}></Post>
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
