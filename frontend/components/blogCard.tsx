import Link from "next/link";
import Image from "../components/image";

type BlogCardProps = {
  post: any;
  image: boolean;
  noImage?: boolean;
};

export default function BlogCard({ post, image, noImage }: BlogCardProps) {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden m-auto">
      <Link href={"/blog/post/" + post.id}>
        <a>
          {image && !noImage ? (
            <div className="flex-shrink-0">
              <div className="max-h-48 relative overflow-hidden">
                {post.titleImage ? <Image image={post.titleImage} /> : null}
              </div>
            </div>
          ) : null}
          <div className="flex-1 bg-white p-6 flex flex-col justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-600">
                {post.super}
              </p>
              {!noImage ? (
                <a href={"/blog/post/" + post.id} className="block mt-2">
                  <p className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </p>
                </a>
              ) : null}
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
