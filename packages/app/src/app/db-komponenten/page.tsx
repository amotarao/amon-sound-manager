"use client";

import classNames from "classnames";
import {
  type CollectionReference,
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import type { NextPage } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useTags } from "../../hooks/useTags";
import { firestore } from "../../libs/firebase/index";
import { convertSearchParamsToObject } from "../../libs/searchParams";
import type { Component } from "../../types/component";
import { TagItemCard } from "../TagItemCard";
import { ComponentCard } from "./ComponentCard";

const collectionId = "dbKomponenten";

const Page: NextPage = () => {
  const searchParams = useSearchParams();
  const queryA = convertSearchParamsToObject(searchParams);
  const componentDocId = searchParams.get("component");

  const { tags, currentTags, fetchTags, deleteTag } = useTags(collectionId);

  const { data: docs = [] } = useSWR(
    [collectionId, "docs", { currentTags }],
    async ([, , { currentTags }]) => {
      const c = collection(
        firestore,
        collectionId,
      ) as CollectionReference<Component>;
      let q = query(c);

      q = query(q, limit(1000));
      if (currentTags.length) {
        q = query(q, where("tags", "array-contains-any", currentTags));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs;
    },
  );

  return (
    <div className="h-full w-full overflow-x-auto">
      <div className="grid h-full min-w-1080 grid-cols-[240px_320px_1fr] overflow-hidden">
        {/* Tag */}
        <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
          <ul>
            {["ALL", ...tags].map((_tag) => (
              <li
                key={_tag}
                className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']"
              >
                <TagItemCard
                  collectionId={collectionId}
                  tag={_tag}
                  isCurrent={
                    _tag !== "ALL"
                      ? currentTags.includes(_tag)
                      : !currentTags.length
                  }
                  mode="multiple"
                />
              </li>
            ))}
          </ul>
        </div>
        {/* Component */}
        <div className="flex h-full flex-col overflow-y-auto border-r pb-10">
          {currentTags.length > 0 && (
            <div className="sticky top-0 border-b bg-black p-4">
              {currentTags.map((tag) => (
                <div key={tag} className="flex">
                  <p className="shrink grow">{tag}</p>
                  <button
                    className="shrink-0 rounded border px-2 text-sm"
                    type="button"
                    onClick={() => {
                      (async () => {
                        await deleteTag(tag);
                        await fetchTags();
                      })();
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <ul>
            {docs
              .filter((doc) =>
                currentTags.every((tag) => doc.data().tags.includes(tag)),
              )
              .sort((a, z) => {
                const aName = a.data().name;
                const zName = z.data().name;

                return aName > zName ? 1 : aName < zName ? -1 : 0;
              })
              .map((doc) => {
                const tags = doc
                  .data()
                  .tags.filter((_tag) => !currentTags.includes(_tag));

                return (
                  <li
                    key={doc.id}
                    className="after:mx-2 after:block after:h-[1px] after:bg-current after:content-['']"
                  >
                    <Link
                      className={classNames(
                        "grid grid-rows-1 gap-1 px-4 py-2",
                        componentDocId === doc.id &&
                          "bg-neutral-300 dark:bg-neutral-700",
                      )}
                      href={{
                        href: "/",
                        query: { ...queryA, component: doc.id },
                      }}
                    >
                      <p className="text-sm">{doc.data().name}</p>
                      {tags.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <li key={tag}>
                              <p className="text-xs">
                                <span className="mr-0.5">#</span>
                                {tag}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        {/* Detail */}
        <div className="flex h-full flex-col gap-4 overflow-y-auto">
          {componentDocId && (
            <ComponentCard
              key={componentDocId}
              collectionId="dbKomponenten"
              docId={componentDocId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
