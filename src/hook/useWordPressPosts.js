import { useState, useEffect } from "react";

export default function useWordPressPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(
          "https://blog.ajani.ai/wp-json/wp/v2/posts?per_page=3&_embed"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        const mapped = data.map((post) => ({
          title: post.title.rendered,
          excerpt:
            post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 120) + "...",
          imageUrl:
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
            "https://picsum.photos/400/300",
          author: post._embedded?.author?.[0]?.name ?? "Ajani Editorial",
          date: new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          link: post.link,
        }));

        setPosts(mapped);
        setError(null);
      } catch (error) {
        console.error("WordPress fetch error:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}
