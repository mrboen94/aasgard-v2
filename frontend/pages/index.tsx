import type { NextPage } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import Layout from "../components/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <div>
        <Head>
          <title>Mathias Bøe</title>
          <meta name="description" content="Created by Mathias Bøe" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
    </Layout>
  );
};

export default Home;
