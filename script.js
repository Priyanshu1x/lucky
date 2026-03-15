// ============================================================
//  SCRIPT.JS — Lucky's Personal Website
//  All interactivity: hearts, music, notes, birthday mode, etc.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. BIRTHDAY MODE ─────────────────────────────────────
  const today = new Date();
  const isBirthday = today.getMonth() + 1 === BIRTHDAY.month && today.getDate() === BIRTHDAY.day;

  if (isBirthday) {
    document.body.classList.add('birthday-mode');
    const banner = document.getElementById('birthday-banner');
    banner.classList.add('visible');
    banner.innerHTML = `🎂 Happy Birthday, ${HER_NAME}! 🎂 &nbsp;|&nbsp; ${BIRTHDAY_MESSAGE} &nbsp;|&nbsp; 🎁✨🎉`;
    spawnBirthdaySparkles();
  }

  // ── 2. BACKGROUND PHOTO SLIDESHOW ────────────────────────
  const bgSlideshow = document.getElementById('bg-slideshow');
  if (PHOTOS && PHOTOS.length > 0) {
    document.getElementById('bg-gradient').style.display = 'none';
    PHOTOS.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'bg-slide' + (i === 0 ? ' active' : '');
      div.style.backgroundImage = `url('${src}')`;
      bgSlideshow.appendChild(div);
    });
    if (PHOTOS.length > 1) {
      let current = 0;
      setInterval(() => {
        const slides = document.querySelectorAll('.bg-slide');
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
      }, 6000);
    }
  }

  // ── 3. FLOATING HEARTS ───────────────────────────────────
  const canvas = document.getElementById('hearts-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const hearts = [];
  class Heart {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.size = Math.random() * 14 + 6;
      this.speed = Math.random() * 1.5 + 0.4;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.drift = (Math.random() - 0.5) * 0.8;
      this.color = [`rgba(232,115,138,`, `rgba(192,54,90,`, `rgba(247,197,208,`, `rgba(212,168,67,`][Math.floor(Math.random() * 4)];
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(this.x, this.y);
      ctx.bezierCurveTo(this.x, this.y - s * 0.3, this.x - s * 0.5, this.y - s * 0.8, this.x - s * 0.5, this.y - s * 1.1);
      ctx.bezierCurveTo(this.x - s * 0.5, this.y - s * 1.55, this.x, this.y - s * 1.55, this.x, this.y - s * 1.1);
      ctx.bezierCurveTo(this.x, this.y - s * 1.55, this.x + s * 0.5, this.y - s * 1.55, this.x + s * 0.5, this.y - s * 1.1);
      ctx.bezierCurveTo(this.x + s * 0.5, this.y - s * 0.8, this.x, this.y - s * 0.3, this.x, this.y);
      ctx.fill();
      ctx.restore();
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.opacity -= 0.0008;
      if (this.y < -20 || this.opacity <= 0) this.reset();
    }
  }

  // create initial hearts
  for (let i = 0; i < 30; i++) {
    const h = new Heart();
    h.y = Math.random() * canvas.height; // spread vertically on load
    hearts.push(h);
  }

  function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(h => { h.update(); h.draw(); });
    requestAnimationFrame(animateHearts);
  }
  animateHearts();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // ── 4. MUSIC PLAYER ──────────────────────────────────────
  let currentTrack = 0;
  let isPlaying = false;
  const audio = new Audio();
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const trackNameEl = document.getElementById('track-name');
  const trackArtistEl = document.getElementById('track-artist');
  const playlistEl = document.getElementById('playlist');
  const bars = document.querySelectorAll('.bar');

  function loadTrack(index) {
    const track = MUSIC_LIST[index];
    if (!track) return;
    audio.src = track.url;
    trackNameEl.textContent = track.title;
    trackArtistEl.textContent = track.artist;
    document.querySelectorAll('.playlist-item').forEach((li, i) => {
      li.classList.toggle('active', i === index);
    });
  }

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      playBtn.innerHTML = '▶';
      bars.forEach(b => b.classList.remove('playing'));
    } else {
      audio.play().catch(() => {});
      playBtn.innerHTML = '⏸';
      bars.forEach(b => b.classList.add('playing'));
    }
    isPlaying = !isPlaying;
  }

  function formatTime(t) {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => {
    currentTrack = (currentTrack - 1 + MUSIC_LIST.length) % MUSIC_LIST.length;
    loadTrack(currentTrack);
    if (isPlaying) audio.play().catch(() => {});
  });
  nextBtn.addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % MUSIC_LIST.length;
    loadTrack(currentTrack);
    if (isPlaying) audio.play().catch(() => {});
  });
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  });
  progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });
  audio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % MUSIC_LIST.length;
    loadTrack(currentTrack);
    audio.play().catch(() => {});
  });

  // Build playlist
  if (MUSIC_LIST.length > 0) {
    MUSIC_LIST.forEach((track, i) => {
      const li = document.createElement('li');
      li.className = 'playlist-item' + (i === 0 ? ' active' : '');
      li.innerHTML = `<span class="track-num">${String(i + 1).padStart(2, '0')}</span>${track.title} <span style="color:var(--text-muted);font-size:0.8rem">${track.artist}</span>`;
      li.addEventListener('click', () => {
        currentTrack = i;
        loadTrack(i);
        if (!isPlaying) togglePlay(); else audio.play().catch(() => {});
      });
      playlistEl.appendChild(li);
    });
    loadTrack(0);
  }

  // ── 5. DAILY NOTES ───────────────────────────────────────
  const notesGrid = document.getElementById('notes-grid');
  if (DAILY_NOTES && DAILY_NOTES.length > 0) {
    DAILY_NOTES.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card glass fade-in';
      const dateObj = new Date(note.date);
      const dateStr = dateObj.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      card.innerHTML = `
        <div class="note-meta">
          <div class="note-dot"></div>
          <span class="note-date">${dateStr}</span>
          <span class="note-time">· ${note.time}</span>
        </div>
        <p class="note-text">${note.text}</p>
      `;
      notesGrid.appendChild(card);
    });
  } else {
    notesGrid.innerHTML = `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1">Add your first note in data.js 💕</p>`;
  }

  // ── 6. SPECIAL UPDATES ───────────────────────────────────
  const updatesList = document.getElementById('updates-list');
  if (SPECIAL_UPDATES && SPECIAL_UPDATES.length > 0) {
    SPECIAL_UPDATES.forEach((update, i) => {
      const div = document.createElement('div');
      div.className = 'update-card glass fade-in';
      const icons = ['💌', '✨', '🌸', '🎁', '🌺', '💫'];
      div.innerHTML = `
        <div class="update-icon">${icons[i % icons.length]}</div>
        <div class="update-body">
          <div class="update-title">${update.title}</div>
          <div class="update-date">${update.date}</div>
          <div class="update-text">${update.text}</div>
        </div>
      `;
      updatesList.appendChild(div);
    });
  }

  // ── 7. TIMELINE ──────────────────────────────────────────
  const timeline = document.getElementById('timeline');
  if (TIMELINE && TIMELINE.length > 0) {
    TIMELINE.forEach(item => {
      const div = document.createElement('div');
      div.className = 'timeline-item';
      div.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-text">${item.text}</div>
      `;
      timeline.appendChild(div);
    });
  }

  // ── 8. TRAVEL PLACES ─────────────────────────────────────
  const travelGrid = document.getElementById('travel-grid');
  if (TRAVEL_PLACES && TRAVEL_PLACES.length > 0) {
    TRAVEL_PLACES.forEach(place => {
      const div = document.createElement('div');
      div.className = 'travel-card glass fade-in';
      div.innerHTML = `
        <span class="travel-emoji">${place.emoji}</span>
        <div class="travel-name">${place.name}</div>
        <div class="travel-note">${place.note}</div>
      `;
      travelGrid.appendChild(div);
    });
  }

  // ── 9. SECRET MESSAGE ────────────────────────────────────
  const secretBtn = document.getElementById('secret-btn');
  const secretPasswordBox = document.getElementById('secret-password-box');
  const secretInput = document.getElementById('secret-input');
  const secretSubmitBtn = document.getElementById('secret-submit-btn');
  const secretError = document.getElementById('secret-error');
  const secretBox = document.getElementById('secret-message-box');

  secretBtn.addEventListener('click', () => {
    if (secretBox.classList.contains('visible')) {
      // Hide the message
      secretBox.classList.remove('visible');
      secretPasswordBox.style.display = 'none';
      secretInput.value = '';
      secretError.style.display = 'none';
      secretBtn.querySelector('span').textContent = 'Reveal Secret Message 💌';
    } else if (secretPasswordBox.style.display === 'block') {
      // Hide password box if already open
      secretPasswordBox.style.display = 'none';
    } else {
      // Show password box
      secretPasswordBox.style.display = 'block';
      secretPasswordBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      secretInput.focus();
    }
  });

  const checkPassword = () => {
    if (secretInput.value === SECRET_CODE) {
      secretPasswordBox.style.display = 'none';
      secretError.style.display = 'none';
      secretBox.classList.add('visible');
      secretBox.querySelector('.letter-text').innerHTML = SECRET_MESSAGE;
      secretBtn.querySelector('span').textContent = 'Close the letter 💌';
      secretBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      secretError.style.display = 'block';
    }
  };

  secretSubmitBtn.addEventListener('click', checkPassword);
  secretInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
  });

  // ── 10. SCROLL ANIMATIONS (Intersection Observer) ────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in, .timeline-item').forEach(el => observer.observe(el));

  // ── 11. BIRTHDAY SPARKLES ────────────────────────────────
  function spawnBirthdaySparkles() {
    const sparkEnough = ['✨', '🎉', '🎂', '💛', '⭐', '🌟', '🎈'];
    setInterval(() => {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.textContent = sparkEnough[Math.floor(Math.random() * sparkEnough.length)];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 3000);
    }, 400);
  }

  // ── 12. NAV ACTIVE STATE ON SCROLL ──────────────────────
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    // Fade in nav shadow on scroll
    const nav = document.getElementById('nav');
    nav.style.background = window.scrollY > 60
      ? 'rgba(13,4,8,0.85)'
      : 'rgba(13,4,8,0.6)';
  }, { passive: true });

});
