import Link from "next/link";
import Image from "../components/image";

type BlogCardProps = {
  post: any;
  image: boolean;
};

export default function BlogCard({ post, image }: BlogCardProps) {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden m-auto">
      {image ? (
        <div className="flex-shrink-0">
          <div className="max-h-48 relative overflow-hidden">
            {post.titleImage ? <Image image={post.titleImage} /> : null}
          </div>
        </div>
      ) : null}
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            <Link href={"/blog/post/" + post.id}>{post.title}</Link>
          </p>
          <a href={"/entry/" + post.title} className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">{post.title}</p>
            <p className="mt-3 text-base text-gray-500">{post.title}</p>
          </a>
        </div>
        {/* <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <a href={post.author.href}>
                        <span className="sr-only">{post.author.name}</span>
                        <img
                          className="h-10 w-10 rounded-full"
                          src={post.author.imageUrl}
                          alt=""
                        />
                      </a>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        <a href={post.author.href} className="hover:underline">
                          {post.author.name}
                        </a>
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={post.datetime}>{post.date}</time>
                        <span aria-hidden="true">&middot;</span>
                        <span>{post.readingTime} read</span>
                      </div>
                    </div> 
                  </div>*/}
      </div>
    </div>
  );
}
