import React from "react";
import useWordPressPosts from "../hook/useWordPressPosts";

const samplePosts = [
  {
    title: "10 Must-Try Food Spots in Ibadan",
    excerpt: "Discover the best amala joints and restaurants across the city.",
    imageUrl: "https://picsum.photos/400/300?random=1",
    author: "Ajani A.J",
    date: "July 20, 2025",
    link: "https://blog.ajani.ai",
  },
  {
    title: "How to Book a Vendor Easily Using Ajani",
    excerpt: "A simple guide to booking trusted local services.",
    imageUrl: "https://picsum.photos/400/300?random=2",
    author: "Ajani A.J",
    date: "May 30, 2025",
    link: "https://blog.ajani.ai",
  },
  {
    title: "Hidden Places to Explore This Weekend",
    excerpt: "Tourist attractions you never knew existed.",
    imageUrl: "https://picsum.photos/400/300?random=3",
    author: "Ajani A.J",
    date: "July 10, 2025",
    link: "https://blog.ajani.ai",
  },
];

const VendorForm = () => {
  const { posts, loading } = useWordPressPosts();

  // If WordPress API works → use posts
  // If it fails → use samplePosts
  const displayPosts = posts.length > 0 ? posts : samplePosts;

  return (
    <section className="py-16" style={{ backgroundColor: "#06EAFC" }}>
      <div className="max-w-6xl mx-auto px-4 font-manrope">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">From the Blog</h2>
          <p>Ask Ajani, your smart city assistant.</p>
        </div>

        {loading ? (
          <p className="text-gray-800">Loading posts...</p>
        ) : (
          <div className="grid gap-8 lg:gap-[29.23px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto">
            {displayPosts.map((post, idx) => (
              <a
                key={idx}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-[12.99px] shadow-lg overflow-hidden 
                           lg:w-[370.2px] lg:h-[519.61px] w-[365px] h-[511.34px] 
                           block hover:scale-[1.02] transition-transform"
              >
                {/* Image */}
                <div className="w-full h-[calc(519.61px-200px)] overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover rounded-t-[12.99px]"
                  />
                </div>

                {/* Content */}
                <div className="p-[17.32px] h-[200px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-[#00065A]">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>By {post.author}</span> • <span>{post.date}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VendorForm;
