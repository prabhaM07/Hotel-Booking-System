// Mock API Base URL
const API_BASE = 'https://68c8b85aceef5a150f622643.mockapi.io';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Define all required DOM elements after DOM loads
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const pwdInput = document.getElementById('password');
  const errorMsg = document.getElementById('errorMsg');
  const togglePwd = document.getElementById('togglePwd');
  
  // Check if required elements exist
  if (!loginForm || !emailInput || !pwdInput || !errorMsg) {
    console.error('Required DOM elements not found:', {
      loginForm: !!loginForm,
      emailInput: !!emailInput,
      pwdInput: !!pwdInput,
      errorMsg: !!errorMsg
    });
    return;
  }

  // Password visibility toggle
  if (togglePwd) {
    togglePwd.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
      pwdInput.setAttribute('type', type);
      this.innerHTML = type === 'password' ? '👁️' : '🙈';
    });
  }

  // Login form submission handler
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = pwdInput.value.trim();
    
    // Basic validation
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }
    
    // Email validation (basic)
    if (!email.includes('@') && !email.match(/^\d{10}$/)) {
      showError('Please enter a valid email or 10-digit mobile number');
      return;
    }
    
    // Add loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

    try {
      console.log('Attempting login with:', { email }); // Don't log password
      
      // Fetch admin data from your mock API
      const res = await fetch(`${API_BASE}/admin/1`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const adminData = await res.json();
      console.log('Fetched admin data:', adminData); // Debug log
      
      // Since your mock API returns an array, get the first admin user
      const adminUser = adminData; // Your data has only one admin user
      
      // Validate login credentials
      if (adminUser && adminUser.admin && 
          adminUser.admin.email === email && 
          adminUser.admin.password === password) {
        
        // Success
        hideError();
        showSuccess('Login successful! Redirecting...');
        
        // Store complete admin data including dashboard data
        localStorage.setItem('adminUser', JSON.stringify(adminUser.admin));
        localStorage.setItem('dashboardData', JSON.stringify(adminUser));
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.href = '../dashboard/dashboard.html';
        }, 1000);
        
      } else {
        showError('Invalid email or password');
        
        // Clear any previous data
        localStorage.removeItem('adminUser');
        localStorage.removeItem('dashboardData');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      showError('Could not reach login server. Please try again.');
    } finally {
      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });

  // Helper function to show error messages
  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    errorMsg.classList.add('text-red-500');
    errorMsg.classList.remove('text-green-500');
  }

  // Helper function to hide error messages
  function hideError() {
    errorMsg.classList.add('hidden');
  }

  // Helper function to show success messages
  function showSuccess(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    errorMsg.classList.add('text-green-500');
    errorMsg.classList.remove('text-red-500');
  }

  // Auto-hide error message when user starts typing
  emailInput.addEventListener('input', hideError);
  pwdInput.addEventListener('input', hideError);

  // Enter key handling for better UX
  emailInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      pwdInput.focus();
    }
  });

  pwdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loginForm.dispatchEvent(new Event('submit'));
    }
  });

  // Optional: Pre-fill credentials for testing
  if (window.location.search.includes('test=true')) {
    emailInput.value = 'admin@example.com';
    pwdInput.value = 'admin123';
  }

});

// Make functions globally accessible if needed
window.loginUtils = {
  clearStorage: function() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('dashboardData');
  }
};
