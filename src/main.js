import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from "axios";

import errorIcon from '../src/img/izitoast-icon.svg';
import closeIcon from '../src/img/izitoast-close.svg';

const lightbox = new SimpleLightbox('.gallery a', { scrollZoom: false });

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const btnLoader = document.querySelector('.btn-load');

let query;
let page = 1;

form.addEventListener('submit', onFormSubmit);

async function fetchImg(query) {
if (query.trim() === '') return;

  const BASE_URL = 'https://pixabay.com/api/?';
  const PARAMS = new URLSearchParams({
    key: '42172991-e7a3268a8ccb87dfba8d5efbc',
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 15,
  });
  const url = BASE_URL + PARAMS;

try {
    const response = await axios.get(url);
    return response.data;
} catch (error) {
    console.error('Error fetching data', error);
    throw error;
}
}

async function onFormSubmit(e) {
  e.preventDefault();
  page = 1;
  query = document.querySelector('input[type="text"]').value.trim();

  if (query !== '') {
    loader.classList.remove('hidden');
    btnLoader.classList.remove('hidden');

    try {
        const data = await fetchImg(query);
        console.log('Кількість зображень:', data.totalHits);
    
        if (data.hits.length === 0) {
          iziToast.show({
            messageAlign: 'center',
            message:
              'Sorry, there are no images matching <br> your search query. Please try again!',
            messageColor: '#FFFFFF',
            messageSize: '16px',
            position: 'center',
            backgroundColor: '#EF4040',
            progressBarColor: '#B51B1B',
            iconUrl: errorIcon,
            displayMode: 'replace',
            close: false,
            closeOnEscape: true,
            pauseOnHover: false,
            buttons: [
              [
                `<button type="button" style="background-color: transparent;"><img src=${closeIcon}></button>`,
                function (instance, toast) {
                  instance.hide({ transitionOut: 'fadeOut' }, toast);
                },
              ],
            ],
          });

          form.reset();
        } else {
          gallery.innerHTML = imagesTemplate(data.hits);

          lightbox.refresh();
          btnLoader.classList.remove('hidden');
        }
      } catch (error) {
            console.error('Error fetching data:', error)
      } finally {
        loader.classList.add('hidden');
      }
  }
}
function imagesTemplate(hits) {
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
btnLoader.addEventListener('click', onButtonClick);

async function onButtonClick() {
  page += 1;

try {
    const data = await fetchImg(query);

    if (data.totalHits <= page * 15) {
        btnLoader.classList.add('hidden');
        iziToast.show({
            messageAlign: 'center',
            message: 'We\'re sorry, but you\'ve reached the end of search results.',
            messageColor: '#FFFFFF',
            messageSize: '16px',
            position: 'center',
            backgroundColor: '#EF4040',
            progressBarColor: '#B51B1B',
            iconUrl: errorIcon,
            displayMode: 'replace',
            close: false,
            closeOnEscape: true,
            pauseOnHover: false,
            buttons: [
              [
                `<button type="button" style="background-color: transparent;"><img src=${closeIcon}></button>`,
                function (instance, toast) {
                  instance.hide({ transitionOut: 'fadeOut' }, toast);
                },
              ],
            ],
          });

      } else {
        gallery.insertAdjacentHTML('beforeend', imagesTemplate(data.hits));

        lightbox.refresh();
        }
    } catch (error) {
        console.error('Error fetching data:', error)
    } finally  {
      loader.style.display = 'none';
    }
}
//SCROLL

  
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const cardHeight = entry.target.getBoundingClientRect().height;
      const offset = cardHeight * 2;
      const currentPosition = window.pageYOffset;
      const targetPosition = currentPosition + offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const lastGalleryCard = document.querySelector('.gallery-card:last-of-type');

if (lastGalleryCard) {
  observer.observe(lastGalleryCard);
}