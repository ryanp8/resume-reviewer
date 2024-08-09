"use client";

import * as React from "react";
import { decode, JwtPayload } from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { getCookie, getCookies, setCookie } from "cookies-next";

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
    if (!accessToken) {
      const accessCookie = localStorage.getItem("accessToken");
      if (accessCookie) {
        setAccessToken(accessCookie);
      }
      return;
    }
    const decoded = decode(accessToken) as JwtPayload;
    setUserid(decoded.userid);
    setUsername(decoded.username);
    router.push(`/user/${decoded.userid}`);
    return;

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
