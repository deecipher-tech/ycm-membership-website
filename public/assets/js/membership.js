// Membership Registration JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize membership form
    initMembershipForm();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize file upload previews
    initFileUploadPreviews();
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

// File upload previews
function initFileUploadPreviews() {
    // Passport photo preview
    const passportInput = document.getElementById('passport_photo');
    const passportPreview = document.getElementById('passport_preview');
    
    if (passportInput && passportPreview) {
        passportPreview.addEventListener('click', () => passportInput.click());
        passportInput.addEventListener('change', function() {
            updateFilePreview(this, passportPreview, 'Passport Photo');
        });
    }
    
    // Voter card front preview
    const voterFrontInput = document.getElementById('voters_card_front');
    const voterFrontPreview = document.getElementById('voter_front_preview');
    
    if (voterFrontInput && voterFrontPreview) {
        voterFrontPreview.addEventListener('click', () => voterFrontInput.click());
        voterFrontInput.addEventListener('change', function() {
            updateFilePreview(this, voterFrontPreview, 'Voter Card Front');
        });
    }
    
    // Voter card back preview
    const voterBackInput = document.getElementById('voters_card_back');
    const voterBackPreview = document.getElementById('voter_back_preview');
    
    if (voterBackInput && voterBackPreview) {
        voterBackPreview.addEventListener('click', () => voterBackInput.click());
        voterBackInput.addEventListener('change', function() {
            updateFilePreview(this, voterBackPreview, 'Voter Card Back');
        });
    }
}

function updateFilePreview(input, previewElement, defaultText) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file size (max 2.5MB)
    const maxSize = 2.5 * 1024 * 1024;
    if (file.size > maxSize) {
        showFileError(input, `File size must be less than 2.5MB`);
        return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showFileError(input, 'Only JPG and PNG files are allowed');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewElement.innerHTML = `
            <div class="relative">
                <img src="${e.target.result}" alt="${file.name}" class="w-20 h-20 object-cover rounded-lg mx-auto">
                <div class="mt-2">
                    <p class="text-xs text-text-gray truncate">${file.name}</p>
                    <p class="text-xs text-green">${formatFileSize(file.size)}</p>
                </div>
            </div>
        `;
        clearFileError(input);
    };
    reader.readAsDataURL(file);
}

