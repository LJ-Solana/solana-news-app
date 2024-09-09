import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function fetchNewsFromAPI() {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ByteNews/1.0',
      },
    });
    // Filter out articles without images
    const articlesWithImages = response.data.articles.filter((article: { urlToImage: string | null }) => article.urlToImage);
    return articlesWithImages;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
