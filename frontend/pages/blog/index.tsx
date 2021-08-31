import type { NextPage } from "next";
import "tailwindcss/tailwind.css";
import Layout from "../../components/layout";
import { fetchAPI } from "../../lib/api";
import { getStrapiMedia } from "../../lib/media";
import Link from "next/link";

const Entry: NextPage = ({ blogs }: any) => {
  return (
    <Layout>
      <div className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="absolute inset-0">
          <div className="bg-white h-1/3 sm:h-2/3" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
              Welcome to my thoughts and ramblings
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              This is a place where I write random thoughts and interesting
              finds, ranging from silly music to what I've learned doing
              projects.
            </p>
          </div>
          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {blogs[0].map((post: any) => (
              <div
                key={post.title}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={getStrapiMedia(post.titleImage)}
                    alt="title image"
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      <Link href={"/blog/post/" + post.id}>{post.title}</Link>
                    </p>
                    <a href={"/entry/" + post.title} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </p>
                      <p className="mt-3 text-base text-gray-500">
                        {post.title}
                      </p>
                    </a>
                  </div>
                  {/* <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <a href={post.author.href}>
                        <span className="sr-only">{post.author.name}</span>
                        <img
                          className="h-10 w-10 rounded-full"
                          src={post.author.imageUrl}
                          alt=""
                        />
                      </a>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        <a href={post.author.href} className="hover:underline">
                          {post.author.name}
                        </a>
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={post.datetime}>{post.date}</time>
                        <span aria-hidden="true">&middot;</span>
                        <span>{post.readingTime} read</span>
                      </div>
                    </div> 
                  </div>*/}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const blogs = await Promise.all([fetchAPI("/blogs")]);

  return {
    props: { blogs },
    revalidate: 1,
  };
}

export default Entry;