function showFileError(input, message) {
    const errorElement = document.getElementById(input.id + '_error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
    input.value = ''; // Clear the input
}

function clearFileError(input) {
    const errorElement = document.getElementById(input.id + '_error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Membership Form Handling
function initMembershipForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const successMessage = document.getElementById('successMessage');
    const successDetails = document.getElementById('successDetails');
    const errorMessage = document.getElementById('errorMessage');
    const errorTitle = document.getElementById('errorTitle');
    const errorDetails = document.getElementById('errorDetails');

    if (!form) return;

    // Initialize State-LGA dropdowns
    initStateLGADropdowns();

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirm_password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }

    // Age validation on date change
    const dobInput = document.getElementById('dob');
    if (dobInput) {
        dobInput.addEventListener('change', function() {
            validateAge(this.value);
        });
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            formatPhoneNumber(this);
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
        
        // Hide global error message
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }

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
            const ageErrors = validateAge(dob.value);
            if (ageErrors.length > 0) {
                errors.dob = ageErrors[0];
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
        if (password && password.value) {
            const passwordErrors = validatePasswordStrength(password.value);
            if (passwordErrors.length > 0) {
                errors.password = passwordErrors[0];
                isValid = false;
            }
        }

        // Validate file uploads
        const fileFields = ['passport_photo', 'voters_card_front', 'voters_card_back'];
        fileFields.forEach(field => {
            const fileInput = document.getElementById(field);
            if (fileInput && (!fileInput.files || fileInput.files.length === 0)) {
                errors[field] = 'Please upload this document';
                isValid = false;
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

    function validateAge(dob) {
        const errors = [];
        const minAge = 16;
        const maxAge = 35;
        
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < minAge) {
            errors.push(`You must be at least ${minAge} years old to register`);
        }
        
        if (age > maxAge) {
            errors.push(`Maximum age for registration is ${maxAge} years`);
        }
        
        return errors;
    }

    function validatePasswordStrength(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }
        
        if (!password.match(/[A-Z]/)) {
            errors.push("Password must contain at least one uppercase letter");
        }
        
        if (!password.match(/[a-z]/)) {
            errors.push("Password must contain at least one lowercase letter");
        }
        
        if (!password.match(/[0-9]/)) {
            errors.push("Password must contain at least one number");
        }
        
        return errors;
    }

    function validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm_password');
        const errorElement = document.getElementById('confirm_password_error');
        
        if (!password || !confirmPassword || !errorElement) return;
        
        if (password.value !== confirmPassword.value) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.classList.remove('hidden');
            confirmPassword.classList.add('error');
        } else {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
            confirmPassword.classList.remove('error');
        }
    }

    function formatPhoneNumber(input) {
        let phone = input.value.trim();
        
        // Remove all non-digit characters except +
        phone = phone.replace(/[^\d+]/g, '');
        
        // Convert local number to international format
        if (phone.startsWith('0')) {
            phone = '+234' + phone.substring(1);
        }
        
        // Ensure it starts with +234
        if (!phone.startsWith('+234') && phone.length === 11) {
            phone = '+234' + phone.substring(1);
        }
        
        input.value = phone;
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                form.classList.add('hidden');
                successDetails.textContent = `Your registration has been submitted successfully. Your membership ID is: ${data.membership_id}. You will receive a confirmation email shortly. Your application will be reviewed by the YCM membership committee.`;
                successMessage.classList.remove('hidden');
                
                // Log success
                console.log('Registration successful:', data);
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Show error message
                if (errorMessage && errorTitle && errorDetails) {
                    errorTitle.textContent = 'Registration Failed';
                    errorDetails.textContent = data.error || 'Unknown error occurred';
                    errorMessage.classList.remove('hidden');
                    errorMessage.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('Registration failed: ' + (data.error || 'Unknown error'));
                }
                
                // Re-enable form
                submitBtn.disabled = false;
                submitText.textContent = 'Complete Registration';
                submitSpinner.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            
            // Show error message
            if (errorMessage && errorTitle && errorDetails) {
                errorTitle.textContent = 'Network Error';
                errorDetails.textContent = 'An error occurred during registration. Please check your internet connection and try again.';
                errorMessage.classList.remove('hidden');
                errorMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('An error occurred during registration. Please try again.');
            }
            
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

// State-LGA Dropdown functionality
function initStateLGADropdowns() {
    const stateSelect = document.getElementById('state_id');
    const lgaSelect = document.getElementById('lga_id');
    const lgaLoading = document.getElementById('lga_loading');
    const lgaStatus = document.getElementById('lga_status');

    if (!stateSelect || !lgaSelect) return;

    // Load states on page load
    loadStates();

    stateSelect.addEventListener('change', function() {
        const stateId = this.value;
        
        if (stateId) {
            lgaSelect.disabled = true;
            lgaSelect.innerHTML = '<option value="">Loading LGAs...</option>';
            
            if (lgaLoading) lgaLoading.classList.remove('hidden');
            if (lgaStatus) {
                lgaStatus.textContent = 'Loading LGAs...';
                lgaStatus.classList.remove('text-text-gray');
                lgaStatus.classList.add('text-green');
            }
            
            loadLGAs(stateId);
        } else {
            lgaSelect.disabled = true;
            lgaSelect.innerHTML = '<option value="">Select LGA</option>';
            if (lgaStatus) {
                lgaStatus.textContent = 'Select a state first';
                lgaStatus.classList.remove('text-green');
                lgaStatus.classList.add('text-text-gray');
            }
        }
    });

    function loadStates() {
        fetch('../api/states.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    stateSelect.innerHTML = '<option value="">Select State</option>';
                    data.data.forEach(state => {
                        const option = document.createElement('option');
                        option.value = state.id;
                        option.textContent = state.name;
                        stateSelect.appendChild(option);
                    });
                } else {
                    console.error('Error loading states:', data.error);
                    stateSelect.innerHTML = '<option value="">Error loading states</option>';
                }
            })
            .catch(error => {
                console.error('Error loading states:', error);
                stateSelect.innerHTML = '<option value="">Error loading states</option>';
            });
    }

    function loadLGAs(stateId) {
        fetch(`../api/lgas.php?state_id=${stateId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
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
                    
                    if (lgaStatus) {
                        lgaStatus.textContent = `${data.data.length} LGAs loaded`;
                        lgaStatus.classList.remove('text-green');
                        lgaStatus.classList.add('text-text-gray');
                    }
                } else {
                    lgaSelect.innerHTML = '<option value="">Error loading LGAs</option>';
                    if (lgaStatus) {
                        lgaStatus.textContent = 'Error loading LGAs';
                        lgaStatus.classList.remove('text-green');
                        lgaStatus.classList.add('text-red-500');
                    }
                }
            })
            .catch(error => {
                console.error('Error loading LGAs:', error);
                if (lgaLoading) lgaLoading.classList.add('hidden');
                lgaSelect.innerHTML = '<option value="">Error loading LGAs</option>';
                if (lgaStatus) {
                    lgaStatus.textContent = 'Error loading LGAs';
                    lgaStatus.classList.remove('text-green');
                    lgaStatus.classList.add('text-red-500');
                }
            });
    }
}


// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMembershipForm,
        initScrollAnimations,
        initStateLGADropdowns
    };
}