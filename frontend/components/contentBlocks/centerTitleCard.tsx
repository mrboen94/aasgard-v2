import React from "react";
import Image from "../image";

type centerTitleCardProps = {
  cards: [];
  intro?: string;
  title: string;
  description: string;
};

export default function CenterTitleCard({
  cards,
  intro,
  title,
  description,
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card: any) => (
              <div key={card.title} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      {card.icon ? (
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-md shadow-lg">
                          <Image style="h-6 w-6 text-white" image={card.icon} />
                        </span>
                      ) : card.image ? (
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-md shadow-lg">
                          <Image
                            style="h-6 w-6 text-white"
                            image={card.image}
                          />
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
