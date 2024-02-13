import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from "axios";

import errorIcon from '../src/img/izitoast-icon.svg';
import closeIcon from '../src/img/izitoast-close.svg';

const lightbox = new SimpleLightbox('.gallery a');

const refs = {
form: document.querySelector('.form'),
gallery: document.querySelector('.gallery'),
loader: document.querySelector('.loader'),
btnLoader: document.querySelector('.btn-load'),
}


let query = null;
let currentPage = null;
let totalPages = 0;
const per_page = 15;

refs.form.addEventListener('submit', onFormSubmit);
refs.btnLoader.addEventListener('click', onBtnLoadMore);

async function onBtnLoadMore(e) {
  e.preventDefault();
  currentPage += 1;
  console.log('Поточна сторінка:', currentPage);

  refs.loader.classList.remove('hidden');

  try{
    const data = await fetchImg(query);
    if (data.totalPages === 0) {
      refs.loader.classList.add('hidden');
      refs.btnLoader.classList.add('hidden');
      return showError(message);
    }
  const markup = galleryTemplate(data.hits);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
  checkBtnStatus(data);

  const card = refs.gallery.lastElementChild;
  const cardSize = card.getBoundingClientRect();
  const topImagePosition = cardSize.top;
  smoothScroll(topImagePosition);

  } catch (error) {
    showError(error);
  }
  refs.loader.classList.add('hidden');
  
}

async function onFormSubmit(e) {
  e.preventDefault();
  query = document.querySelector('input[type="text"]').value.trim();
  currentPage = 1;

  refs.loader.classList.remove('hidden');
  refs.gallery.innerHTML = '';
  try {
    const data = await fetchImg(query);
    console.log('Кількість зображень:', data.totalHits);
    if (data.totalHits === 0) {
      refs.loader.classList.add('hidden');
      refs.btnLoader.classList.add('hidden');
      return showError(
        'Sorry, there are no images matching <br/> your search query. Please try again!'
      );
    }
    const markup = galleryTemplate(data.hits);
    refs.gallery.innerHTML = markup;
    lightbox.refresh();
    checkBtnStatus(data);
  } catch (error) {
    console.error('Error fetching data', error);
    throw error;
  }
  refs.loader.classList.add('hidden');
  lightbox.refresh();
}

async function fetchImg(query) {
const url = 'https://pixabay.com/api/?';
const response = await axios.get(url, {
  params: {
    key: '42172991-e7a3268a8ccb87dfba8d5efbc',
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    currentPage: currentPage,
    per_page: per_page,
  },
});
return response.data;
}

function galleryTemplate(hits) {
  return hits.map(imgTemplate).join('');
}

function imgTemplate(hit) {
  return `<li class="gallery-card">
<a href="${hit.largeImageURL}" data-lightbox="image">
    <img class="gallery-image"
    src="${hit.webformatURL}" alt="${hit.tags}">
</a>
<div class="details">
    <p><strong>Likes:</strong> ${hit.likes}</p>
    <p><strong>Views:</strong> ${hit.views}</p>
    <p><strong>Comments:</strong> ${hit.comments}</p>
    <p><strong>Downloads:</strong> ${hit.downloads}</p>
</div>
</li>`;
}

function showError(message) {
  iziToast.error({
    message,
    messageAlign: 'center',
    position: 'center',
    messageColor: '#ffffff',
    messageSize: '16px',
    backgroundColor: '#ef4040',
    progressBarColor: '#B51B1B',
    iconColor: '#ffffff',
    iconUrl: errorIcon,
    timeout: 5000,
    displayMode: 'replace',
    close: false,
    closeOnEscape: true,
    buttons: [
      [
        `<button type="button" style="background-color: transparent;"><img src=${closeIcon}></button>`,
        function (instance, toast) {
          instance.hide({ transitionOut: 'fadeOut' }, toast);
        },
      ],
    ],
  });
}

function checkBtnStatus(data) {
  totalPages = Math.ceil(data.totalHits / per_page);
  const isLastPage = totalPages === currentPage;
  if (isLastPage) {
    refs.btnLoader.classList.add('hidden');
    showError("We're sorry, but you've reached the end of search results.");
  } else {
    refs.btnLoader.classList.remove('hidden');
  }
}

function smoothScroll(topPosition) {
  window.scrollBy({
    top: topPosition,
    left: 0,
    behavior: 'smooth'
  });
}


