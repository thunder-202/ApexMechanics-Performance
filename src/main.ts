/**
 * Apex Mechanics & Performance
 * Pure Vanilla JavaScript Client Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initDynamicYear();
  initMobileNav();
  initServiceSelectors();
  initBookingForm();
  initDatePickerConstraints();
  initScrollNav();
  initWorkshopStatus();
});

/**
 * Update copyright year dynamically
 */
function initDynamicYear(): void {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
}

/**
 * Mobile Navigation Drawer Toggle & Accessibility
 */
function initMobileNav(): void {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer(): void {
    if (drawer && backdrop) {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer(): void {
    if (drawer && backdrop) {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', openDrawer);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/**
 * Service Card Quick Selector
 * When user clicks "Select Service & Book" on any card, prefill the dropdown and scroll to form
 */
function initServiceSelectors(): void {
  const serviceButtons = document.querySelectorAll<HTMLButtonElement>('[data-service-select]');
  const serviceSelect = document.getElementById('booking-service') as HTMLSelectElement | null;
  const bookingSection = document.getElementById('booking');

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceValue = btn.getAttribute('data-service-select');
      
      if (serviceSelect && serviceValue) {
        serviceSelect.value = serviceValue;
        
        // Trigger visual pulse on the select dropdown
        serviceSelect.classList.remove('has-error');
        serviceSelect.style.borderColor = 'var(--accent-red)';
        setTimeout(() => {
          serviceSelect.style.borderColor = '';
        }, 1200);
      }

      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nameField = document.getElementById('booking-name') as HTMLInputElement | null;
        setTimeout(() => {
          nameField?.focus();
        }, 600);
      }
    });
  });
}

/**
 * Date Picker Constraints: Set min date to tomorrow
 */
function initDatePickerConstraints(): void {
  const dateInput = document.getElementById('booking-date') as HTMLInputElement | null;
  if (!dateInput) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  dateInput.min = minDateStr;
}

/**
 * Interactive Form Verification & Booking Submission
 */
function initBookingForm(): void {
  const form = document.getElementById('appointment-form') as HTMLFormElement | null;
  const modalBackdrop = document.getElementById('confirmation-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (!form) return;

  // Clear validation errors when typing or changing values
  const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearFieldError(input);
    });
    input.addEventListener('change', () => {
      clearFieldError(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('booking-name') as HTMLInputElement | null;
    const phoneInput = document.getElementById('booking-phone') as HTMLInputElement | null;
    const vehicleInput = document.getElementById('booking-vehicle') as HTMLInputElement | null;
    const serviceInput = document.getElementById('booking-service') as HTMLSelectElement | null;
    const dateInput = document.getElementById('booking-date') as HTMLInputElement | null;
    const timeInput = document.getElementById('booking-time') as HTMLSelectElement | null;
    const notesInput = document.getElementById('booking-notes') as HTMLTextAreaElement | null;

    let hasError = false;
    let firstErrorField: HTMLElement | null = null;

    // Validate Name
    if (!nameInput?.value.trim() || nameInput.value.trim().length < 2) {
      setFieldError(nameInput, 'Please enter your full name (minimum 2 characters).');
      hasError = true;
      if (!firstErrorField) firstErrorField = nameInput;
    } else {
      clearFieldError(nameInput);
    }

    // Validate Phone Number
    const phoneVal = phoneInput?.value.trim() || '';
    const phoneRegex = /^[0-9+\s()-]{8,20}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      setFieldError(phoneInput, 'Please provide a valid Australian contact phone number.');
      hasError = true;
      if (!firstErrorField) firstErrorField = phoneInput;
    } else {
      clearFieldError(phoneInput);
    }

    // Validate Vehicle Make / Model
    if (!vehicleInput?.value.trim() || vehicleInput.value.trim().length < 2) {
      setFieldError(vehicleInput, 'Please specify your vehicle make, model and year (e.g., 2021 Toyota Hilux).');
      hasError = true;
      if (!firstErrorField) firstErrorField = vehicleInput;
    } else {
      clearFieldError(vehicleInput);
    }

    // Validate Service Selection
    if (!serviceInput?.value || serviceInput.value === '') {
      setFieldError(serviceInput, 'Please select the required automotive service.');
      hasError = true;
      if (!firstErrorField) firstErrorField = serviceInput;
    } else {
      clearFieldError(serviceInput);
    }

    // Validate Date
    if (!dateInput?.value) {
      setFieldError(dateInput, 'Please select your preferred booking date.');
      hasError = true;
      if (!firstErrorField) firstErrorField = dateInput;
    } else {
      clearFieldError(dateInput);
    }

    if (hasError) {
      firstErrorField?.focus();
      return;
    }

    // Generate Booking Confirmation
    const refCode = 'APX-' + Math.floor(100000 + Math.random() * 900000);
    const serviceName = serviceInput?.options[serviceInput.selectedIndex]?.text || 'General Mechanical Service';
    const vehicleText = vehicleInput?.value.trim() || 'Vehicle';
    const clientName = nameInput?.value.trim() || 'Valued Customer';
    const dateText = dateInput?.value || 'Selected Date';
    const timeText = timeInput?.value || 'Morning Drop-off (7:30 AM)';

    // Update confirmation modal details
    const refEl = document.getElementById('summary-ref');
    const nameEl = document.getElementById('summary-name');
    const vehicleEl = document.getElementById('summary-vehicle');
    const serviceEl = document.getElementById('summary-service');
    const dateEl = document.getElementById('summary-date');
    const timeEl = document.getElementById('summary-time');

    if (refEl) refEl.textContent = refCode;
    if (nameEl) nameEl.textContent = clientName;
    if (vehicleEl) vehicleEl.textContent = vehicleText;
    if (serviceEl) serviceEl.textContent = serviceName;
    if (dateEl) dateEl.textContent = formatDateString(dateText);
    if (timeEl) timeEl.textContent = timeText;

    // Show modal
    if (modalBackdrop) {
      modalBackdrop.classList.add('active');
    }

    // Reset Form
    form.reset();
    initDatePickerConstraints();
  });

  if (modalCloseBtn && modalBackdrop) {
    modalCloseBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
      }
    });
  }
}

