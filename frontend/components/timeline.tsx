import {
  CheckIcon,
  SparklesIcon,
  UserIcon,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import Image from "next/image";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import { getStrapiMedia } from "../utils";
import ReactMarkdown from "react-markdown";
import RichText from "./contentBlocks/markdown";
import BlogCard from "./blogCard";
import { ExternalLinkIcon, LinkIcon } from "@heroicons/react/outline";

const eventTypes = {
  job: { icon: UserIcon, bgColorClass: "bg-gray-400" },
  verv: { icon: CheckIcon, bgColorClass: "bg-green-500" },
};

export default function Timeline({ timeline }: any) {
  return (
    <div className="relative min-h-screen">
      <section
        aria-labelledby="timeline-title"
        className="lg:col-start-3 lg:col-span-1"
      >
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
            Timeline
          </h2>
          <div className="mt-6 flow-root">
            {timeline.map((item: any, itemIdx: number) => (
              <>
                <Disclosure as="div" className="pt-2">
                  {({ open }) => (
                    <>
                      <dt className="text-lg">
                        <Disclosure.Button className="text-left w-full flex justify-between items-start text-gray-400">
                          <span className="font-medium text-gray-900 w-full">
                            <div className="relative flex space-x-3">
                              {item.__component === "timeline.job" ? (
                                <div
                                  className={
                                    "h-8 w-8 my-auto rounded-full flex items-center justify-center ring-8 ring-white bg-white p-1"
                                  }
                                >
                                  <Image
                                    src={
                                      item.companyImage.url &&
                                      getStrapiMedia(item.companyImage.url)
                                    }
                                    width={item.companyImage.width}
                                    height={item.companyImage.height}
                                    alt="Company image"
                                  />
                                </div>
                              ) : (
                                <div
                                  className={
                                    "w-8 my-auto rounded-full flex items-center justify-center ring-8 ring-white bg-green-500 p-2"
                                  }
                                >
                                  <SparklesIcon color="white" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1 flex justify-between space-x-4">
                                <span className="text-sm text-gray-500 self-center">
                                  {item.status}{" "}
                                  <span className="text-sm font-medium text-gray-900">
                                    {item.job}
                                  </span>
                                </span>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time dateTime={item.startDate}>
                                    {new Date(
                                      item.startDate
                                    ).toLocaleDateString()}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </span>
                          <span className="ml-6 h-7 flex items-center">
                            <ChevronDownIcon
                              className={
                                open
                                  ? "-rotate-180 h-6 w-6 transform"
                                  : "rotate-0 h-6 w-6 transform"
                              }
                              aria-hidden="true"
                            />
                          </span>
                        </Disclosure.Button>
                      </dt>
                      <Disclosure.Panel as="dd" className="mt-2 pr-12">
                        <div className="flex flex-col md:flex-row md:justify-between md:pr-10">
                          <div className="m-auto p-4 w-full md:m-2 md:w-1/2">
                            <p className="prose-sm md:prose-md">
                              {item.description}
                            </p>
                          </div>
                          {item.blog ? (
                            <div>
                              <h1 className="prose-lg my-2 mx-auto">
                                Latest blogpost about this:
                              </h1>
                              <Link href={"/blog/post/" + item.blog.id}>
                                <a className="mx-auto w-full shadow-md transition duration-500 hover:shadow-lg p-4 rounded-lg flex">
                                  {item.blog.title}
                                  <LinkIcon color="gray" className="w-8 p-2" />
                                </a>
                              </Link>
                            </div>
                          ) : (
                            <div className="max-w-1/3 m-auto">
                              <h2>
                                Unfortunately there doesn't seem to be a blog
                                post about this yet...
                              </h2>
                            </div>
                          )}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                <div className="relative pb-8">
                  {itemIdx !== timeline.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              </>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
