"use client";

import * as React from "react";
import { verify, JwtPayload } from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { getCookie, getCookies, setCookie } from "cookies-next";
import refreshAccessToken from "@/app/utils/refresh";

interface AuthContextType {
  userid: string;
  setUserid: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = React.useState("");
  const [userid, setUserid] = React.useState("");
  const [accessToken, setAccessToken] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    (async function () {
      if (!accessToken) {
        const accessCookie = localStorage.getItem("accessToken");
        if (accessCookie) {
          setAccessToken(accessCookie);
        }
        return;
      }
      const decoded = JSON.parse(window.atob(accessToken.split(".")[1]));
      if (Date.now() >= decoded.exp * 1000) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          localStorage.setItem("accessToken", "");
          setAccessToken("");
          return;
        }
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          localStorage.setItem("refreshToken", "");
          setAccessToken("");
          return;
        }
        setAccessToken(accessToken);
      } else {
        setUserid(decoded.userid);
        setUsername(decoded.username);
        router.push(`/user/${decoded.userid}`);
      }
    })();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        userid: userid,
        setUserid: setUserid,
        setUsername: setUsername,
        username: username,
        accessToken,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
