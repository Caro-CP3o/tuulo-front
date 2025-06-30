"use client";

import React from "react";
import FamilyPostList from "../../components/organisms/FamilyPostList";

export default function HomePage() {
  return (
    <section className="space-y-4 my-8 w-full md:mt-20 mt-[35vh]">
      <FamilyPostList />
    </section>
  );
}
