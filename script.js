// Basic theme + mobile navigation + minor perf enhancements
console.log('Portfolio script loaded')

let theme = localStorage.getItem('theme')

if(theme == null){
	setTheme('light');
	updateActiveDot('light');
}else{
	setTheme(theme);
	// ensure active state reflects stored theme
	// updateActiveDot will be defined later; use microtask if not yet available
	setTimeout(()=>{ if(typeof updateActiveDot === 'function') updateActiveDot(theme); },0);
}

let themeDots = document.getElementsByClassName('theme-dot')


for (let i=0; i < themeDots.length; i++){
	themeDots[i].addEventListener('click', function(){
		const mode = this.dataset.mode;
		setTheme(mode);
		updateActiveDot(mode);
	});
}

function updateActiveDot(mode){
	for(let i=0;i<themeDots.length;i++){
		themeDots[i].classList.toggle('active', themeDots[i].dataset.mode === mode);
	}
}

function setTheme(mode){
    const themeLink = document.getElementById('theme-style');
    switch(mode){
        case 'light': themeLink.href = 'default.css'; break;
        case 'blue': themeLink.href = 'blue.css'; break;
        case 'green': themeLink.href = 'green.css'; break;
        case 'purple': themeLink.href = 'purple.css'; break;
        default: themeLink.href = 'default.css'; mode = 'light';
    }
    localStorage.setItem('theme', mode);
}

// -------- Mobile Navigation ---------
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if(navToggle && mobileMenu){
	navToggle.addEventListener('click', () => {
		const expanded = navToggle.getAttribute('aria-expanded') === 'true';
		navToggle.setAttribute('aria-expanded', !expanded);
		navToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

		if(mobileMenu.hasAttribute('hidden')){
			mobileMenu.removeAttribute('hidden');
			mobileMenu.classList.remove('hide');
			mobileMenu.classList.add('show');
		} else {
			mobileMenu.classList.remove('show');
			mobileMenu.classList.add('hide');
			// delay hide attribute until animation ends
			setTimeout(()=> mobileMenu.setAttribute('hidden',''), 280);
		}
	});

	// Close menu on link click (delegate)
	mobileMenu.addEventListener('click', (e)=>{
		if(e.target.tagName === 'A'){
			navToggle.click();
		}
	});
}

// -------- Performance Tweaks ---------
// Lazy load large images (fallback for browsers not supporting loading=lazy automatically or if not set)
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('img[loading="lazy"]').forEach(img => {
		if('IntersectionObserver' in window){
			const observer = new IntersectionObserver(entries => {
				entries.forEach(entry => {
					if(entry.isIntersecting){
						const target = entry.target;
						target.src = target.dataset.src || target.src;
						observer.unobserve(target);
					}
				});
			});
			observer.observe(img);
		}
	});

	// Fetch GitHub languages summary (lightweight)
	const ghListEl = document.getElementById('github-tech-list');
	if(ghListEl){
		fetch('https://api.github.com/users/PetitKwoba/repos?per_page=100')
			.then(r => r.ok ? r.json() : [])
			.then(repos => {
				const langCounts = {};
				repos.forEach(repo => { if(repo.language){ langCounts[repo.language] = (langCounts[repo.language]||0)+1; }});
				const sorted = Object.entries(langCounts).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
				const preferredOrder = ['JavaScript','TypeScript','PHP','Python','HTML','CSS','Shell','C','C++'];
				const merged = [...new Set(preferredOrder.filter(l=>sorted.includes(l)).concat(sorted))];
				ghListEl.textContent = merged.slice(0,8).join(', ');
			})
			.catch(()=>{ ghListEl.textContent = 'JavaScript, PHP, HTML, CSS'; });
	}
});

// Reduce transition intensity if prefers-reduced-motion
if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
	document.documentElement.classList.add('reduced-motion');
}