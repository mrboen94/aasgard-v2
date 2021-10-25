import "tailwindcss/tailwind.css";
import Layout from "../../../components/layout";
import { fetchAPI } from "../../../lib/api";
import Image from "../../../components/image";
import renderSwitch from "../../../components/renderSwitch";

export default function Post({ content }: any) {
  return (
    <Layout>
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-prose text-xl mx-auto">
            <h1>
              <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
                {content?.super}
              </span>
              <span className="mt-2 mb-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {content?.title}
              </span>
            </h1>
            <div className="w-full content-center">
              <div className="mx-auto py-4">
                {content?.titleImage && (
                  <Image style="rounded-lg mx-0" image={content.titleImage} />
                )}
              </div>
            </div>
            {content && content.content?.map((data: any) => renderSwitch(data))}
          </div>
        </div>
      </div>
    </Layout>
  );
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

export async function getStaticPaths() {
  const res: any = await Promise.all([fetchAPI(`/blogs`)]).then();
  const posts = await res[0];

  const paths = posts?.map((post: any) => ({
    params: { id: post.id.toString() },
  }));

  return {
    paths,
    fallback: false,
  };
}
