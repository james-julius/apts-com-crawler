export function getNextPageUrl(url: string) {
  const pattern =
    /https:\/\/www\.apartments\.com\/los-angeles-ca\/(\d+)\/?(\?|$)/;
  const match = url.match(pattern);

  if (match) {
    const currentPage = parseInt(match[1], 10);
    const nextPage = currentPage + 1;
    const newUrl = url.replace(
      pattern,
      `https://www.apartments.com/los-angeles-ca/${nextPage}/$2`,
    );
    return newUrl;
  } else {
    // Return the original URL if it doesn't match the pattern
    return url;
  }
}
