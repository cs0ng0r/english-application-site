// DOM Elements
const applicationForm = document.getElementById('applicationForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Form validation setup
    setupFormValidation();
    
    // Add animations on scroll
    setupScrollAnimations();
});

// Smooth scroll function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80; // Account for fixed header
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Form validation setup
function setupFormValidation() {
    const requiredFields = ['firstName', 'lastName', 'email', 'grade', 'englishLevel'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        field.addEventListener('blur', () => validateField(field, errorElement));
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                validateField(field, errorElement);
            }
        });
    });

    // Email specific validation
    const emailField = document.getElementById('email');
    emailField.addEventListener('blur', () => validateEmail(emailField));
    emailField.addEventListener('input', () => {
        if (emailField.classList.contains('invalid')) {
            validateEmail(emailField);
        }
    });
}

// Field validation function
function validateField(field, errorElement) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, errorElement, 'Ez a mező kötelező');
        return false;
    }
    
    // Additional validations based on field type
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, errorElement, 'Kérjük, adjon meg egy érvényes e-mail címet');
        return false;
    }
    
    hideFieldError(field, errorElement);
    return true;
}

// Email validation
function validateEmail(field) {
    const errorElement = document.getElementById('emailError');
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, errorElement, 'Az e-mail cím kötelező');
        return false;
    }
    
    if (!isValidEmail(value)) {
        showFieldError(field, errorElement, 'Kérjük, adjon meg egy érvényes e-mail címet');
        return false;
    }
    
    hideFieldError(field, errorElement);
    return true;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error
function showFieldError(field, errorElement, message) {
    field.classList.add('invalid');
    field.classList.remove('valid');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Hide field error
function hideFieldError(field, errorElement) {
    field.classList.remove('invalid');
    field.classList.add('valid');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Form submission handler
applicationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    try {
        // Collect form data
        const formData = new FormData(applicationForm);
        const data = Object.fromEntries(formData.entries());
        
        // Submit to server
        const response = await fetch('/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        hideLoading();
        
        if (result.success) {
            showSuccessModal();
            applicationForm.reset();
            clearValidationStates();
        } else {
            showErrorModal(result.message || 'Hiba történt a jelentkezés feldolgozása során.');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error submitting application:', error);
        showErrorModal('Hiba történt a jelentkezés elküldése során. Kérjük, ellenőrizze az internetkapcsolatát és próbálja újra.');
    }
});

// Form validation
function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'grade', 'englishLevel'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (!validateField(field, errorElement)) {
            isValid = false;
        }
    });
    
    // Validate email specifically
    const emailField = document.getElementById('email');
    if (!validateEmail(emailField)) {
        isValid = false;
    }
    
    return isValid;
}

// Clear validation states
function clearValidationStates() {
    const allFields = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    const allErrors = document.querySelectorAll('.error-message');
    
    allFields.forEach(field => {
        field.classList.remove('valid', 'invalid');
    });
    
    allErrors.forEach(error => {
        error.textContent = '';
    });
}

// Loading functions
function showLoading() {
    loadingOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Modal functions
function showSuccessModal() {
    successModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function showErrorModal(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    successModal.classList.add('hidden');
    errorModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Close modal when clicking outside
[successModal, errorModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.info-card, .form-section');
    animatedElements.forEach(el => observer.observe(el));
}

// Active navigation highlighting on scroll
window.addEventListener('scroll', () => {
    const sections = ['home', 'info', 'application'];
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = sectionId;
            }
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Input formatting
document.getElementById('phone').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.startsWith('36')) {
            value = '+' + value;
        } else if (!value.startsWith('+')) {
            value = '+36' + value;
        }
    }
    e.target.value = value;
});

// Character limits and counters
const textareas = document.querySelectorAll('.form-textarea');
textareas.forEach(textarea => {
    const maxLength = {
        'motivation': 500,
        'previousExperience': 300,
        'availableDates': 200
    };
    
    const limit = maxLength[textarea.id];
    if (limit) {
        textarea.setAttribute('maxlength', limit);
        
        // Create character counter
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = 'font-size: 0.8rem; color: #bdc3c7; text-align: right; margin-top: 0.25rem;';
        textarea.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const remaining = limit - textarea.value.length;
            counter.textContent = `${remaining} karakter maradt`;
            
            if (remaining < 50) {
                counter.style.color = '#f39c12';
            } else if (remaining < 20) {
                counter.style.color = '#e74c3c';
            } else {
                counter.style.color = '#bdc3c7';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
});

// Form auto-save to localStorage (draft)
let autoSaveTimeout;
const formFields = document.querySelectorAll('.form-input, .form-select, .form-textarea');

formFields.forEach(field => {
    field.addEventListener('input', () => {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(saveFormDraft, 1000);
    });
});

function saveFormDraft() {
    const formData = new FormData(applicationForm);
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem('applicationDraft', JSON.stringify(data));
}

function loadFormDraft() {
    const draft = localStorage.getItem('applicationDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            Object.keys(data).forEach(key => {
                const field = document.getElementById(key);
                if (field && data[key]) {
                    field.value = data[key];
                }
            });
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
}

// Clear draft on successful submission
function clearFormDraft() {
    localStorage.removeItem('applicationDraft');
}

// Load draft on page load
document.addEventListener('DOMContentLoaded', loadFormDraft);

// Enhanced success modal - clear draft
const originalShowSuccessModal = showSuccessModal;
showSuccessModal = function() {
    clearFormDraft();
    originalShowSuccessModal();
};
