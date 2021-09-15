import type { NextPage } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import CenterTitleCard from "../../components/contentBlocks/centerTitleCard";
import Layout from "../../components/layout";
import { fetchAPI } from "../../lib/api";

const Projects: NextPage = ({ projects }: any) => {
  return (
    <Layout>
      <Head>
        <title>Mathias Bøe</title>
        <meta name="description" content="Created by Mathias Bøe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {projects && (
        <CenterTitleCard
          cards={projects.projects}
          title={projects.title}
          description={projects.description}
          project
          wide
        />
      )}
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const res: string[] = await Promise.all([fetchAPI("/projects")]);
  const projects = res[0];

  return {
    props: { projects },
    revalidate: 1,
  };
}

export default Projects;
