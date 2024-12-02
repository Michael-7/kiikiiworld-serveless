"use client";

import { PostType, PostTypeKey } from "@/types/post";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function getMenuItemClass(
  filter: string | undefined | null,
  contentType: string
): string {
  if (contentType === "" && !filter) {
    return "menu__link--selected";
  }

  return filter === contentType ? "menu__link--selected" : "";
}

export default function Menu() {
  const filter = useSearchParams()?.get("filter");

  return (
    <div id="menu">
      <div className="menu">
        <Link
          className={"menu__link " + getMenuItemClass(filter, "")}
          href={`/`}
        >
          Everything
        </Link>
        {Object.keys(PostType).map((type) => (
          <Link
            key={type}
            className={
              "menu__link " +
              getMenuItemClass(filter, PostType[type as PostTypeKey])
            }
            href={`/?filter=${PostType[type as PostTypeKey]}`}
          >
            {PostType[type as PostTypeKey]}
          </Link>
        ))}
      </div>
    </div>
  );
}
