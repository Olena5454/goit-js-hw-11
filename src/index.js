const axios = require('axios').default;
import './css/styles.css';
import Notiflix from 'notiflix';
import requestPhotos from './js/requestPhotos';
Notiflix.Notify.init({ position: 'right-top' });
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formSearch = document.getElementById('search-form');
const btnLoadMore = document.querySelector('.load-more');
const divGallery = document.querySelector('.gallery');
// const lightbox = new SimpleLightbox('.gallery a');

let pageCount = 0;
let enteredValue = '';
let listOfPhotos = '';

formSearch.addEventListener('submit', onSearchSubmit);
btnLoadMore.addEventListener('click', onLoadMoreSubmit);

removeLoadMoreBtn();

async function onSearchSubmit(e) {
  e.preventDefault();
  clearListOfPhotos();
  enteredValue = e.currentTarget.searchQuery.value.trim();
  pageCount = 1;
  await createRenderPhoto();
  updateListOfPhotos(listOfPhotos);
}

async function onLoadMoreSubmit(e) {
  removeLoadMoreBtn();
  e.preventDefault();
  pageCount += 1;
  await createRenderPhoto();
  updateListOfPhotos(listOfPhotos);
}

async function createRenderPhoto() {
  try {
    if (enteredValue != '') {
      const receivedObjectOfPhotos = await requestPhotos(
        enteredValue,
        pageCount
      );
      const totalPhotos = await receivedObjectOfPhotos.data.total;
      const arrayOfPhotos = await receivedObjectOfPhotos.data.hits;

      const checkForLoadMore = await requestPhotos(enteredValue, pageCount + 1);
      const checkArrayOfPhotos = await checkForLoadMore.data.hits;

      if (arrayOfPhotos.length > 0) {
        const {
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        } = arrayOfPhotos;
        if (pageCount === 1) {
          onCreateMessageSuccess(totalPhotos);
        }
        listOfPhotos = arrayOfPhotos.reduce(
          (markup, photo) => createMarkupList(photo) + markup,
          ''
        );
        if (checkArrayOfPhotos.length > 0) {
          addLoadMoreBtn();
        } else {
          onTheEndOfListInfo();
          removeLoadMoreBtn();
        }
      } else {
        clearListOfPhotos();
        onCreateMessageFailure();
      }
    } else {
      clearListOfPhotos();
      onCreateMessageWarning();
    }
  } catch (error) {
    console.log(error.message);
  }
}

function clearListOfPhotos() {
  removeLoadMoreBtn();
  listOfPhotos = '';
  divGallery.innerHTML = '';
}

function updateListOfPhotos(markup) {
  divGallery.insertAdjacentHTML('beforeend', markup);
  new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    enableKeyboard: true,
  }).refresh();
}

function createMarkupList({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
<div class="photo-card">
<a href="${largeImageURL}" class="gallery__item"><img src="${webformatURL}" alt="${tags}" loading="lazy" class="gallery__image" /></a>
      <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>
  `;
}

function addLoadMoreBtn() {
  btnLoadMore.classList.remove('hidden');
}

function removeLoadMoreBtn() {
  btnLoadMore.classList.add('hidden');
}

function onCreateMessageFailure() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function onCreateMessageSuccess(totalPhotos) {
  Notiflix.Notify.success(`Hooray! We found ${totalPhotos} images.`);
}

function onCreateMessageWarning() {
  Notiflix.Notify.warning('Please enter something for search');
}

function onTheEndOfListInfo() {
  Notiflix.Notify.info(
    `We're sorry, but you've reached the end of search results.`
  );
}
