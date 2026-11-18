// ==========================================
// CONFIGURACIÓN Y ESTADO
// ==========================================
let isMotionPaused = false;
let isAudioEnabled = false;
let audioCtx = null;
let noClickCount = 0;

const FUNNY_NO_PHRASES = [
  "No",
  "¿Segura, Cami? 🥺",
  "¡Mila ya nos dio permiso! 🐾",
  "¡Mirá que la mesa en Cecilia ya está lista! 🥂",
  "¡Viernes 28 de Noviembre a las 7:00 PM!",
  "¡Ese botón no funciona, Cami! 😂",
  "¡Decí que sí y pasamos una noche mágica! ❤️"
];

// ==========================================
// CUENTA REGRESIVA A LA CITA EN CECILIA
// ==========================================
function updateCountdown() {
  const currentYear = new Date().getFullYear();
  // Noviembre es mes 10 (0-indexed: Enero=0, ..., Noviembre=10)
  let targetDate = new Date(currentYear, 10, 28, 19, 0, 0);

  const now = new Date();
  if (now > targetDate) {
    // Si ya pasó este año, target al próximo año
    targetDate = new Date(currentYear + 1, 10, 28, 19, 0, 0);
  }

  const diff = targetDate - now;

  if (diff <= 0) {
    const el = document.getElementById('countdown-timer');
    if (el) el.innerHTML = "<p style='color: var(--color-primary); font-weight: 700;'>¡Es hoy! 🥂✨</p>";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ==========================================
// INTEGRACIÓN DE CALENDARIOS (GOOGLE & APPLE)
// ==========================================
const EVENT_DETAILS = {
  title: "Cena Especial en Cecilia Parque 93 ❤️",
  description: "Nuestra cita especial en Restaurante Cecilia Parque 93. Mesa reservada para 2 (Jose Sebastian & Camila). ¡Te espero hermosa!",
  location: "Restaurante Cecilia, Parque 93, Bogotá",
  startYear: new Date().getFullYear(),
  startMonth: "11",
  startDay: "28",
  startTime: "190000",
  endTime: "220000"
};

function setupCalendarButtons() {
  // 1. Google Calendar URL
  const gcalBtn = document.getElementById('gcal-btn');
  if (gcalBtn) {
    const startDateStr = `${EVENT_DETAILS.startYear}${EVENT_DETAILS.startMonth}${EVENT_DETAILS.startDay}T${EVENT_DETAILS.startTime}`;
    const endDateStr = `${EVENT_DETAILS.startYear}${EVENT_DETAILS.startMonth}${EVENT_DETAILS.startDay}T${EVENT_DETAILS.endTime}`;
    
    const gcalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(EVENT_DETAILS.title)}` +
      `&dates=${startDateStr}/${endDateStr}` +
      `&ctz=America/Bogota` +
      `&details=${encodeURIComponent(EVENT_DETAILS.description)}` +
      `&location=${encodeURIComponent(EVENT_DETAILS.location)}`;

    gcalBtn.href = gcalUrl;
  }

  // 2. Apple Calendar (.ics generator)
  const icalBtn = document.getElementById('ical-btn');
  if (icalBtn) {
    icalBtn.addEventListener('click', () => {
      const startDateStr = `${EVENT_DETAILS.startYear}${EVENT_DETAILS.startMonth}${EVENT_DETAILS.startDay}T${EVENT_DETAILS.startTime}`;
      const endDateStr = `${EVENT_DETAILS.startYear}${EVENT_DETAILS.startMonth}${EVENT_DETAILS.startDay}T${EVENT_DETAILS.endTime}`;

      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Invitacion Cami//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `SUMMARY:${EVENT_DETAILS.title}`,
        `DESCRIPTION:${EVENT_DETAILS.description}`,
        `LOCATION:${EVENT_DETAILS.location}`,
        `DTSTART:${startDateStr}`,
        `DTEND:${endDateStr}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ];

      const icsContent = icsLines.join("\r\n");
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Cita-Cecilia-Parque-93.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }
}

