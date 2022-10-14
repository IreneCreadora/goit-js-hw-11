import axios from 'axios';
axios.defaults.baseURL = 'https://pixabay.com';

export class PixabayAPI {
  #page = 1;
  #query = '';
  APY_KEY = '30542917-0408f4782b72ddf35d713f34b';
  #totalPages = 0;
  #perPage = 40;
  #params = {
    params: {
      key: this.APY_KEY,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
    },
  };

  async getImages() {
    const urlAXIOS = `/api/?page=${this.#page}&q=${this.#query}`;
    const { data } = await axios.get(urlAXIOS, this.#params);
    console.log(data.hits);
    return data;
  }

  set query(newQuery) {
    this.#query = newQuery;
  }

  get query() {
    return this.#query;
  }

  incrementPage() {
    this.#page += 1;
  }

  resetPage() {
    this.#page = 1;
  }
  calculateTotalPages(total) {
    this.#totalPages = Math.ceil(total / this.#perPage);
  }

  get isShowLoadMore() {
    return this.#page < this.#totalPages;
  }
}
