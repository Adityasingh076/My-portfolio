
const BASE_URL = 'https://portfolio-backend-eo17.onrender.com';
const API = `${BASE_URL}/api`;

const trail = document.getElementById('cursorTrail');
let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});
setInterval(() => {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  trail.style.left = tx + 'px';
  trail.style.top = ty + 'px';
}, 16);

// Cursor grow on interactive elements
document.addEventListener('mouseover', e => {
  if (e.target.matches('a, button, .skill-tag, .project-card, .cert-card')) {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursor.style.opacity = '0.6';
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.matches('a, button, .skill-tag, .project-card, .cert-card')) {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.opacity = '1';
  }
});

// ─── MOBILE MENU ─────────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ─── TYPEWRITER ──────────────────────────────────────────
const typewriterPhrases = [
  'Building web apps that matter.',
  'JavaScript & Java enthusiast.',
  'Geospatial & 3D visualization dev.',
  'DRDO intern · B.Tech CSE · 2026.',
  'Turning ideas into real products.'
];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
function typewriter() {
  const el = document.getElementById('typewriterText');
  if (!el) return;
  const current = typewriterPhrases[phraseIndex];
  if (isDeleting) {
    el.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    el.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  let delay = isDeleting ? 40 : 80;
  if (!isDeleting && charIndex === current.length) {
    delay = 2200; isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
    delay = 400;
  }
  setTimeout(typewriter, delay);
}
setTimeout(typewriter, 1200);

// ─── NAV SCROLL ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ─── COUNTER ANIMATION ───────────────────────────────────
function animateCount(el, target, duration = 1400) {
  let start = 0;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ─── SCROLL REVEAL ───────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function initReveal() {
  document.querySelectorAll('.project-card, .cert-card, .timeline-card, .about-grid').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.65s ease ${i * 0.08}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`;
    revealObserver.observe(el);
  });
}

// ─── LOAD ALL DATA ───────────────────────────────────────
async function loadAll() {
  try {
    const [profile, projects, certs, resume, stats] = await Promise.all([
      fetch(`${API}/profile`).then(r => r.json()),
      fetch(`${API}/projects`).then(r => r.json()),
      fetch(`${API}/certificates`).then(r => r.json()),
      fetch(`${API}/resume`).then(r => r.json()),
      fetch(`${API}/stats`).then(r => r.json()),
    ]);
    renderProfile(profile);
    renderProjects(projects);
    renderCerts(certs);
    renderResume(resume);
    renderStats(stats);
    populateAdmin(profile);
    renderAdminLists(projects, certs);
  } catch (err) {
    console.warn('Backend offline — using demo mode');
    loadDemo();
  }
  setTimeout(initReveal, 100);
}

// ─── DEMO MODE (uses real resume data) ───────────────────
function loadDemo() {
  const profile = {
    name: "Aditya Singh",
    title: "B.Tech Final Year Student",
    branch: "Computer Science & Engineering",
    university: "Eshan College of Engineering, Mathura",
    bio: "Software Engineering undergraduate with hands-on experience in Java, JavaScript, and geospatial data visualization. Skilled in developing responsive web applications and interactive 3D simulations. Passionate about building scalable, user-focused solutions and continuously improving through real-world projects.",
    email: "adisingh956@gmail.com",
    phone: "+91 9411970797",
    github: "https://github.com/Adityasingh076",
    linkedin: "https://www.linkedin.com/in/adi-singh-86b730298",
    location: "Agra, Uttar Pradesh, India",
    skills: ["Java", "JavaScript", "HTML5", "CSS3", "SQL", "Three.js", "Node.js", "Git", "GitHub", "VS Code", "IntelliJ IDEA", "MySQL", "OOP", "Data Structures", "Geospatial Processing"]
  };
  const projects = [
    {
      id: 1,
      title: "3D UAV Flight Path Visualizer",
      description: "Interactive 3D simulation system to visualize UAV and satellite trajectories. Built a data pipeline processing CSV-based geospatial datasets with coordinate transformation and computational geometry to map GPS data into 3D space.",
      tech: ["Three.js", "JavaScript", "Geospatial", "3D Visualization"],
      github: "https://github.com/Adityasingh076/3D-UAV-Flight-Path-Visualizer.git",
      live: null,
      featured: true,
      image: null
    },
    {
      id: 2,
      title: "BrewTech Coffee House",
      description: "Responsive e-commerce web application for a coffee brand. Features a client-side cart system, dynamic product filtering, modals, and a real-time billing & invoice generation module.",
      tech: ["JavaScript", "HTML5", "CSS3", "DOM API", "localStorage"],
      github: "https://github.com/Adityasingh076/BREW-TECH.git",
      live: null,
      featured: true,
      image: null
    },
    {
      id: 3,
      title: "Smart Bottle Turbidity Visualizer",
      description: "Data visualization system to monitor and interpret water turbidity levels in real time. Uses dynamic JavaScript data handling, interactive UI components, and data mapping to convert raw sensor inputs into meaningful visual insights.",
      tech: ["JavaScript", "Data Visualization", "Frontend Engineering"],
      github: "https://github.com/Adityasingh076/Smart-Bottle-Turbidity-Visualizer.git",
      live: null,
      featured: false,
      image: null
    },
    {
      id: 4,
      title: "SocketChat",
      description: "Real-time multi-room chat application built with Node.js, featuring persistent message storage with SQLite and a clean dark UI with room selection.",
      tech: ["Node.js", "Socket.io", "SQLite", "JavaScript"],
      github: "#",
      live: null,
      featured: false,
      image: null
    }
  ];
  const certs = [
    { id: 1, title: "Software Engineering Internship", issuer: "ADRDE – DRDO, Agra", date: "2025-06", credentialId: "DRDO-2025" },
    { id: 2, title: "Full Stack Development", issuer: "Add from Admin Panel", date: "2024-01", credentialId: "" }
  ];
  // Load locally saved projects if any
  const savedProjects = JSON.parse(localStorage.getItem('portfolio_projects') || 'null');
  if (savedProjects && savedProjects.length) projects = savedProjects;

  renderProfile(profile);
  renderProjects(projects);
  renderCerts(certs);
  renderStats({ projects: projects.length, certificates: certs.length, skills: 15 });
  populateAdmin(profile);
  renderAdminLists(projects, certs);
}

// ─── RENDER PROFILE ──────────────────────────────────────
function renderProfile(p) {
  document.getElementById('heroTag').innerHTML = `<span class="tag-dot"></span> ${p.branch} · ${p.title}`;
  document.getElementById('heroName').innerHTML =
    `<span class="name-line">${p.name.split(' ')[0]}</span><span class="name-line accent">${p.name.split(' ').slice(1).join(' ')}</span>`;
  document.getElementById('aboutBio').textContent = p.bio;
  document.getElementById('metaUniv').textContent = p.university;
  document.getElementById('metaBranch').textContent = p.branch + ' (2022–2026)';
  document.getElementById('metaLoc').textContent = p.location;
  document.getElementById('metaEmail').textContent = p.email;
  if (document.getElementById('cinfoEmailTxt')) document.getElementById('cinfoEmailTxt').textContent = p.email;
  if (document.getElementById('cinfoPhoneTxt')) document.getElementById('cinfoPhoneTxt').textContent = p.phone;
  document.getElementById('footerName').textContent = p.name;
  document.title = `${p.name} — Portfolio`;
  document.getElementById('avatarInitials').textContent = p.name.split(' ').map(n => n[0]).join('');
  document.getElementById('linkGithub').href = p.github || '#';
  document.getElementById('linkLinkedin').href = p.linkedin || '#';
  document.getElementById('linkEmail').href = `mailto:${p.email}`;
  const cloud = document.getElementById('skillsCloud');
  cloud.innerHTML = '';
  (p.skills || []).forEach(s => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag'; tag.textContent = s;
    cloud.appendChild(tag);
  });
}

// ─── RENDER PROJECTS ─────────────────────────────────────
const projectEmojis = { 'three.js': '🌐', 'geospatial': '🛰', 'java': '☕', 'node': '🟢', 'react': '⚛', 'python': '🐍', 'socket': '⚡', 'coffee': '☕', 'water': '💧' };
function getProjectEmoji(tech = [], title = '') {
  const combined = [...tech, title].join(' ').toLowerCase();
  for (const [key, emoji] of Object.entries(projectEmojis)) {
    if (combined.includes(key)) return emoji;
  }
  return '💻';
}

function getImageUrl(imgPath) {
  if (!imgPath) return null;
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('blob:')) return imgPath;
  return BASE_URL + imgPath;
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!projects.length) {
    grid.innerHTML = '<p class="no-items">No projects yet. Add from Admin panel!</p>';
    return;
  }
  grid.innerHTML = projects.map(p => `
    <div class="project-card ${p.featured ? 'featured' : ''}">
      <div class="project-thumb">
        ${p.image ? `<img src="${getImageUrl(p.image)}" alt="${p.title}"/>` : `<span style="position:relative;z-index:1">${getProjectEmoji(p.tech, p.title)}</span>`}
      </div>
      <div class="project-body">
        <div class="project-tech">${(p.tech || []).map(t => `<span class="tech-badge">${t}</span>`).join('')}</div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-links">
          ${p.github && p.github !== '#' ? `<a href="${p.github}" target="_blank" class="project-link">⌥ GitHub ↗</a>` : ''}
          ${p.live ? `<a href="${p.live}" target="_blank" class="project-link">↗ Live Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ─── RENDER CERTIFICATES ─────────────────────────────────
function getCertEmoji(issuer = '') {
  const i = issuer.toLowerCase();
  if (i.includes('drdo') || i.includes('adrde')) return '🛡';
  if (i.includes('aws') || i.includes('amazon')) return '☁';
  if (i.includes('google')) return '🔵';
  if (i.includes('meta') || i.includes('facebook')) return '⬡';
  if (i.includes('coursera') || i.includes('udemy')) return '📚';
  if (i.includes('microsoft')) return '🪟';
  return '🎓';
}
function formatDate(d) {
  if (!d) return '';
  try {
    const date = new Date(d + '-01');
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  } catch { return d; }
}

function renderCerts(certs) {
  const grid = document.getElementById('certsGrid');
  if (!certs.length) {
    grid.innerHTML = '<p class="no-items">No certificates yet. Add from Admin!</p>';
    return;
  }
  grid.innerHTML = certs.map(c => `
    <div class="cert-card">
      <div class="cert-icon">
        ${c.image ? `<img src="${c.image}" alt="${c.title}"/>` : getCertEmoji(c.issuer)}
      </div>
      <div class="cert-info">
        <div class="cert-title">${c.title}</div>
        <div class="cert-issuer">${c.issuer}</div>
        <div class="cert-date">${formatDate(c.date)}</div>
        ${c.credentialId ? `<div class="cert-id">ID: ${c.credentialId}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ─── RENDER RESUME ───────────────────────────────────────
function renderResume(data) {
  const btn = document.getElementById('heroResumeBtn');
  if (data && data.resume) {
    btn.href = `${API}/resume/download`;
    btn.setAttribute('download', '');
    btn.textContent = '↓ Resume';
    btn.onclick = null;
  } else {
    btn.href = '#';
    btn.removeAttribute('download');
    btn.onclick = e => { e.preventDefault(); toggleAdmin(); switchTab('resume'); };
    btn.textContent = 'Upload Resume';
  }
}

// ─── RENDER STATS ────────────────────────────────────────
function renderStats(stats) {
  setTimeout(() => {
    animateCount(document.getElementById('statProjects'), stats.projects || 0);
    animateCount(document.getElementById('statCerts'), stats.certificates || 0);
    animateCount(document.getElementById('statSkills'), stats.skills || 0);
  }, 700);
}

// ─── CONTACT ─────────────────────────────────────────────
async function sendMessage(e) {
  e.preventDefault();
  const btn = document.getElementById('sendBtn');
  const status = document.getElementById('formStatus');
  btn.textContent = 'Sending...'; btn.disabled = true;
  try {
    const res = await fetch(`${API}/contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('msgName').value,
        email: document.getElementById('msgEmail').value,
        message: document.getElementById('msgBody').value
      })
    });
    const data = await res.json();
    if (data.success) {
      status.textContent = '✓ Message sent! I\'ll get back to you soon.';
      status.className = 'form-status success';
      document.getElementById('contactForm').reset();
    } else throw new Error();
  } catch {
    status.textContent = '✓ Message received (demo mode).';
    status.className = 'form-status success';
    document.getElementById('contactForm').reset();
  } finally {
    btn.textContent = 'Send Message →'; btn.disabled = false;
    setTimeout(() => { status.textContent = ''; }, 5000);
  }
}

