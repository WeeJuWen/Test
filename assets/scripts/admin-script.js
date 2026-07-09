// Admin panel functionality for managing events and live stream configuration

// Set a global variable to track if we're in edit mode
window.editingIndex = -1;

window.editEvent = function(index) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events[index];
    
    
    // Fill the form with event data
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-start-time').value = event.startTime;
    document.getElementById('event-end-time').value = event.endTime;
    document.getElementById('event-location').value = event.location;
    document.getElementById('event-description').value = event.description;

    // Set global index to know we are updating this specific index
    window.editingIndex = index;

    // Optional: Scroll to form or change button text
    window.scrollTo(0, 0);
    const submitBtn = document.querySelector('#event-form button[type="submit"]');
    submitBtn.textContent = getTranslation('admin.update_event_btn');
};

// Delete event from localStorage
window.deleteEvent = function(index) {
    if (confirm(getTranslation('admin.delete_confirm'))) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(events));
        location.reload();
    }
};

// Save live stream configuration
window.saveStreamConfig = function() {
    const isActive = document.getElementById('stream-active').checked;
    const videoId = document.getElementById('stream-video-id').value.trim();
    
    const streamConfig = {
        isActive: isActive,
        videoId: videoId
    };
    
    localStorage.setItem('livestream', JSON.stringify(streamConfig));
    alert(getTranslation('admin.stream_saved'));
};

document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('event-form');
    const adminEventsContainer = document.getElementById('admin-events-container');
    const noAdminEvents = document.getElementById('no-admin-events');

    // PDF drag and drop functionality
    const pdfDropzone = document.getElementById('pdf-dropzone');
    const pdfInput = document.getElementById('event-pdf');
    const pdfFilename = document.getElementById('pdf-filename');

    if (pdfDropzone && pdfInput) {
        // Click to browse
        pdfDropzone.addEventListener('click', () => {
            pdfInput.click();
        });

        // Handle file selection
        pdfInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                pdfFilename.textContent = e.target.files[0].name;
                pdfFilename.classList.remove('hidden');
            } else {
                pdfFilename.classList.add('hidden');
            }
        });

        // Drag and drop events
        pdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropzone.classList.add('border-amber-500', 'bg-amber-50');
        });

        pdfDropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            pdfDropzone.classList.remove('border-amber-500', 'bg-amber-50');
        });

        pdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropzone.classList.remove('border-amber-500', 'bg-amber-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                pdfInput.files = files;
                pdfFilename.textContent = files[0].name;
                pdfFilename.classList.remove('hidden');
            } else {
                alert(getTranslation('admin.pdf_error') || 'Please upload a PDF file');
            }
        });
    }

    // Load events from localStorage
    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        
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
            console.log(`Auto-deleted ${events.length - upcomingEvents.length} past event(s) from admin panel`);
        }
        
        displayAdminEvents(upcomingEvents);
    }

    // Display events in admin panel
    function displayAdminEvents(events) {
        adminEventsContainer.innerHTML = '';
        
        if (events.length === 0) {
            noAdminEvents.classList.remove('hidden');
            return;
        }
        
        noAdminEvents.classList.add('hidden');
        
        events.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'bg-amber-50 rounded-lg p-4 flex justify-between items-start';
            eventCard.innerHTML = `
                <div class="flex-1">
                    <h3 class="font-semibold text-amber-800 mb-1">${event.title}</h3>
                    <p class="text-sm text-stone-600 mb-1">
                        <strong>Date:</strong> ${formatDate(event.date)} | 
                        <strong>Time:</strong> ${event.startTime ? formatTime(event.startTime) + ' - ' + formatTime(event.endTime) : formatTime(event.time)}
                    </p>
                    <p class="text-sm text-stone-600 mb-1">
                        <strong>Location:</strong> ${event.location}
                    </p>
                    <p class="text-sm text-stone-600 mb-1">${event.description}</p>
                    ${event.pdfData ? '<p class="text-xs text-amber-600 mt-2"><strong>📎 PDF attached</strong></p>' : ''}
                </div>
                <div class="flex gap-2">
                    <button onclick="editEvent(${index})" class="ml-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm">
                        <span data-i18n="admin.edit">Edit</span>
                    </button>
                    <button onclick="deleteEvent(${index})" class="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm">
                        <span data-i18n="admin.delete">Delete</span>
                    </button>
                </div>
                
            `;
            adminEventsContainer.appendChild(eventCard);
        });
    }

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

    // Load stream configuration
    function loadStreamConfig() {
        const streamConfig = JSON.parse(localStorage.getItem('livestream')) || { isActive: false, videoId: '' };
        document.getElementById('stream-active').checked = streamConfig.isActive;
        document.getElementById('stream-video-id').value = streamConfig.videoId;
    }

    // Add new event
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const pdfInput = document.getElementById('event-pdf');
        const pdfFile = pdfInput.files[0];
        
        const eventData = {
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            startTime: document.getElementById('event-start-time').value,
            endTime: document.getElementById('event-end-time').value,
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value,
            // Keep existing PDF if editing and no new one selected, otherwise update
            pdfData: pdfFile ? null : (window.editingIndex !== -1 ? events[window.editingIndex].pdfData : null)
        };

        const saveEvent = (data) => {
            if (window.editingIndex !== -1) {
                events[window.editingIndex] = data; // Update existing
                window.editingIndex = -1;
                document.querySelector('#event-form button[type="submit"]').textContent = getTranslation('admin.add_event_btn');
                alert(getTranslation('admin.event_updated'));
            } else {
                events.push(data); // Add new
                alert(getTranslation('admin.event_added'));
            }
            localStorage.setItem('events', JSON.stringify(events));
            eventForm.reset();
            loadEvents();
        };

        if (pdfFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                eventData.pdfData = e.target.result;
                saveEvent(eventData);
            };
            reader.readAsDataURL(pdfFile);
        } else {
            saveEvent(eventData);
        }
    });
    // Initialize admin panel
    loadEvents();
    loadStreamConfig();
});
