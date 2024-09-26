export default async function refreshAccessToken() {
  const refreshToken = localStorage.get("refreshToken");
  if (!refreshToken) {
    return null;
  }

  const refreshResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  if (refreshResponse.status == 403) {
    return null;
  }

  const refreshJson = await refreshResponse.json();
  const accessToken = refreshJson.accessToken;

  return accessToken;
}