// ─── ADMIN PANEL ─────────────────────────────────────────
// ─── ADMIN PASSWORD ──────────────────────────────────────
const ADMIN_PASSWORD = 'aditya@2025'; // <-- apna password yahan set karo

function toggleAdmin() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
  if (!isLoggedIn) {
    document.getElementById('loginOverlay').classList.add('open');
    setTimeout(() => document.getElementById('adminPassword').focus(), 100);
  } else {
    document.getElementById('adminOverlay').classList.toggle('open');
  }
}

function checkLogin() {
  const pwd = document.getElementById('adminPassword').value;
  if (pwd === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    document.getElementById('loginOverlay').classList.remove('open');
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('adminOverlay').classList.add('open');
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
}
function closeAdminIfOutside(e) {
  if (e.target === document.getElementById('adminOverlay')) toggleAdmin();
}
function switchTab(name) {
  const names = ['profile', 'projects', 'certs', 'resume'];
  document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', names[i] === name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
}

// ─── ADMIN: POPULATE PROFILE ─────────────────────────────
function populateAdmin(p) {
  document.getElementById('adName').value = p.name || '';
  document.getElementById('adTitle').value = p.title || '';
  document.getElementById('adBranch').value = p.branch || '';
  document.getElementById('adUniv').value = p.university || '';
  document.getElementById('adBio').value = p.bio || '';
  document.getElementById('adEmail').value = p.email || '';
  document.getElementById('adPhone').value = p.phone || '';
  document.getElementById('adGithub').value = p.github || '';
  document.getElementById('adLinkedin').value = p.linkedin || '';
  document.getElementById('adLocation').value = p.location || '';
  document.getElementById('adSkills').value = (p.skills || []).join(', ');
}
async function saveProfile() {
  const profile = {
    name: document.getElementById('adName').value,
    title: document.getElementById('adTitle').value,
    branch: document.getElementById('adBranch').value,
    university: document.getElementById('adUniv').value,
    bio: document.getElementById('adBio').value,
    email: document.getElementById('adEmail').value,
    phone: document.getElementById('adPhone').value,
    github: document.getElementById('adGithub').value,
    linkedin: document.getElementById('adLinkedin').value,
    location: document.getElementById('adLocation').value,
    skills: document.getElementById('adSkills').value.split(',').map(s => s.trim()).filter(Boolean)
  };
  try {
    await fetch(`${API}/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
  } catch {}
  renderProfile(profile);
  showToast('Profile saved!');
}

// ─── ADMIN: ADD PROJECT ──────────────────────────────────
async function addProject() {
  const title = document.getElementById('pjTitle').value.trim();
  if (!title) return showToast('Title required', true);
  const data = {
    title,
    description: document.getElementById('pjDesc').value,
    tech: document.getElementById('pjTech').value.split(',').map(s => s.trim()).filter(Boolean),
    github: document.getElementById('pjGithub').value,
    live: document.getElementById('pjLive').value,
    featured: document.getElementById('pjFeatured').checked
  };
  const imageFile = document.getElementById('pjImage').files[0];

  // Read image as base64 so it works without backend too
  let imageBase64 = null;
  if (imageFile) {
    imageBase64 = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });
  }

  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) formData.append('image', imageFile);
  let projects;
  try {
    await fetch(`${API}/projects`, { method: 'POST', body: formData });
    const res = await fetch(`${API}/projects`);
    projects = await res.json();
  } catch {
    // Backend offline — save with base64 image to localStorage
    const saved = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
    const newProject = { id: Date.now(), ...data, image: imageBase64 };
    saved.push(newProject);
    localStorage.setItem('portfolio_projects', JSON.stringify(saved));
    projects = saved;
  }
  renderProjects(projects);
  renderAdminLists(projects, null);
  ['pjTitle','pjDesc','pjTech','pjGithub','pjLive'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pjImage').value = '';
  setTimeout(initReveal, 100);
  showToast('Project added!');
}
async function deleteProject(id) {
  try {
    await fetch(`${API}/projects/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API}/projects`);
    const projects = await res.json();
    renderProjects(projects);
    renderAdminLists(projects, null);
  } catch {
    // Remove from localStorage
    const saved = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
    const updated = saved.filter(p => p.id !== id);
    localStorage.setItem('portfolio_projects', JSON.stringify(updated));
    renderProjects(updated);
    renderAdminLists(updated, null);
    showToast('Project deleted!');
  }
}

// ─── ADMIN: ADD CERTIFICATE ──────────────────────────────
async function addCertificate() {
  const title = document.getElementById('ctTitle').value.trim();
  if (!title) return showToast('Title required', true);
  const data = {
    title,
    issuer: document.getElementById('ctIssuer').value,
    date: document.getElementById('ctDate').value,
    credentialId: document.getElementById('ctCred').value
  };
  const imageFile = document.getElementById('ctImage').files[0];
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) formData.append('image', imageFile);
  let certs;
  try {
    await fetch(`${API}/certificates`, { method: 'POST', body: formData });
    const res = await fetch(`${API}/certificates`);
    certs = await res.json();
  } catch {
    certs = [{ id: Date.now(), ...data }];
  }
  renderCerts(certs);
  renderAdminLists(null, certs);
  document.getElementById('ctTitle').value = '';
  document.getElementById('ctIssuer').value = '';
  setTimeout(initReveal, 100);
  showToast('Certificate added!');
}
async function deleteCertificate(id) {
  try {
    await fetch(`${API}/certificates/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API}/certificates`);
    const certs = await res.json();
    renderCerts(certs);
    renderAdminLists(null, certs);
  } catch { showToast('Error', true); }
}

// ─── ADMIN: UPLOAD RESUME ────────────────────────────────
async function uploadResume() {
  const fileInput = document.getElementById('resumeFile');
  const file = fileInput.files[0];
  if (!file) return showToast('Please select a file', true);
  const formData = new FormData();
  formData.append('file', file);
  const status = document.getElementById('resumeStatus');
  const btn = document.getElementById('heroResumeBtn');
  status.textContent = 'Uploading...'; status.className = 'form-status';
  try {
    const res = await fetch(`${API}/resume/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      btn.href = `${API}/resume/download`;
      btn.setAttribute('download', file.name);
      btn.textContent = '↓ Resume'; btn.onclick = null;
      status.textContent = '✓ Resume uploaded!'; status.className = 'form-status success';
      document.getElementById('resumePreview').innerHTML =
        `<p style="margin-top:12px;color:var(--green);font-size:0.8rem;font-family:var(--font-mono)">✓ ${file.name} — <a href="${API}/resume/download" style="color:var(--green)">Test Download</a></p>`;
    } else throw new Error(data.error);
  } catch {
    const blobUrl = URL.createObjectURL(file);
    btn.href = blobUrl; btn.setAttribute('download', file.name);
    btn.textContent = '↓ Resume'; btn.onclick = null;
    status.textContent = '✓ Resume ready (backend offline — session only)';
    status.className = 'form-status success';
    document.getElementById('resumePreview').innerHTML =
      `<p style="margin-top:12px;color:var(--green);font-size:0.8rem;font-family:var(--font-mono)">✓ ${file.name}</p>`;
  }
}

