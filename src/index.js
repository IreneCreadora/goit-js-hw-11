import Notiflix, { Notify } from 'notiflix';
import { notifyOptions } from './js/notify-options';
import { createMarkup } from './js/createMarkup';
import { PixabayAPI } from './js/pixabayAPI';
import { refs } from './js/refs';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pixabay = new PixabayAPI();

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const callback = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting && entry.intersectionRect.bottom > 550) {
      // if (entry.isIntersecting) {
      pixabay.incrementPage();
      observer.unobserve(entry.target);

      try {
        const { hits } = await pixabay.getImages();
        const markup = [...hits].map(createMarkup);
        refs.gallery.insertAdjacentHTML('beforeend', markup.join(''));
        createLightBox();
        // lightBox.refresh();

        if (pixabay.isShowLoadMore) {
          const target = document.querySelector('.gallery-card:last-child');
          io.observe(target);
        }
      } catch (error) {
        Notify.failure(`${error.message}`, notifyOptions);
        clearPage();
      }
    }
  });
};
const io = new IntersectionObserver(callback, options);

async function onFormSubmit(e) {
  e.preventDefault();

  const {
    elements: { searchQuery },
  } = e.currentTarget;
  const userQuery = searchQuery.value.trim().toLowerCase().split(' ').join('+');
  if (!userQuery) {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`,
      notifyOptions
    );
    return;
  }
  pixabay.query = userQuery;

  clearPage();

  try {
    const { hits, totalHits } = await pixabay.getImages();
    if (hits.length === 0) {
      Notify.info(
        `Sorry, there are no images matching your search query "${userQuery}". Please try again.  `,
        notifyOptions
      );
      return;
    }
    const markup = [...hits].map(createMarkup);
    refs.gallery.insertAdjacentHTML('beforeend', markup.join(''));
    createLightBox();

    pixabay.calculateTotalPages(totalHits);

    Notify.success(
      `Hooray! We found ${totalHits} images by ${userQuery}`,
      notifyOptions
    );

    if (pixabay.isShowLoadMore) {
      const target = document.querySelector('.gallery-card:last-child');
      console.log(target);

      io.observe(target);
    }
  } catch (error) {
    Notify.failure(`${error.message}`, notifyOptions);
    clearPage();
  }
}

function onLoadMore() {
  pixabay.incrementPage();

  if (!pixabay.isShowLoadMore) {
    Notify.info(
      `We're sorry, but you've reached the end of search results.`,
      notifyOptions
    );
    refs.loadMoreBtn.classList.add('is-hidden');
  }

  pixabay
    .getImages()
    .then(({ hits }) => {
      const markup = [...hits].map(createMarkup);
      refs.gallery.insertAdjacentHTML('beforeend', markup.join(''));
      // lightBox.refresh();
    })
    .catch(error => {
      Notify.failure(`${error.message}`, notifyOptions);
      clearPage();
    });
}

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function clearPage() {
  pixabay.resetPage();
  refs.gallery.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');
}

function createLightBox() {
  lightBox = new SimpleLightbox('.gallery a');
}
