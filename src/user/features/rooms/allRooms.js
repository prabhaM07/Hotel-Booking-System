// Global variables for filter functionality
let currentRating = 0;
let adultCount = 1;
let childCount = 0;


// Function to increment guest count
function incrementGuest(type) {
  if (type === 'adults') {
    adultCount++;
    document.getElementById('adultCount').textContent = adultCount;
  } else if (type === 'children') {
    childCount++;
    document.getElementById('childCount').textContent = childCount;
  }
}

// Function to decrement guest count
function decrementGuest(type) {
  if (type === 'adults' && adultCount > 1) {
    adultCount--;
    document.getElementById('adultCount').textContent = adultCount;
  } else if (type === 'children' && childCount > 0) {
    childCount--;
    document.getElementById('childCount').textContent = childCount;
  }
}

// Function to set rating - Updated for new star styling
// Function to set rating - Updated for simple star styling (no border)
function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.star');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      // Selected stars: fill with #EFB85A color
      star.classList.remove('text-[#F26538]');
      star.classList.add('text-[#EFB85A]');
    } else {
      // Unselected stars: default #F26538 color
      star.classList.remove('text-[#EFB85A]');
      star.classList.add('text-[#F26538]');
    }
  });
}


// Function to clear all filters
function clearAllFilters() {
  // Reset all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Reset date inputs
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.value = '';
  });
  
  // Reset price range
  document.getElementById('priceRange').value = 7500;
  document.getElementById('priceValue').textContent = '₹7,500';
  
  // Reset guest counters
  adultCount = 1;
  childCount = 0;
  document.getElementById('adultCount').textContent = adultCount;
  document.getElementById('childCount').textContent = childCount;
  
  // Reset rating
  setRating(0);
}


// Event listener for price range slider
document.addEventListener('DOMContentLoaded', function() {
  const priceRange = document.getElementById('priceRange');
  
  if (priceRange) {
    priceRange.addEventListener('input', function() {
      const value = parseInt(this.value).toLocaleString('en-IN');
      const priceValue = document.getElementById('priceValue');
      if (priceValue) {
        priceValue.textContent = '₹' + value;
      }
    });
  }
});

// Event listener for escape key to close sidebar
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeFilterSidebar();
  }
});



user = localStorage.getItem('user_id');

if(user != null){
  
}
