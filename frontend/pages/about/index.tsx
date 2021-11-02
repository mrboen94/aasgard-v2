import type { NextPage } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import Hobbies from "../../components/hobbies";
import Layout from "../../components/layout";
import Timeline from "../../components/timeline";
import { fetchAPI } from "../../lib/api";

const About: NextPage = ({ timeline, hobbies }: any) => {
  return (
    <div>
      <div className="print:hidden">
        <Layout>
          <Head>
            <title>Mathias Bøe</title>
            <meta name="description" content="Created by Mathias Bøe" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col md:flex-row">
            {hobbies && (
              <div className="w-full md:w-1/2 p-2">
                <Hobbies hobbies={hobbies} />
              </div>
            )}
            {timeline && (
              <div className="w-full md:w-1/2 p-2 my-12 mx-2">
                <Timeline timeline={timeline.events} />
              </div>
            )}
          </div>
        </Layout>
      </div>
      <div className="print:block hidden">
        <iframe src="https://aasgard.netlify.app/" />
      </div>
    </div>
  );
};
export async function getStaticProps() {
  // Run API calls in parallel
  const res: any = await Promise.all([
    fetchAPI("/timeline"),
    fetchAPI("/hobbies"),
  ]);
  const [timeline, hobbies] = await res;

  return {
    props: { timeline, hobbies },
    revalidate: 1,
  };
}

export default About;
