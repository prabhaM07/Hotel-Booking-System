let Bookings_Data = [];

async function fetchBookingsData() { 
    try {
        const response = await fetch('https://68c8b85aceef5a150f622643.mockapi.io/admin/3'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        const data = jsonData.bookings || []; // safely extract facilities

        Bookings_Data.length = 0; // clear existing
        Bookings_Data.push(...data); // push all items at once
        
        return Bookings_Data; 

    } catch (error) {
        console.error('Error fetching facilities data:', error);
        return [];
    }
}
Rooms_Data = []

async function fetchRoomsData() { 
    try {
        const response = await fetch('https://68c8b85aceef5a150f622643.mockapi.io/admin/5'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        const data = jsonData.rooms || []; // safely extract facilities

        Rooms_Data.length = 0; // clear existing
        Rooms_Data.push(...data); // push all items at once
        
        return Rooms_Data; 

    } catch (error) {
        console.error('Error fetching facilities data:', error);
        return [];
    }
}




document.addEventListener('DOMContentLoaded', async function() {
    
    await fetchBookingsData();
    await fetchRoomsData();

    console.log("Bookings Loaded:", Bookings_Data);
    console.log("Rooms Loaded:", Rooms_Data);
});


