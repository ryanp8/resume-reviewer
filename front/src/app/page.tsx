"use client";
import * as React from "react";
import { KeywordGraph } from "@/components/KeywordGraph";
import Link from "next/link";
import { BASE_URL } from "@/config";

export default function Home() {
  return (
    <main className="mx-auto">
      <div className="">
        <div className="text-center mt-16">
          <h1 className="text-5xl">Optimize your resume.</h1>
          <p className="text-lg mt-5 text-gray-600">
            Make sure your resume is tailored to SWE jobs you're applying for,
            and keep up with the popular keywords in job listings.
          </p>
          <button className="rounded-md mt-5 px-4 py-2 text-lg bg-purple-500 text-white">
            <Link href="/login">Get Started</Link>
          </button>
        </div>
        <div className="mx-24 my-12">
          <KeywordGraph />
        </div>
      </div>
    </main>
  );
}
