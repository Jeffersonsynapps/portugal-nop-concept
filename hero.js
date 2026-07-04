/* ── Media-cyclus: video-playlist → foto-playlist → video-playlist → … ── */
const heroVideos = [
  'assets/hero-videos/video-1.mp4'
];
const heroPhotos = [
  'assets/hero-photos/foto-1.jpg',
  'assets/hero-photos/foto-2.jpg',
  'assets/hero-photos/foto-3.jpg',
  'assets/hero-photos/foto-4.jpg',
  'assets/hero-photos/foto-5.png'
];

const PHOTO_DISPLAY = 10000; // ms volledig zichtbaar per foto
const PHOTO_FADE    = 1800;  // ms fade-in én fade-out (moet overeenkomen met CSS transition)

let videoIndex = 0;
let photoIndex = 0;
let phase      = 1; // 1 = video, 2 = foto

const videoEl = document.getElementById('hero-video');
const photoEl = document.getElementById('hero-photo');
const heroEl  = document.querySelector('.hero');

function applyPlaybackRate() {
  videoEl.playbackRate = 0.4;
}

/* ── Mobiel: hero-hoogte volgt de beeldverhouding van de actieve video/foto (volledige
   breedte, hoogte "auto") in plaats van een vaste 70vh — dat voorkomt lege crème-ruimte
   boven/onder het beeld. Op desktop blijft de vaste hoogte uit de CSS (cover, geen
   aanpassing). CSS transition op .hero { height } zorgt dat een licht andere
   beeldverhouding tussen video en foto's niet schokkerig oogt. ── */
var currentMediaNatural = { w: 0, h: 0 };

function isLetterboxMode() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function updateHeroHeight(naturalW, naturalH) {
  if (naturalW && naturalH) {
    currentMediaNatural.w = naturalW;
    currentMediaNatural.h = naturalH;
  }
  if (!isLetterboxMode()) {
    heroEl.style.height = '';
    return;
  }
  if (!currentMediaNatural.w || !currentMediaNatural.h) return;
  var heroW = heroEl.offsetWidth;
  heroEl.style.height = (heroW * (currentMediaNatural.h / currentMediaNatural.w)) + 'px';
}

window.addEventListener('resize', function() { updateHeroHeight(); });

videoEl.addEventListener('loadedmetadata', function() {
  updateHeroHeight(videoEl.videoWidth, videoEl.videoHeight);
});

videoEl.addEventListener('canplay', applyPlaybackRate);

// Fade video uit net voor het einde (0.1 videoseconde = ~0.25s real-time bij 0.4×)
videoEl.addEventListener('timeupdate', function() {
  if (phase !== 1) return;
  if (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.1) {
    videoEl.style.opacity = '0';
  }
});

// Na afloop video: volgende video of overstap naar foto-fase
videoEl.addEventListener('ended', function() {
  if (phase !== 1) return;
  videoIndex++;
  if (videoIndex < heroVideos.length) {
    videoEl.src = heroVideos[videoIndex];
    videoEl.load();
    videoEl.play().then(function() {
      applyPlaybackRate();
      videoEl.style.opacity = '1';
    }).catch(function() {});
  } else {
    phase = 2;
    photoIndex = 0;
    showPhoto(0);
  }
});

function showPhoto(index) {
  photoEl.src = heroPhotos[index];
  photoEl.getBoundingClientRect(); // force reflow zodat transition correct triggert
  photoEl.style.opacity = '1';
  photoEl.addEventListener('load', function onPhotoLoad() {
    photoEl.removeEventListener('load', onPhotoLoad);
    updateHeroHeight(photoEl.naturalWidth, photoEl.naturalHeight);
  });

  setTimeout(function() {
    // Fade out huidige foto
    photoEl.style.opacity = '0';
    setTimeout(function() {
      photoIndex++;
      if (photoIndex < heroPhotos.length) {
        showPhoto(photoIndex);
      } else {
        // Alle foto's getoond: terug naar video-fase
        photoIndex = 0;
        videoIndex = 0;
        phase = 1;
        videoEl.src = heroVideos[0];
        videoEl.load();
        videoEl.play().then(function() {
          applyPlaybackRate();
          videoEl.style.opacity = '1';
        }).catch(function() {});
      }
    }, PHOTO_FADE);
  }, PHOTO_DISPLAY);
}

// Start: eerste video laden en afspelen
videoEl.src = heroVideos[0];
videoEl.load();
videoEl.play().then(function() {
  applyPlaybackRate();
}).catch(function() {});