// ─── ADMIN: RENDER LISTS ─────────────────────────────────
function renderAdminLists(projects, certs) {
  if (projects !== null) {
    const pList = document.getElementById('adminProjectsList');
    pList.innerHTML = !projects.length ? '<div class="no-items">No projects yet</div>' :
      projects.map(p => `
        <div class="admin-list-item">
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</span>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="edit-btn" onclick='openEditModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>✏ Edit</button>
            <button class="delete-btn" onclick="deleteProject(${p.id})">🗑</button>
          </div>
        </div>`).join('');
  }
  if (certs !== null) {
    const cList = document.getElementById('adminCertsList');
    cList.innerHTML = !certs.length ? '<div class="no-items">No certificates yet</div>' :
      certs.map(c => `
        <div class="admin-list-item">
          <span>${c.title}</span>
          <button class="delete-btn" onclick="deleteCertificate(${c.id})">🗑</button>
        </div>`).join('');
  }
}

// ─── TOAST ───────────────────────────────────────────────
function showToast(msg, isError = false) {
  const t = document.createElement('div');
  t.textContent = isError ? `✕ ${msg}` : `✓ ${msg}`;
  Object.assign(t.style, {
    position: 'fixed', bottom: '32px', right: '32px', zIndex: '9999',
    background: isError ? '#ef4444' : 'linear-gradient(135deg,#d4a853,#8b6914)',
    color: isError ? '#fff' : '#07080b',
    padding: '12px 28px', borderRadius: '100px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: '600',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    animation: 'toastIn 0.35s cubic-bezier(0.16,1,0.3,1)',
    letterSpacing: '0.04em'
  });
  const style = document.createElement('style');
  style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2700);
  setTimeout(() => t.remove(), 3000);
}

