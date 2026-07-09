document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') &&
                !mobileMenu.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Close mobile menu when scrolling
        window.addEventListener('scroll', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Highlight active navigation link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Smooth scroll for anchor links with header offset (only for single-page sections)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            // Only handle smooth scroll for actual anchor links, not page links
            if (href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 64;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Load events only if events container exists (on events page)
    if (document.getElementById('events-container')) {
        loadEvents();
    }

    // Load live stream only if livestream container exists (on livestream page)
    if (document.getElementById('livestream-container')) {
        loadLiveStream();
    }

    // Scroll spy for navigation highlighting (only for single-page)
    if (document.querySelector('[id="about"]')) {
        initScrollSpy();
    }
});

function loadEvents() {
    const eventsContainer = document.getElementById('events-container');
    const noEvents = document.getElementById('no-events');
    
    if (!eventsContainer) {
        return;
    }
    
    if (!noEvents) {
        // If noEvents element doesn't exist, just load events without it
    }
    
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const news = JSON.parse(localStorage.getItem('news')) || [];
    
    // Auto-delete past events (date is before today)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00');
        eventDate.setHours(0, 0, 0, 0);
        // Keep event if it's today or in the future
        return eventDate.getTime() >= currentDate.getTime();
    });
    
    // Save filtered events back to localStorage if any were removed
    if (upcomingEvents.length !== events.length) {
        localStorage.setItem('events', JSON.stringify(upcomingEvents));
        console.log(`Auto-deleted ${events.length - upcomingEvents.length} past event(s)`);
    }
    
    // Combine upcoming events and news for main display
    const allItems = [
        ...upcomingEvents.map(e => ({...e, type: 'event', date: e.date})),
        ...news.map(n => ({...n, type: 'news', date: n.date}))
    ];
    
    // Sort by proximity to current date (closest first)
    allItems.sort((a, b) => {
        const dateA = new Date(a.date);
        dateA.setHours(0, 0, 0, 0);
        const dateB = new Date(b.date);
        dateB.setHours(0, 0, 0, 0);
        
        const distanceA = Math.abs(dateA - currentDate);
        const distanceB = Math.abs(dateB - currentDate);
        
        return distanceA - distanceB;
    });
    
    if (allItems.length === 0) {
        // Check if there's a poster (which represents an event)
        const posterExists = document.querySelector('img[alt="Event Poster"]');
        if (!posterExists && noEvents) {
            noEvents.classList.remove('hidden');
        } else if (noEvents) {
            noEvents.classList.add('hidden');
        }
        return;
    }
    
    if (noEvents) noEvents.classList.add('hidden');
    
    // The first item is now the closest event
    const closestEvent = allItems[0];
    
    allItems.forEach(item => {
        const card = document.createElement('div');
        const isClosest = closestEvent && item === closestEvent;
        
        // Add special styling for the closest event
        if (isClosest) {
            card.className = 'bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-amber-500 relative cursor-pointer';
        } else {
            card.className = 'bg-white rounded-xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-stone-200 hover:border-amber-300 cursor-pointer';
        }
        
        if (item.type === 'event') {
            card.innerHTML = `
                ${isClosest ? '<div class="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded absolute top-2 right-2">UPCOMING</div>' : ''}
                <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="font-serif-sc text-xl font-semibold text-amber-800 mb-3">${item.title}</h3>
                <p class="text-stone-600 text-sm mb-2">
                    <strong>Date:</strong> ${formatDate(item.date)}
                </p>
                <p class="text-stone-600 text-sm mb-2">
                    <strong>Time:</strong> ${item.startTime ? formatTime(item.startTime) + ' - ' + formatTime(item.endTime) : formatTime(item.time)}
                </p>
                <p class="text-stone-600 text-sm mb-2">
                    <strong>Location:</strong> ${item.location}
                </p>
                <p class="text-stone-600 text-sm mb-2 event-description" style="white-space: pre-line;">${item.description}</p>
                ${item.pdfData ? `<button onclick="event.stopPropagation(); viewPdf('${item.title}', '${item.pdfData}')" class="mt-3 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm">View PDF Details</button>` : ''}
            `;
        } else {
            card.innerHTML = `
                ${isClosest ? '<div class="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded absolute top-2 left-2">UPCOMING</div>' : ''}
                <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M3.412 9.757L5.5 16.5M18 13a3 3 0 013-3h-3M18 13V9a3 3 0 00-3-3h-3"></path>
                    </svg>
                </div>
                <h3 class="font-serif-sc text-xl font-semibold text-amber-800 mb-3">${item.title}</h3>
                <p class="text-stone-600 text-sm mb-2">
                    <strong>Date:</strong> ${formatDate(item.date)}
                </p>
                <p class="text-stone-600 text-sm mb-2">${item.content}</p>
            `;
        }
        
        eventsContainer.appendChild(card);
        
        // Add click event listener to entire card
        card.addEventListener('click', function() {
            openEventModal(item);
        });
    });
}

