import type { NextPage } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import Layout from "../components/layout";
import { fetchAPI } from "../lib/api";
import renderSwitch from "../components/renderSwitch";

const Home: NextPage = ({ home }: any) => {
  return (
    <Layout>
      <Head>
        <title>Mathias Bøe</title>
        <meta name="description" content="Created by Mathias Bøe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white">
        <div className="relative overflow-hidden">
          <main>
            {home &&
              home.content.map((content: any) => renderSwitch(content, true))}
            {/* Feature section with screenshot */}

            {/* Feature section with grid */}

            {/* Testimonial section */}

            {/* Blog section */}
            {/* CTA Section */}
            {/* <div className="relative bg-gray-900">
              <div className="relative h-56 bg-indigo-600 sm:h-72 md:absolute md:left-0 md:h-full md:w-1/2">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&sat=-100"
                  alt=""
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 mix-blend-multiply"
                />
              </div>
              <div className="relative mx-auto max-w-md px-4 py-12 sm:max-w-7xl sm:px-6 sm:py-20 md:py-28 lg:px-8 lg:py-32">
                <div className="md:ml-auto md:w-1/2 md:pl-10">
                  <h2 className="text-base font-semibold uppercase tracking-wider text-gray-300">
                    Award winning support
                  </h2>
                  <p className="mt-2 text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
                    We’re here to help
                  </p>
                  <p className="mt-3 text-lg text-gray-300">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et,
                    egestas tempus tellus etiam sed. Quam a scelerisque amet
                    ullamcorper eu enim et fermentum, augue. Aliquet amet
                    volutpat quisque ut interdum tincidunt duis.
                  </p>
                  <div className="mt-8">
                    <div className="inline-flex rounded-md shadow">
                      <a
                        href="#"
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                      >
                        Visit the help center
                        <ExternalLinkIcon
                          className="-mr-1 ml-3 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const res: any = await Promise.all([fetchAPI("/home")]);
  const home = await res[0];

  return {
    props: { home },
    revalidate: 1,
  };
}

export default Home;
