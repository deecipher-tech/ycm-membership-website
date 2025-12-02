// Main JavaScript file for YCM website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Initialize components based on page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'membership.html') {
        initRegistrationForm();
    }
    
    if (currentPage === 'index.html' || currentPage === '') {
        initHomepageAnimations();
    }
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize state-LGA dropdowns if they exist
    initStateLGADropdowns();
});

// Scroll animations using Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with fade-in-up class
    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
}

// Homepage specific animations
function initHomepageAnimations() {
    // Add any homepage-specific JavaScript here
}

// State-LGA Dropdown functionality
function initStateLGADropdowns() {
    const stateSelect = document.getElementById('state_id');
    const lgaSelect = document.getElementById('lga_id');
    const lgaLoading = document.getElementById('lga_loading');

    if (!stateSelect || !lgaSelect) return;

    // Load states on page load
    loadStates();

    stateSelect.addEventListener('change', function() {
        const stateId = this.value;
        
        if (stateId) {
            lgaSelect.disabled = true;
            lgaSelect.innerHTML = '<option value="">Loading LGAs...</option>';
            
            if (lgaLoading) lgaLoading.classList.remove('hidden');
            
            loadLGAs(stateId);
        } else {
            lgaSelect.disabled = true;
            lgaSelect.innerHTML = '<option value="">Select LGA</option>';
        }
    });

    function loadStates() {
        fetch('../api/states.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    stateSelect.innerHTML = '<option value="">Select State</option>';
                    data.data.forEach(state => {
                        const option = document.createElement('option');
                        option.value = state.id;
                        option.textContent = state.name;
                        stateSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading states:', error);
            });
    }

    function loadLGAs(stateId) {
        fetch(`../api/lgas.php?state_id=${stateId}`)
            .then(response => response.json())
            .then(data => {
                if (lgaLoading) lgaLoading.classList.add('hidden');
                
                if (data.success) {
                    lgaSelect.innerHTML = '<option value="">Select LGA</option>';
                    data.data.forEach(lga => {
                        const option = document.createElement('option');
                        option.value = lga.id;
                        option.textContent = lga.name;
                        lgaSelect.appendChild(option);
                    });
                    lgaSelect.disabled = false;
                } else {
                    lgaSelect.innerHTML = '<option value="">Error loading LGAs</option>';
                }
            })
            .catch(error => {
                console.error('Error loading LGAs:', error);
                if (lgaLoading) lgaLoading.classList.add('hidden');
                lgaSelect.innerHTML = '<option value="">Error loading LGAs</option>';
            });
    }
}

// Registration Form Handling
function initRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const successMessage = document.getElementById('successMessage');
    const successDetails = document.getElementById('successDetails');

    if (!form) return;

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    function validateForm() {
        let isValid = true;
        const errors = {};

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.add('hidden');
        });
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });

        // Validate required fields
        const requiredFields = [
            'full_name', 'phone', 'email', 'dob', 'gender', 
            'state_id', 'lga_id', 'residential_address', 'occupation',
            'password', 'confirm_password'
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                errors[field] = 'This field is required';
                isValid = false;
            }
        });

        // Validate email format
        const email = document.getElementById('email');
        if (email && email.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                errors.email = 'Please enter a valid email address';
                isValid = false;
            }
        }

        // Validate phone format
        const phone = document.getElementById('phone');
        if (phone && phone.value) {
            const phoneRegex = /^(\+234[0-9]{10}|0[0-9]{10})$/;
            if (!phoneRegex.test(phone.value)) {
                errors.phone = 'Please enter a valid Nigerian phone number';
                isValid = false;
            }
        }

        // Validate date of birth (minimum age 16)
        const dob = document.getElementById('dob');
        if (dob && dob.value) {
            const birthDate = new Date(dob.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 16) {
                errors.dob = 'You must be at least 16 years old to register';
                isValid = false;
            }
        }

        // Validate password match
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm_password');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            errors.confirm_password = 'Passwords do not match';
            isValid = false;
        }

        // Validate password strength
        if (password && password.value && password.value.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
            isValid = false;
        }

        // Validate file uploads
        const fileFields = ['passport_photo', 'voters_card_front', 'voters_card_back'];
        fileFields.forEach(field => {
            const fileInput = document.getElementById(field);
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                const maxSize = 2.5 * 1024 * 1024; // 2.5MB

                if (!allowedTypes.includes(file.type)) {
                    errors[field] = 'Only JPG and PNG files are allowed';
                    isValid = false;
                }

                if (file.size > maxSize) {
                    errors[field] = 'File size must be less than 2.5MB';
                    isValid = false;
                }
            }
        });

        // Validate terms acceptance
        const terms = document.getElementById('terms');
        if (terms && !terms.checked) {
            errors.terms = 'You must accept the terms and conditions';
            isValid = false;
        }

        // Display errors
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(field + '_error');
            const inputElement = document.getElementById(field);
            
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.remove('hidden');
            }
            
            if (inputElement) {
                inputElement.classList.add('error');
            }
        });

        return isValid;
    }

    function submitForm() {
        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitText.textContent = 'Processing...';
        submitSpinner.classList.remove('hidden');

        const formData = new FormData(form);

        fetch('../api/register.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                form.classList.add('hidden');
                successDetails.textContent = `Your registration has been submitted successfully. Your membership ID is: ${data.membership_id}. You will receive a confirmation email shortly.`;
                successMessage.classList.remove('hidden');
                
                // Log success
                console.log('Registration successful:', data);
            } else {
                // Show error message
                alert('Registration failed: ' + (data.error || 'Unknown error'));
                
                // Re-enable form
                submitBtn.disabled = false;
                submitText.textContent = 'Complete Registration';
                submitSpinner.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again.');
            
            // Re-enable form
            submitBtn.disabled = false;
            submitText.textContent = 'Complete Registration';
            submitSpinner.classList.add('hidden');
        });
    }

    function checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.password-strength-bar');
        const strengthText = document.querySelector('.password-strength-text');
        const strengthContainer = document.querySelector('.password-strength');

        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = '';
        let color = '';

        // Check password length
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;

        // Check for mixed case
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 25;

        // Check for numbers and special characters
        if (password.match(/([0-9])/)) strength += 15;
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 10;

        // Determine strength level
        if (strength === 0) {
            text = '';
            color = 'transparent';
            strengthContainer.classList.add('hidden');
        } else if (strength < 50) {
            text = 'Weak';
            color = '#ef4444';
            strengthContainer.classList.remove('hidden');
        } else if (strength < 75) {
            text = 'Fair';
            color = '#f59e0b';
            strengthContainer.classList.remove('hidden');
        } else {
            text = 'Strong';
            color = '#10b981';
            strengthContainer.classList.remove('hidden');
        }

        strengthBar.style.width = strength + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initScrollAnimations,
        initStateLGADropdowns,
        initRegistrationForm,
        debounce
    };
}