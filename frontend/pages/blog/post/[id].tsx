import "tailwindcss/tailwind.css";
import Markdown from "../../../components/contentBlocks/markdown";
import Layout from "../../../components/layout";
import { fetchAPI } from "../../../lib/api";
import { getStrapiMedia } from "../../../utils";
import Image from "next/image";

export default function Post({ content }: any) {
  function renderSwitch(data: any) {
    switch (data.__component) {
      case "content.media":
        const url = getStrapiMedia(data.media[0].url);
        return (
          <Image src={url ? url : ""} width="50%" height="50%" alt="image" />
        );
      case "content.text":
        return <Markdown markdown={data.text} />;
      default:
        return null;
    }
  }
  return (
    <Layout>
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-prose text-xl mx-auto">
            <h1>
              <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
                {content.super}
              </span>
              <span className="mt-2 mb-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {content.title}
              </span>
            </h1>
            <div className="w-full content-center">
              <div className="mx-auto py-4">
                {console.log(content.titleImage)}
                <Image
                  className="rounded-lg"
                  src={
                    content.titleImage.url &&
                    getStrapiMedia(content.titleImage.url)
                  }
                  width={content.titleImage.width}
                  height={content.titleImage.height}
                  alt="title image"
                />
              </div>
            </div>
            {content.content.map((data: any) => renderSwitch(data))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const res: any = await Promise.all([fetchAPI(`/blogs`)]);
  const posts = await res[0];

  const paths = posts.map((post: any) => ({
    params: { id: post.id.toString() },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  // Run API calls in parallel
  const res: any = await Promise.all([fetchAPI(`/blogs/${params.id}`)]);
  const content = await res[0];

  return {
    props: { content },
    revalidate: 1,
  };
}