/* ── Word overlay ── */
const overlayWords = ['Welcome', 'Enjoy', 'Relax', 'Take your time'];
let overlayIndex = 0;
const overlayEl = document.getElementById('hero-overlay');

// De hero-container volgt nu op mobiel altijd exact de beeldverhouding van de actieve
// video/foto (zie updateHeroHeight), dus er blijft geen crème letterbox-ruimte meer
// over — de veilige zone voor de tekst-overlay is daardoor gewoon de volledige
// hero-box, zowel op mobiel als op desktop (cover, ook volledig gevuld).
function getVisibleMediaRect() {
  return { left: 0, top: 0, width: heroEl.offsetWidth, height: heroEl.offsetHeight };
}

function placeOverlayRandom() {
  var heroW = heroEl.offsetWidth;
  var heroH = heroEl.offsetHeight;
  var rect  = getVisibleMediaRect();
  var elW   = overlayEl.offsetWidth;
  var elH   = overlayEl.offsetHeight;
  // Kleinere tekst op mobiel heeft relatief minder buitenmarge nodig dan op desktop.
  var margin = isLetterboxMode() ? 12 : 20;

  var minLpx = rect.left + elW / 2 + margin;
  var maxLpx = rect.left + rect.width - elW / 2 - margin;
  var minTpx = rect.top + elH / 2 + margin;
  var maxTpx = rect.top + rect.height - elH / 2 - margin;

  // Vangnet voor een erg smalle zichtbare strook: val terug op het midden i.p.v. NaN-range.
  if (maxLpx < minLpx) { minLpx = maxLpx = rect.left + rect.width / 2; }
  if (maxTpx < minTpx) { minTpx = maxTpx = rect.top + rect.height / 2; }

  var leftPx = minLpx + Math.random() * (maxLpx - minLpx);
  var topPx  = minTpx + Math.random() * (maxTpx - minTpx);

  overlayEl.style.left = (leftPx / heroW * 100).toFixed(1) + '%';
  overlayEl.style.top  = (topPx / heroH * 100).toFixed(1) + '%';
}

function showNextOverlayWord() {
  overlayEl.style.opacity = '0';
  setTimeout(function() {
    overlayIndex = (overlayIndex + 1) % overlayWords.length;
    overlayEl.textContent = overlayWords[overlayIndex];
    overlayEl.getBoundingClientRect(); // force reflow voor juiste breedte
    placeOverlayRandom();
    overlayEl.style.opacity = '1';
  }, 1200);
}

overlayEl.textContent = overlayWords[0];
setTimeout(function() {
  placeOverlayRandom();
  overlayEl.style.opacity = '1';
  setInterval(showNextOverlayWord, 4500);
}, 400);

/* ── Lightbox: herbruikbare overlay, werkt met 1 afbeelding (plattegrond-popup) of
   meerdere met prev/next-navigatie (foto-gallery). Elke .lightbox-overlay krijgt
   sluit-gedrag (kruisje/backdrop/Escape); als de overlay ook een <img> + eventuele
   .lightbox-prev/.lightbox-next-knoppen bevat, krijgt hij daarnaast een .open(images,
   startIndex)-API met bladerfunctie. Ontbreken die knoppen/afbeelding (bv. bij de
   fotogrid-overlay), dan blijft het gewoon bij open/sluiten zonder navigatie. ── */
function initLightbox(overlay) {
  function openOverlay() {
    document.body.classList.add('modal-active');
    overlay.classList.add('is-open');
  }
  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('modal-active');
  }

  overlay.querySelector('.lightbox-close').addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeOverlay();
  });

  var api = { openBasic: openOverlay, close: closeOverlay };

  var imgEl = overlay.querySelector('.lightbox-box > img');
  if (imgEl) {
    var images = [];
    var currentIndex = 0;
    var prevBtn = overlay.querySelector('.lightbox-prev');
    var nextBtn = overlay.querySelector('.lightbox-next');

    function show(i) {
      currentIndex = (i + images.length) % images.length;
      imgEl.src = images[currentIndex];
    }

    api.open = function(imgList, startIndex) {
      images = imgList;
      show(startIndex || 0);
      openOverlay();
    };

    if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); show(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); show(currentIndex + 1); });

    document.addEventListener('keydown', function(e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft' && prevBtn) show(currentIndex - 1);
      if (e.key === 'ArrowRight' && nextBtn) show(currentIndex + 1);
    });
  }

  document.addEventListener('keydown', function(e) {
    if (overlay.classList.contains('is-open') && e.key === 'Escape') closeOverlay();
  });

  return api;
}

