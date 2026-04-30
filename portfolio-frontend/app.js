// ─── CONFIG ─────────────────────────────────────────────
const API = 'http://localhost:5000/api';

// ─── CUSTOM CURSOR ───────────────────────────────────────
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});
setInterval(() => {
  tx += (mx - tx) * 0.15;
  ty += (my - ty) *.15;
  trail.style.left = tx + 'px';
  trail.style.top = ty + 'px';
}, 16);

// ─── NAV SCROLL ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ─── COUNTER ANIMATION ───────────────────────────────────
function animateCount(el, target, duration = 1500) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
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
}

// ─── DEMO MODE (no backend) ──────────────────────────────
function loadDemo() {
  const profile = {
    name: "Aditya Singh", title: "B.Tech Final Year Student",
    branch: "Computer Science & Engineering", university: "XYZ University",
    bio: "Passionate developer building solutions that matter. Focused on full-stack development, machine learning, and open-source contributions.",
    email: "aditya.singh@email.com", phone: "+91 98765 43210",
    github: "https://github.com/adityasingh", linkedin: "https://linkedin.com/in/adityasingh",
    location: "Agra, Uttar Pradesh, India",
    skills: ["React", "Node.js", "Python", "Machine Learning", "MongoDB", "Git", "Docker", "AWS", "C++", "SQL"]
  };
  const projects = [
    { id: 1, title: "Smart Study Planner", description: "AI-powered study planner that adapts to your learning pace using NLP and ML algorithms.", tech: ["Python", "Flask", "React", "MongoDB"], github: "#", live: "#", featured: true },
    { id: 2, title: "Campus Connect", description: "Full-stack social platform for college students to collaborate on projects and share resources.", tech: ["React", "Node.js", "PostgreSQL"], github: "#", live: "#", featured: true },
    { id: 3, title: "Expense Tracker", description: "Mobile-responsive expense tracking app with smart categorization and analytics.", tech: ["Vue.js", "Firebase"], github: "#", live: "#", featured: false }
  ];
  const certs = [
    { id: 1, title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "2024-03", credentialId: "AWS-CP-12345" },
    { id: 2, title: "Machine Learning Specialization", issuer: "Coursera / DeepLearning.AI", date: "2024-01", credentialId: "CORS-ML-67890" },
    { id: 3, title: "React Developer Certificate", issuer: "Meta", date: "2023-11", credentialId: "META-RD-54321" }
  ];
  renderProfile(profile);
  renderProjects(projects);
  renderCerts(certs);
  renderStats({ projects: 3, certificates: 3, skills: 10 });
  populateAdmin(profile);
  renderAdminLists(projects, certs);
}