function setFieldError(field: HTMLElement | null, message: string): void {
  if (!field) return;
  field.classList.add('has-error');
  const parent = field.closest('.form-group');
  if (parent) {
    parent.classList.add('has-error');
    const msgEl = parent.querySelector('.form-error-msg');
    if (msgEl) {
      msgEl.textContent = message;
    }
  }
}

function clearFieldError(field: HTMLElement | null): void {
  if (!field) return;
  field.classList.remove('has-error');
  const parent = field.closest('.form-group');
  if (parent) {
    parent.classList.remove('has-error');
  }
}

function formatDateString(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch (e) {
    // Fallback
  }
  return dateStr;
}

/**
 * Active Navigation Indicator on Scroll
 */
function initScrollNav(): void {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const el = section as HTMLElement;
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = el.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Real-time Workshop Open/Closed status indicator
 * Mon-Fri: 7:30 AM – 5:30 PM (AEST UTC+10)
 * Sat: 8:00 AM – 1:00 PM
 * Sun: Closed
 */
function initWorkshopStatus(): void {
  const statusBadge = document.getElementById('live-status-badge');
  if (!statusBadge) return;

  // Calculate Brisbane Time (AEST: UTC+10)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brisbaneTime = new Date(utc + (3600000 * 10));
  
  const day = brisbaneTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = brisbaneTime.getHours();
  const minutes = brisbaneTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  let isOpen = false;

  if (day >= 1 && day <= 5) {
    // Mon - Fri: 7:30 AM (450 mins) to 5:30 PM (1050 mins)
    if (timeInMinutes >= 450 && timeInMinutes < 1050) {
      isOpen = true;
    }
  } else if (day === 6) {
    // Sat: 8:00 AM (480 mins) to 1:00 PM (780 mins)
    if (timeInMinutes >= 480 && timeInMinutes < 780) {
      isOpen = true;
    }
  }

  if (isOpen) {
    statusBadge.className = 'status-badge open';
    statusBadge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#22c55e;"></span> Workshop Open Now';
  } else {
    statusBadge.className = 'status-badge closed';
    statusBadge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#ef4444;"></span> Workshop Currently Closed';
  }
}
