"use client";

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
        <Link
          className={"menu__link " + getMenuItemClass(filter, "IMAGE")}
          href={`/?filter=IMAGE`}
        >
          Image
        </Link>
      </div>
    </div>
  );
}