// ─── RENDER PROFILE ──────────────────────────────────────
function renderProfile(p) {
  document.getElementById('heroTag').textContent = `${p.branch} · ${p.title}`;
  document.getElementById('heroName').innerHTML = `<span class="name-line">${p.name.split(' ')[0]}</span><span class="name-line accent">${p.name.split(' ').slice(1).join(' ')}</span>`;
  document.getElementById('heroBio').textContent = p.bio.split('.')[0] + '.';
  document.getElementById('aboutBio').textContent = p.bio;
  document.getElementById('metaUniv').textContent = p.university;
  document.getElementById('metaBranch').textContent = p.branch;
  document.getElementById('metaLoc').textContent = p.location;
  document.getElementById('metaEmail').textContent = p.email;
  document.getElementById('cinfoEmail').textContent = `📧 ${p.email}`;
  document.getElementById('cinfoPhone').textContent = `📱 ${p.phone}`;
  document.getElementById('cinfoLoc').textContent = `📍 ${p.location}`;
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
function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!projects.length) { grid.innerHTML = '<p class="no-items">No projects yet. Add some from the Admin panel!</p>'; return; }
  grid.innerHTML = projects.map(p => `
    <div class="project-card ${p.featured ? 'featured' : ''}">
      <div class="project-thumb">
        ${p.image ? `<img src="${p.image}" alt="${p.title}"/>` : getProjectEmoji(p.tech)}
      </div>
      <div class="project-body">
        <div class="project-tech">${(p.tech || []).map(t => `<span class="tech-badge">${t}</span>`).join('')}</div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link">⌥ GitHub</a>` : ''}
          ${p.live ? `<a href="${p.live}" target="_blank" class="project-link">↗ Live Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}
function getProjectEmoji(tech = []) {
  const t = tech.join('').toLowerCase();
  if (t.includes('ml') || t.includes('python')) return '🤖';
  if (t.includes('react') || t.includes('vue')) return '⚛';
  if (t.includes('node') || t.includes('express')) return '🚀';
  return '💻';
}

// ─── RENDER CERTIFICATES ─────────────────────────────────
function renderCerts(certs) {
  const grid = document.getElementById('certsGrid');
  if (!certs.length) { grid.innerHTML = '<p class="no-items">No certificates yet. Add some from Admin!</p>'; return; }
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
function getCertEmoji(issuer = '') {
  const i = issuer.toLowerCase();
  if (i.includes('aws') || i.includes('amazon')) return '☁';
  if (i.includes('google')) return '🔵';
  if (i.includes('meta') || i.includes('facebook')) return '⬡';
  if (i.includes('coursera') || i.includes('udemy')) return '📚';
  if (i.includes('microsoft')) return '🪟';
  return '🎓';
}
function formatDate(d) {
  if (!d) return '';
  const date = new Date(d + '-01');
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// ─── RENDER RESUME ───────────────────────────────────────
function renderResume(data) {
  const btn = document.getElementById('heroResumeBtn');
  if (data.resume) {
    // Use dedicated download route instead of static file URL
    const downloadUrl = `${API}/resume/download`;
    btn.href = downloadUrl;
    btn.setAttribute('download', '');
    btn.textContent = '↓ Download Resume';
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
  }, 600);
}

// ─── CONTACT ─────────────────────────────────────────────
async function sendMessage(e) {
  e.preventDefault();
  const btn = document.getElementById('sendBtn');
  const status = document.getElementById('formStatus');
  btn.textContent = 'Sending...';
  btn.disabled = true;
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
    status.textContent = '✓ Demo mode — message logged locally.';
    status.className = 'form-status success';
    document.getElementById('contactForm').reset();
  } finally {
    btn.textContent = 'Send Message →'; btn.disabled = false;
    setTimeout(() => { status.textContent = ''; }, 5000);
  }
}

// ─── ADMIN PANEL ─────────────────────────────────────────
function toggleAdmin() {
  const overlay = document.getElementById('adminOverlay');
  overlay.classList.toggle('open');
}
function closeAdminIfOutside(e) {
  if (e.target === document.getElementById('adminOverlay')) toggleAdmin();
}
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    const names = ['profile', 'projects', 'certs', 'resume'];
    b.classList.toggle('active', names[i] === name);
  });
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
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) formData.append('image', imageFile);
  let projects;
  try {
    await fetch(`${API}/projects`, { method: 'POST', body: formData });
    const res = await fetch(`${API}/projects`);
    projects = await res.json();
  } catch {
    projects = [{ id: Date.now(), ...data }];
  }
  renderProjects(projects);
  renderAdminLists(projects, null);
  document.getElementById('pjTitle').value = '';
  document.getElementById('pjDesc').value = '';
  document.getElementById('pjTech').value = '';
  document.getElementById('pjGithub').value = '';
  document.getElementById('pjLive').value = '';
  showToast('Project added!');
}
async function deleteProject(id) {
  try {
    await fetch(`${API}/projects/${id}`, { method: 'DELETE' });
    const res = await fetch(`${API}/projects`);
    const projects = await res.json();
    renderProjects(projects);
    renderAdminLists(projects, null);
  } catch { showToast('Error', true); }
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
      const downloadUrl = `${API}/resume/download`;
      btn.href = downloadUrl;
      btn.setAttribute('download', file.name);
      btn.textContent = '↓ Download Resume';
      btn.onclick = null;
      status.textContent = '✓ Resume uploaded!'; status.className = 'form-status success';
      document.getElementById('resumePreview').innerHTML =
        `<p style="margin-top:12px;color:#6ee7b7;font-size:0.85rem;">✓ Uploaded: ${file.name} — <a href="${downloadUrl}" style="color:#6ee7b7">Test Download</a></p>`;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch {
    // Offline/demo mode: use blob URL so download works in current session
    const blobUrl = URL.createObjectURL(file);
    btn.href = blobUrl;
    btn.setAttribute('download', file.name);
    btn.textContent = '↓ Download Resume';
    btn.onclick = null;
    status.textContent = '✓ Resume ready! (Backend offline — works this session only)';
    status.className = 'form-status success';
    document.getElementById('resumePreview').innerHTML =
      `<p style="margin-top:12px;color:#6ee7b7;font-size:0.85rem;">✓ Loaded: ${file.name}</p>`;
  }
}

// ─── ADMIN: RENDER LISTS ─────────────────────────────────
function renderAdminLists(projects, certs) {
  if (projects !== null) {
    const pList = document.getElementById('adminProjectsList');
    pList.innerHTML = !projects.length ? '<div class="no-items">No projects yet</div>' :
      projects.map(p => `
        <div class="admin-list-item">
          <span>${p.title}</span>
          <button class="delete-btn" onclick="deleteProject(${p.id})">🗑</button>
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
    background: isError ? '#ef4444' : '#6ee7b7', color: isError ? '#fff' : '#080a0e',
    padding: '12px 24px', borderRadius: '100px',
    fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', fontWeight: '600',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    animation: 'fadeIn 0.3s ease'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── SCROLL REVEAL ───────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .cert-card, .about-grid').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ─── INIT ─────────────────────────────────────────────────
loadAll();