// ==========================================
// WEB AUDIO API - MELODÍA Y EFECTOS ROMÁNTICOS
// ==========================================
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playNote(freq, type = 'sine', duration = 0.8, delay = 0) {
  if (!isAudioEnabled || !audioCtx) return;

  setTimeout(() => {
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }, delay * 1000);
}

// Acorde suave de avance
function playChime() {
  if (!isAudioEnabled) return;
  initAudio();
  playNote(523.25, 'sine', 0.6, 0);    // C5
  playNote(659.25, 'sine', 0.7, 0.08); // E5
  playNote(783.99, 'sine', 0.8, 0.16); // G5
  playNote(1046.50, 'sine', 1.0, 0.24); // C6
}

// Fanfarria alegre para la confirmación
function playCelebrationFanfare() {
  if (!isAudioEnabled) return;
  initAudio();
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((f, i) => {
    playNote(f, 'triangle', 1.2, i * 0.12);
  });
}

// ==========================================
// TRANSICIÓN DE ESCENAS
// ==========================================
function switchScene(currentId, nextId) {
  initAudio();
  const current = document.getElementById(currentId);
  const next = document.getElementById(nextId);

  if (current && next) {
    current.classList.remove('active-scene');
    setTimeout(() => {
      next.classList.add('active-scene');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playChime();
    }, 200);
  }
}

