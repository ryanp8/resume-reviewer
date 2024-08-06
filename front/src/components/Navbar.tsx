"use client";
import * as React from "react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const authContext = React.useContext(AuthContext);
  const router = useRouter();
  const logout = () => {
    localStorage.setItem("accessToken", "");
    localStorage.setItem("refreshToken", "");
    authContext?.setAccessToken("");
    router.push("/");
  };
  return (
    <div className="mx-4 sm:mx-24 py-6 flex justify-between items-center">
      <Link href="/">
        <h3>Resume Reviewer</h3>
      </Link>
      {authContext?.accessToken ? (
        <div>
          <p>Hi, {authContext.username}</p>
          <button onClick={logout}>Log out</button>
        </div>
      ) : (
        <Link href="/login">
          <p>Log in</p>
        </Link>
      )}
    </div>
  );
}
