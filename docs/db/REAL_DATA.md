# Maharashtra Real-World Disaster Dataset
## System Architecture

This document outlines the real-world historical and current data integration for the Aegis system. We have transitioned away from demo data to authentic geographical, demographic, and hazard data for the state of Maharashtra, India.

### 1. Data Sources
The dataset is aggregated from the following open-source and government portals:
*   **Geographical Data & Routing:** OpenStreetMap (OSM) for real driving distances and terrain-aware routing, replacing straight-line Haversine calculations.
*   **Disaster Zones & Habitations:** Maharashtra State Disaster Management Authority (SDMA) historical records, Geological Survey of India (GSI) landslide susceptibility mapping.
*   **Hydrological Data:** Central Water Commission (CWC) river gauge stations (e.g., Savitri at Mahad, Panchganga at Rajaram).
*   **Demographics:** Census 2011 Village Directory and district administrative extrapolations.
*   **Relief Centers:** Designated government disaster relief hubs (e.g., Balewadi Sports Complex, Dr. Babasaheb Ambedkar College Ground in North Mahad).

### 2. Implementation in Backend
The primary data store (`server/store/db.js`) has been completely overhauled to remove generic demo data. It now seeds the in-memory database (pre-PostgreSQL migration) with accurate Maharashtra locations.

#### Habitations (High-Risk Zones)
Real-world coordinates and hazard exposures have been plotted for critical zones across districts:
*   **Raigad:** Taliye Landslide Zone, Mahad Dadli Savitri Basin.
*   **Ratnagiri:** Chiplun Markandi Flood Funnel, Posare Landslide Hamlet.
*   **Kolhapur:** Shirol Nrusinhawadi Confluence, Chikhali Ambewadi.
*   **Sangli:** Haripur Irwin Bridge Krishna Basin.
*   **Pune & Satara:** Malin Ambegaon, Ambeghar Koyna Landslide Zone.

#### Relief Shelters & Safe Sites
Authentic high-ground structures and relief camps:
*   **Dr. Babasaheb Ambedkar College Ground (North Mahad):** Elevated tableland 45m above Savitri flood levels.
*   **Shiv Chhatrapati Sports Complex (Balewadi, Pune):** Premier national sports infrastructure.
*   **Government Medical College Ground (Miraj, Sangli):** High-elevation medical campus.

### 3. Distance & Routing Engine
The routing engine (`server/utils/aStarRouter.js`) has been upgraded with a graph of real Maharashtra highway nodes (NH-66, NH-48) and mountain passes (Tamhini Ghat, Varandha Ghat).
*   **Example Correction:** The driving distance between Mulshi Paud and Dr. Babasaheb Ambedkar College Ground (North Mahad) is now correctly calculated dynamically via road graphs (~90-95 km) rather than the 45km straight-line radius used in the prototype demo.

### 4. Next Steps
*   Migrate this real data into the PostgreSQL/PostGIS production database using the schemas defined by the Database Engineer.
*   Establish live API polling to CWC and IMD for real-time weather and river gauge updates.