// Open event modal
window.openEventModal = function(item) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalTime = document.getElementById('modal-time');
    const modalLocation = document.getElementById('modal-location');
    const modalDescription = document.getElementById('modal-description');
    const modalPdfBtn = document.getElementById('modal-pdf-btn');
    
    modalTitle.textContent = item.title;
    modalDate.textContent = formatDate(item.date);
    modalTime.textContent = item.startTime ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}` : formatTime(item.time);
    modalLocation.textContent = item.location;
    modalDescription.textContent = item.description;
    
    if (item.pdfData) {
        modalPdfBtn.classList.remove('hidden');
        modalPdfBtn.onclick = () => viewPdf(item.title, item.pdfData);
    } else {
        modalPdfBtn.classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

// Close event modal
window.closeEventModal = function() {
    const modal = document.getElementById('event-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

// View PDF in new tab
window.viewPdf = function(title, pdfData) {
    const base64Data = pdfData.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-MY', options);
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Load live stream
function loadLiveStream() {
    const livestreamContainer = document.getElementById('livestream-container');
    const livestreamActive = document.getElementById('livestream-active');
    const livestreamOffline = document.getElementById('livestream-offline');
    const youtubeIframe = document.getElementById('youtube-iframe');
    
    if (!livestreamContainer) return;
    
    const streamConfig = JSON.parse(localStorage.getItem('livestream')) || { isActive: false, videoId: '' };
    
    if (streamConfig.isActive && streamConfig.videoId) {
        livestreamActive.classList.remove('hidden');
        livestreamOffline.classList.add('hidden');
        
        // Use simple embed for better mobile compatibility
        youtubeIframe.src = `https://www.youtube.com/embed/${streamConfig.videoId}?rel=0&modestbranding=1`;
        
        // Try to use YouTube IFrame API if available for desktop
        if (window.YT && window.YT.Player && !/Mobi|Android/i.test(navigator.userAgent)) {
            setTimeout(() => {
                if (!window.ytPlayer) {
                    window.ytPlayer = new YT.Player('youtube-iframe', {
                        events: {
                            'onStateChange': onPlayerStateChange,
                            'onError': onPlayerError
                        }
                    });
                }
            }, 1000);
        }
    } else {
        livestreamActive.classList.add('hidden');
        livestreamOffline.classList.remove('hidden');
        youtubeIframe.src = '';
        if (window.ytPlayer) {
            window.ytPlayer.destroy();
            window.ytPlayer = null;
        }
    }
}

// YouTube API callback
function onYouTubeIframeAPIReady() {
    loadLiveStream();
}

// Handle player state changes
function onPlayerStateChange(event) {
    const livestreamActive = document.getElementById('livestream-active');
    const livestreamOffline = document.getElementById('livestream-offline');
    
    if (event.data === YT.PlayerState.ENDED) {
        livestreamActive.classList.add('hidden');
        livestreamOffline.classList.remove('hidden');
        updateOfflineMessage('Stream ended');
    }
}

// Handle player errors
function onPlayerError(event) {
    const livestreamActive = document.getElementById('livestream-active');
    const livestreamOffline = document.getElementById('livestream-offline');
    
    livestreamActive.classList.add('hidden');
    livestreamOffline.classList.remove('hidden');
    
    let errorMessage = 'Stream unavailable';
    if (event.data === 2) {
        errorMessage = 'Invalid video ID';
    } else if (event.data === 100) {
        errorMessage = 'Video not found';
    } else if (event.data === 101 || event.data === 150) {
        errorMessage = 'Video not embeddable';
    }
    
    updateOfflineMessage(errorMessage);
}

// Update offline message
function updateOfflineMessage(message) {
    const offlineTitle = document.querySelector('#livestream-offline h3');
    const offlineMessage = document.querySelector('#livestream-offline p');
    
    if (offlineTitle) {
        offlineTitle.textContent = message;
    }
    if (offlineMessage) {
        offlineMessage.textContent = 'Please check back later for upcoming live streams.';
    }
}

// Scroll spy for navigation highlighting
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) {
        return;
    }
    
    function highlightNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Initial check
    setTimeout(highlightNavLink, 100);
    
    // Check on scroll
    window.addEventListener('scroll', highlightNavLink);
}