// ==========================================
// INTERACCIONES Y EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupCalendarButtons();

  // 1. Abrir carta
  const openEnvelopeBtn = document.getElementById('open-envelope-btn');
  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener('click', () => {
      switchScene('step-envelope', 'step-story');
    });
  }

  // 2. Flip de tarjetas
  const cards = document.querySelectorAll('.memory-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
      const isFlipped = card.classList.contains('is-flipped');
      card.setAttribute('aria-expanded', isFlipped ? 'true' : 'false');
      playNote(440, 'sine', 0.3);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // 3. Ir a invitación
  const toInvitationBtn = document.getElementById('to-invitation-btn');
  if (toInvitationBtn) {
    toInvitationBtn.addEventListener('click', () => {
      switchScene('step-story', 'step-invitation');
    });
  }

  // 4. Ir a confirmación / RSVP
  const toRsvpBtn = document.getElementById('to-rsvp-btn');
  if (toRsvpBtn) {
    toRsvpBtn.addEventListener('click', () => {
      switchScene('step-invitation', 'step-rsvp');
    });
  }

  // 5. Botón evasivo "NO"
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const decisionZone = document.getElementById('decision-zone');

  function evadeNoButton(e) {
    if (e) e.preventDefault();
    noClickCount++;

    // Cambiar frase divertida
    const phrase = FUNNY_NO_PHRASES[noClickCount % FUNNY_NO_PHRASES.length];
    noBtn.textContent = phrase;

    // Agrandar botón SÍ
    const currentScale = 1 + Math.min(noClickCount * 0.12, 0.8);
    yesBtn.style.transform = `scale(${currentScale})`;

    // Posición aleatoria dentro del contenedor
    const rect = decisionZone.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    const maxDeltaX = (rect.width - btnRect.width) / 2;
    const maxDeltaY = 60;

    let randomX = (Math.random() - 0.5) * maxDeltaX * 1.5;
    let randomY = (Math.random() - 0.5) * maxDeltaY * 1.5;

    if (window.innerWidth <= 650) {
      // En mobile, el layout es flex-direction: column (yes-btn arriba, no-btn abajo).
      // Evitamos valores negativos de randomY para que no se superponga sobre yes-btn.
      randomY = Math.max(12, Math.abs(randomY));
      randomX = Math.max(-35, Math.min(35, randomX));
    }

    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${Math.max(0.75, 1 - noClickCount * 0.05)})`;
  }

  if (noBtn) {
    noBtn.addEventListener('mouseenter', evadeNoButton);
    noBtn.addEventListener('touchstart', evadeNoButton, { passive: false });
    noBtn.addEventListener('click', evadeNoButton);
  }

  // 6. Botón SÍ y Victoria
  const successModal = document.getElementById('success-modal');
  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      playCelebrationFanfare();
      triggerConfettiExplosion();
      if (successModal) {
        successModal.classList.add('show');
        successModal.setAttribute('aria-hidden', 'false');
      }
    });
  }

  // 7. Reiniciar confeti
  const restartBtn = document.getElementById('restart-celebration-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      triggerConfettiExplosion();
      playChime();
    });
  }

  // 8. Control de Sonido (Ed Sheeran - Thinking Out Loud)
  const soundBtn = document.getElementById('sound-btn');
  const bgMusic = document.getElementById('bg-music');

  if (soundBtn && bgMusic) {
    bgMusic.volume = 0.65;

    soundBtn.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().then(() => {
          isAudioEnabled = true;
          soundBtn.querySelector('.btn-text').textContent = 'Música: On';
          soundBtn.querySelector('.btn-icon').textContent = '🔊';
          soundBtn.classList.add('playing');
        }).catch(err => {
          console.warn('Audio play failed:', err);
        });
      } else {
        bgMusic.pause();
        isAudioEnabled = false;
        soundBtn.querySelector('.btn-text').textContent = 'Música: Off';
        soundBtn.querySelector('.btn-icon').textContent = '🎵';
        soundBtn.classList.remove('playing');
      }
    });
  }

  // 9. Control de Movimiento / Accesibilidad
  const motionBtn = document.getElementById('toggle-motion-btn');
  if (motionBtn) {
    motionBtn.addEventListener('click', () => {
      isMotionPaused = !isMotionPaused;
      motionBtn.querySelector('.btn-text').textContent = isMotionPaused ? 'Reanudar' : 'Pausar';
      motionBtn.querySelector('.btn-icon').textContent = isMotionPaused ? '▶️' : '⏸️';
    });
  }
});

// ==========================================
// CANVAS AMBIENTAL: CORAZONES Y CONFETI
// ==========================================
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class FloatingHeart {
  constructor() {
    this.reset();
    this.y = Math.random() * height;
  }

  reset() {
    this.x = Math.random() * width;
    this.y = height + 20;
    this.size = Math.random() * 14 + 10;
    this.speed = Math.random() * 0.8 + 0.4;
    this.angle = Math.random() * Math.PI * 2;
    this.swingSpeed = Math.random() * 0.02 + 0.01;
    this.opacity = Math.random() * 0.4 + 0.15;
    this.color = Math.random() > 0.5 ? '230, 57, 99' : '255, 182, 193';
  }

  update() {
    if (isMotionPaused) return;
    this.y -= this.speed;
    this.angle += this.swingSpeed;
    this.x += Math.sin(this.angle) * 0.6;

    if (this.y < -30) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.beginPath();
    const d = this.size;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
    ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, 0);
    ctx.fill();
    ctx.restore();
  }
}

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 4;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 6;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 4;
    this.gravity = 0.25;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 15;
    this.colors = ['#e63963', '#ff6b8b', '#ffd166', '#06d6a0', '#118ab2', '#ffffff'];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.008;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;
    this.rotation += this.rotSpeed;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
    ctx.restore();
  }
}

const hearts = Array.from({ length: 22 }, () => new FloatingHeart());
let confettiList = [];

function triggerConfettiExplosion() {
  const originX = width / 2;
  const originY = height / 2;
  for (let i = 0; i < 180; i++) {
    confettiList.push(new ConfettiPiece(originX, originY));
  }
}

function renderLoop() {
  ctx.clearRect(0, 0, width, height);

  // Corazones ambientales
  hearts.forEach(h => {
    h.update();
    h.draw();
  });

  // Partículas de confeti
  for (let i = confettiList.length - 1; i >= 0; i--) {
    const c = confettiList[i];
    c.update();
    c.draw();
    if (c.alpha <= 0) {
      confettiList.splice(i, 1);
    }
  }

  requestAnimationFrame(renderLoop);
}

renderLoop();
