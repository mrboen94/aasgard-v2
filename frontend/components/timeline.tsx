import {
  CheckIcon,
  SparklesIcon,
  UserIcon,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import Image from "next/image";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";

const eventTypes = {
  job: { icon: UserIcon, bgColorClass: "bg-gray-400" },
  verv: { icon: CheckIcon, bgColorClass: "bg-green-500" },
};

export default function Timeline({ timeline }: any) {
  console.log(timeline);
  return (
    <div className="relative min-h-screen bg-gray-100">
      <section
        aria-labelledby="timeline-title"
        className="lg:col-start-3 lg:col-span-1"
      >
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
          <h2 id="timeline-title" className="text-lg font-medium text-gray-900">
            Timeline
          </h2>
          <div className="mt-6 flow-root">
            <ul role="list" className="-mb-8">
              {timeline.map((item: any, itemIdx: number) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {itemIdx !== timeline.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      {item.__component === "timeline.job" ? (
                        <div
                          className={
                            "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-white p-1 transition duration-700 ease-in-out hover:bg-gray-700 cursor-pointer"
                          }
                        >
                          <a
                            href={"//" + item.companyUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Image
                              src={item.companyImage.url}
                              width={item.companyImage.width}
                              height={item.companyImage.height}
                              alt="Company image"
                            />
                          </a>
                        </div>
                      ) : (
                        <div
                          className={
                            "w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-green-500 p-2"
                          }
                        >
                          <div>
                            <SparklesIcon color="white" />
                          </div>
                        </div>
                      )}
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div className="self-center">
                          <p className="text-sm text-gray-500 pb-2">
                            {item.status}{" "}
                            <a
                              href={
                                item.companyUrl ? "//" + item.companyUrl : "#"
                              }
                              className="font-medium text-gray-900"
                            >
                              {item.job}
                            </a>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={item.startDate}>
                            {new Date(item.startDate).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
