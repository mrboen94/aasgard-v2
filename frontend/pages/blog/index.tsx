import type { NextPage } from "next";
import "tailwindcss/tailwind.css";
import Layout from "../../components/layout";
import { fetchAPI } from "../../lib/api";
import BlogCard from "../../components/blogCard";

const Post: NextPage = ({ blogs }: any) => {
  return (
    <Layout>
      <div className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
              Welcome to my thoughts and ramblings
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              This is a place where I write random thoughts and interesting
              finds, ranging from silly music to what I&apos;ve learned doing
              projects.
            </p>
          </div>
          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {blogs &&
              blogs.map((post: any) => (
                <BlogCard key={post.id} image={true} post={post} />
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const res = await Promise.all([fetchAPI("/blogs")]);
  const blogs = res[0];
  return {
    props: { blogs },
    revalidate: 1,
  };
}

export default Post;
