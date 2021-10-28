import { Disclosure } from "@headlessui/react";
import React from "react";
import BlogCard from "../blogCard";
import Image from "../image";
import SocialIcons from "../socialIcons";
import { ChevronDownIcon } from "@heroicons/react/solid";
type centerTitleCardProps = {
  cards: [];
  intro?: string;
  title: string;
  description: string;
  project?: boolean;
  wide?: boolean;
};

export default function CenterTitleCard({
  cards,
  intro,
  title,
  description,
  project,
  wide,
}: centerTitleCardProps) {
  return (
    <div className="relative bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
        <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
          {intro ? intro : null}
        </h2>
        <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          {title}
        </p>
        <p className="mt-5 max-w-prose mx-auto text-xl text-gray-500">
          {description}
        </p>
        <div className="mt-12">
          <div
            className={`grid grid-cols-1 gap-8 sm:grid-cols-2 ${
              !wide ? "lg:grid-cols-3" : ""
            }`}
          >
            {cards.map((card: any) => (
              <div key={card.title} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg pb-8">
                  {project ? (
                    <div className="flex-shrink-0">
                      <div className="max-h-48 relative overflow-hidden">
                        {card.image ? (
                          <Image imageStyle="rounded-lg" image={card.image} />
                        ) : null}
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {card.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {card.description}
                      </p>
                      <ul role="list" className="divide-y divide-gray-200">
                        {card.links.map((link: any) => (
                          <li key={link.id} className="py-4">
                            <a
                              className="px-8 max-w-sm flex justify-between bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg mx-auto hover:shadow-lg transition-all duration-200"
                              href={
                                link.url.includes("http://")
                                  ? link.url
                                  : `http://${link.url}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              <div className="w-12 my-0 p-2 text-white">
                                <SocialIcons type={link.where} />
                              </div>
                              <p className="my-auto text-center text-white">
                                {link.title}
                              </p>
                            </a>
                          </li>
                        ))}
                      </ul>
                      {card.blogs ? (
                        <Disclosure>
                          {({ open }) => (
                            <>
                              <Disclosure.Button className="py-2 flex justify-between mx-auto">
                                <p>Related blogposts </p>
                                <ChevronDownIcon
                                  className={
                                    open
                                      ? "-rotate-180 h-6 w-6 transform duration-200"
                                      : "rotate-0 h-6 w-6 transform duration-200"
                                  }
                                  aria-hidden="true"
                                />
                              </Disclosure.Button>
                              <Disclosure.Panel className="text-gray-500">
                                {card.blogs.map((post: any, index: number) =>
                                  index < 1 ? (
                                    <div className="px-2">
                                      <BlogCard
                                        post={post}
                                        image={post.titleImage}
                                      />
                                    </div>
                                  ) : (
                                    <div className="pt-4 px-2">
                                      <BlogCard
                                        post={post}
                                        image={post.titleImage}
                                        noImage
                                      />
                                    </div>
                                  )
                                )}
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      ) : null}
                    </div>
                  ) : (
                    <div className="-mt-6">
                      <div>
                        {card.icon ? (
                          <span className="w-24 max-h-12 inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-md shadow-lg">
                            <Image style="w-12 text-white" image={card.icon} />
                          </span>
                        ) : card.image ? (
                          <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-md shadow-lg">
                            <Image
                              style="h-24 w-24 text-white"
                              image={card.image}
                            />
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {card.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500 px-3">
                        {card.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
