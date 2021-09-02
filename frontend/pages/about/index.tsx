import type { NextPage } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import Layout from "../../components/layout";
import Timeline from "../../components/timeline";
import { fetchAPI } from "../../lib/api";

const About: NextPage = ({ timeline }: any) => {
  return (
    <Layout>
      <Head>
        <title>Mathias Bøe</title>
        <meta name="description" content="Created by Mathias Bøe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Timeline timeline={timeline.events} />
    </Layout>
  );
};
export async function getStaticProps() {
  // Run API calls in parallel
  const res: any = await Promise.all([fetchAPI("/timeline")]);
  const timeline = await res[0];

  return {
    props: { timeline },
    revalidate: 1,
  };
}

export default About;