var lightboxRegistry = {};
document.querySelectorAll('.lightbox-overlay').forEach(function(overlay) {
  lightboxRegistry[overlay.id] = initLightbox(overlay);
});

// Bestaande single-image-triggers (bv. plattegrond-popup): pakt de <img> die al in de
// overlay staat en opent de lightbox daarmee als 1-op-1 "galerij".
document.querySelectorAll('[data-lightbox-trigger]').forEach(function(trigger) {
  var id = trigger.dataset.lightboxTrigger;
  var lb = lightboxRegistry[id];
  if (!lb) return;
  var img = document.querySelector('#' + id + ' .lightbox-box > img');
  trigger.addEventListener('click', function() {
    if (img && lb.open) {
      lb.open([img.getAttribute('src')], 0);
    } else {
      lb.openBasic();
    }
  });
});

/* ── Fotostrip: carrousel (3 naast elkaar, autoplay/pauze/pijlen/swipe) + "Gallery"-
   knop die een volledig grid-overzicht opent. Herbruikbaar per sectie — meerdere
   fotostrips op een pagina kunnen elk hun eigen container/foto's meegeven. Klikken op
   een foto (in carrousel of grid) opent de gedeelde meerdere-afbeeldingen-lightbox
   (#photo-lightbox) op de juiste positie. ── */
function initPhotoStrip(config) {
  var sectionEl = config.sectionEl;
  var images    = config.images;
  var title     = config.title;
  var intro     = config.intro;

  var track    = sectionEl.querySelector('.carousel-track');
  var prevBtn  = sectionEl.querySelector('.carousel-arrow-left');
  var nextBtn  = sectionEl.querySelector('.carousel-arrow-right');
  var galleryBtn = sectionEl.querySelector('.gallery-see-all');
  var photoLightbox = lightboxRegistry['photo-lightbox'];

  track.innerHTML = images.map(function(src, i) {
    return '<div class="carousel-slide" data-index="' + i + '"><img src="' + src + '" alt="" loading="lazy"></div>';
  }).join('');

  track.querySelectorAll('.carousel-slide').forEach(function(slide) {
    slide.addEventListener('click', function() {
      photoLightbox.open(images, Number(slide.dataset.index));
    });
  });

  function stepSize() {
    var slide = track.querySelector('.carousel-slide');
    if (!slide) return 0;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  function scrollByStep(dir) {
    var maxScroll = track.scrollWidth - track.clientWidth;
    var target = track.scrollLeft + dir * stepSize();
    if (target > maxScroll - 2) target = 0;
    else if (target < 0) target = maxScroll;
    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  var AUTOPLAY_INTERVAL = 7000;
  var RESUME_DELAY      = 4000;
  var autoplayTimer = null;
  var resumeTimer   = null;

  function stopAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(function() { scrollByStep(1); }, AUTOPLAY_INTERVAL);
  }
  function pauseAndScheduleResume() {
    stopAutoplay();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoplay, RESUME_DELAY);
  }

  prevBtn.addEventListener('click', function() { scrollByStep(-1); pauseAndScheduleResume(); });
  nextBtn.addEventListener('click', function() { scrollByStep(1); pauseAndScheduleResume(); });
  sectionEl.addEventListener('mouseenter', stopAutoplay);
  sectionEl.addEventListener('mouseleave', pauseAndScheduleResume);
  track.addEventListener('touchstart', pauseAndScheduleResume, { passive: true });
  track.addEventListener('pointerdown', pauseAndScheduleResume);

  if (galleryBtn) {
    galleryBtn.addEventListener('click', function() {
      openGalleryGrid(images, title, intro);
    });
  }

  startAutoplay();
}

function openGalleryGrid(images, title, intro) {
  var overlay = document.getElementById('gallery-grid-overlay');
  overlay.querySelector('.gallery-grid-title').textContent = title || '';
  overlay.querySelector('.gallery-grid-intro').textContent = intro || '';

  var gridEl = overlay.querySelector('.photo-grid');
  gridEl.innerHTML = images.map(function(src, i) {
    return '<div class="photo-grid-item" data-index="' + i + '"><img src="' + src + '" alt="" loading="lazy"></div>';
  }).join('');
  gridEl.querySelectorAll('.photo-grid-item').forEach(function(item) {
    item.addEventListener('click', function() {
      lightboxRegistry['photo-lightbox'].open(images, Number(item.dataset.index));
    });
  });

  lightboxRegistry['gallery-grid-overlay'].openBasic();
}
