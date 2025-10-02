let facilities_Data = [];

async function fetchfacilitiesData() { 
    try {
        const response = await fetch('https://68c8b85aceef5a150f622643.mockapi.io/admin/7'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        const data = jsonData.facilities || []; // safely extract facilities

        facilities_Data.length = 0; // clear existing
        facilities_Data.push(...data); // push all items at once
        
        return facilities_Data; 
    } catch (error) {
        console.error('Error fetching facilities data:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await fetchfacilitiesData();
    console.log("Facilities Loaded:", facilities_Data);
});
