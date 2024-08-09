

export default async function fetchWithTokenRetry(
  url: string,
  options: RequestInit
) {
  const response = await fetch(url, options);
  console.log(`Made request with: ${localStorage.getItem("accessToken")}`)

  if (response.status == 403) {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log(`Getting new access token with refresh token: ${refreshToken}`);
    console.log(`Current token: ${localStorage.getItem("accessToken")}`)
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
    if (refreshResponse.status == 403) {
      return refreshResponse;
    }

    const refreshJson = await refreshResponse.json();
    const accessToken = refreshJson.accessToken;
    console.log(`New access token ${accessToken}`)
    localStorage.setItem('accessToken', accessToken);

    let newHeaders = {...options.headers, 'Authorization': `Bearer ${accessToken}`};
    const newResponse = await fetch(url, {...options, headers: newHeaders});
    return newResponse;
  }

  return response;
}
