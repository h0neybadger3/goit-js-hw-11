import { Notify } from 'notiflix/build/notiflix-notify-aio';
import galleryTpl from '../templates/gallery-items.hbs';
import ApiService from './modules/pixabay-service';
import LoadMoreBtn from './modules/load-more-btn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
};

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

const apiService = new ApiService();

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);

let lightbox = new SimpleLightbox('.gallery a', {});

function onSearch(e) {
  e.preventDefault();

  const inputSearch = e.currentTarget.elements.searchQuery.value.trim();
  if (inputSearch === '') {
    return Notify.failure('There is nothing to search!');
  }

  apiService.query = inputSearch;
  apiService.resetPage();

  fetchGallery();
}

function fetchGallery() {
  apiService
    .fetchData()
    .then(data => {
      if (data.hits.length == 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      } else {
        Notify.info(`Hooray! We found ${apiService.hits} images.`);
      }
      return data.hits;
    })
    .then(hits => {
      clearGalleryContainer();
      appendGalleryMarkup(hits);
      loadMoreIsVisible();
      lightbox.refresh();
      endOfSearch();
    });
}

function onLoadMore() {
  loadMoreBtn.disable();
  apiService.fetchData().then(data => {
    appendGalleryMarkup(data.hits);
    loadMoreBtn.enable();
    loadMoreIsVisible();
    lightbox.refresh();
    endOfSearch();
  });
}

function appendGalleryMarkup(items) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', galleryTpl(items));
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}

function loadMoreIsVisible() {
  if (getPageCount() > apiService.options.params.page - 1) {
    loadMoreBtn.show();
  } else {
    loadMoreBtn.hide();
  }
}

function getPageCount() {
  return Math.ceil(apiService.totalHits / apiService.options.params.per_page);
}

function endOfSearch() {
  if (getPageCount() === apiService.options.params.page - 1) {
    return Notify.failure("We're sorry, but you've reached the end of search results.");
  }
}
