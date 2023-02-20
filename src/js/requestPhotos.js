import axios from 'axios';
// const axios = require('axios').default;

export default async function requestPhotos(query, page) {
  const URL = `https://pixabay.com/api/?key=33753646-de05ac34254295db0a3c66720&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;
  const response = await axios.get(URL);
  return response;
}
