import type { NextPage } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import CenterTitleCard from "../../components/contentBlocks/centerTitleCard";
import Layout from "../../components/layout";
import { fetchAPI } from "../../lib/api";

const Projects: NextPage = ({ projects }: any) => {
  console.log(projects);
  return (
    <Layout>
      <Head>
        <title>Mathias Bøe</title>
        <meta name="description" content="Created by Mathias Bøe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CenterTitleCard
        cards={projects.projects}
        title={projects.title}
        description={projects.description}
      />
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const res: any = await Promise.all([fetchAPI("/projects")]);
  const projects = await res[0];

  return {
    props: { projects },
    revalidate: 1,
  };
}

export default Projects;