// ─── PROFILE PHOTO ───────────────────────────────────────
function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const src = e.target.result;
    // Show in admin preview
    const preview = document.getElementById('photoPreview');
    const placeholder = document.getElementById('photoPlaceholder');
    if (preview) { preview.src = src; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.opacity = '0';
    // Show on avatar
    setAvatarPhoto(src);
    // Save to localStorage so it persists on reload
    try { localStorage.setItem('portfolio_avatar', src); } catch {}
  };
  reader.readAsDataURL(file);
}

function setAvatarPhoto(src) {
  const img = document.getElementById('avatarImg');
  const initials = document.getElementById('avatarInitials');
  if (!img) return;
  img.src = src;
  img.style.display = 'block';
  if (initials) initials.style.display = 'none';
}

function loadSavedPhoto() {
  try {
    const saved = localStorage.getItem('portfolio_avatar');
    if (saved) {
      setAvatarPhoto(saved);
      // Also populate admin preview
      const preview = document.getElementById('photoPreview');
      const placeholder = document.getElementById('photoPlaceholder');
      if (preview) { preview.src = saved; preview.style.display = 'block'; }
      if (placeholder) placeholder.style.opacity = '0';
    }
  } catch {}
}


// ─── EDIT PROJECT ─────────────────────────────────────────
function openEditModal(p) {
  document.getElementById('editPjId').value = p.id;
  document.getElementById('editPjTitle').value = p.title || '';
  document.getElementById('editPjDesc').value = p.description || '';
  document.getElementById('editPjTech').value = Array.isArray(p.tech) ? p.tech.join(', ') : (p.tech || '');
  document.getElementById('editPjGithub').value = p.github || '';
  document.getElementById('editPjLive').value = p.live || '';
  document.getElementById('editPjFeatured').checked = p.featured || false;
  document.getElementById('editPjExistingImage').value = p.image || '';
  document.getElementById('editPjImage').value = '';
  const preview = document.getElementById('editPjImagePreview');
  if (p.image) {
    const url = getImageUrl(p.image);
    preview.innerHTML = '<img src="' + url + '" style="height:80px;border-radius:8px;object-fit:cover;border:1px solid var(--border)"/><span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text3);display:block;margin-top:4px">Current image</span>';
  } else {
    preview.innerHTML = '<span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text3)">No image yet</span>';
  }
  document.getElementById('editProjectOverlay').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editProjectOverlay').classList.remove('open');
}

function closeEditIfOutside(e) {
  if (e.target === document.getElementById('editProjectOverlay')) closeEditModal();
}

async function saveEditProject() {
  const id = document.getElementById('editPjId').value;
  const data = {
    title: document.getElementById('editPjTitle').value.trim(),
    description: document.getElementById('editPjDesc').value,
    tech: document.getElementById('editPjTech').value.split(',').map(s => s.trim()).filter(Boolean),
    github: document.getElementById('editPjGithub').value,
    live: document.getElementById('editPjLive').value,
    featured: document.getElementById('editPjFeatured').checked,
    existingImage: document.getElementById('editPjExistingImage').value
  };
  if (!data.title) return showToast('Title required', true);
  const imageFile = document.getElementById('editPjImage').files[0];
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) formData.append('image', imageFile);
  try {
    await fetch(API + '/projects/' + id, { method: 'PUT', body: formData });
    const res = await fetch(API + '/projects');
    const projects = await res.json();
    renderProjects(projects);
    renderAdminLists(projects, null);
    closeEditModal();
    setTimeout(initReveal, 100);
    showToast('Project updated!');
  } catch {
    showToast('Error saving', true);
  }
}

// ─── INIT ─────────────────────────────────────────────────
loadAll();
loadSavedPhoto();
