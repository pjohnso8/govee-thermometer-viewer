require("dotenv").config();
const fetch = require("node-fetch");
const { MongoClient } = require('mongodb');

// MongoDB setup
const uri = "mongodb+srv://parker:cmsc335password@cluster0.qsmpv.mongodb.net/CMSC335Final?retryWrites=true&w=majority";

// College Park station code is E09
const COLLEGE_PARK = "E09";

// Complete list of all WMATA station codes
const stationCodes = {
    "Addison Road-Seat Pleasant": "G03",
    "Anacostia": "F06",
    "Archives-Navy Memorial-Penn Quarter": "F02",
    "Arlington Cemetery": "C06",
    "Ashburn": "N12",
    "Ballston-MU": "K04",
    "Benning Road": "G01",
    "Bethesda": "A09",
    "Braddock Road": "C12",
    "Branch Ave": "F11",
    "Brookland-CUA": "B05",
    "Capitol Heights": "G02",
    "Capitol South": "D05",
    "Cheverly": "D11",
    "Clarendon": "K02",
    "Cleveland Park": "A05",
    "College Park-U of Md": "E09",
    "Columbia Heights": "E04",
    "Congress Heights": "F07",
    "Court House": "K01",
    "Crystal City": "C09",
    "Deanwood": "D10",
    "Downtown Largo": "G05",
    "Dunn Loring-Merrifield": "K07",
    "Dupont Circle": "A03",
    "East Falls Church": "K05",
    "Eastern Market": "D06",
    "Eisenhower Avenue": "C14",
    "Farragut North": "A02",
    "Farragut West": "C03",
    "Federal Center SW": "D04",
    "Federal Triangle": "D01",
    "Foggy Bottom-GWU": "C04",
    "Forest Glen": "B09",
    "Fort Totten": ["B06", "E06"],
    "Franconia-Springfield": "J03",
    "Friendship Heights": "A08",
    "Gallery Pl-Chinatown": ["B01", "F01"],
    "Georgia Ave-Petworth": "E05",
    "Glenmont": "B11",
    "Greenbelt": "E10",
    "Greensboro": "N03",
    "Grosvenor-Strathmore": "A11",
    "Herndon": "N08",
    "Huntington": "C15",
    "Hyattsville Crossing": "E08",
    "Innovation Center": "N09",
    "Judiciary Square": "B02",
    "King St-Old Town": "C13",
    "L'Enfant Plaza": ["D03", "F03"],
    "Landover": "D12",
    "Loudoun Gateway": "N11",
    "McLean": "N01",
    "McPherson Square": "C02",
    "Medical Center": "A10",
    "Metro Center": ["A01", "C01"],
    "Minnesota Ave": "D09",
    "Morgan Boulevard": "G04",
    "Mt Vernon Sq 7th St-Convention Center": "E01",
    "Navy Yard-Ballpark": "F05",
    "Naylor Road": "F09",
    "New Carrollton": "D13",
    "NoMa-Gallaudet U": "B35",
    "North Bethesda": "A12",
    "Pentagon": "C07",
    "Pentagon City": "C08",
    "Potomac Ave": "D07",
    "Potomac Yard": "C11",
    "Reston Town Center": "N07",
    "Rhode Island Ave-Brentwood": "B04",
    "Rockville": "A14",
    "Ronald Reagan Washington National Airport": "C10",
    "Rosslyn": "C05",
    "Shady Grove": "A15",
    "Shaw-Howard U": "E02",
    "Silver Spring": "B08",
    "Smithsonian": "D02",
    "Southern Avenue": "F08",
    "Spring Hill": "N04",
    "Stadium-Armory": "D08",
    "Suitland": "F10",
    "Takoma": "B07",
    "Tenleytown-AU": "A07",
    "Twinbrook": "A13",
    "Tysons": "N02",
    "U Street/African-Amer Civil War Memorial/Cardozo": "E03",
    "Union Station": "B03",
    "Van Dorn Street": "J02",
    "Van Ness-UDC": "A06",
    "Vienna/Fairfax-GMU": "K08",
    "Virginia Square-GMU": "K03",
    "Washington Dulles International Airport": "N10",
    "Waterfront": "F04",
    "West Falls Church": "K06",
    "West Hyattsville": "E07",
    "Wheaton": "B10",
    "Wiehle-Reston East": "N06",
    "Woodley Park-Zoo/Adams Morgan": "A04"
};

async function getStationToStationInfo(fromStation, toStation) {
    try {
        const response = await fetch(
            `https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo?FromStationCode=${fromStation}&ToStationCode=${toStation}`,
            {
                method: 'GET',
                headers: {
                    'api_key': '8735e3d470f44dc6abca0e456bc197d5'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data for ${fromStation} to ${toStation}:`, error);
        return null;
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function collectAllRoutes() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const collection = client.db("CMSC335Final").collection("wmata");
        let routesCollected = 0;
        
        // Get all destination stations
        const destinations = Object.entries(stationCodes).filter(([name]) => name !== "College Park-U of Md");
        const totalRoutes = destinations.length;

        for (const [stationName, stationCode] of destinations) {
            // Add a delay to respect API rate limits
            await delay(500);

            // Handle both single codes and array of codes
            const code = Array.isArray(stationCode) ? stationCode[0] : stationCode;

            const routeInfo = await getStationToStationInfo(COLLEGE_PARK, code);
            
            if (routeInfo && routeInfo.StationToStationInfos) {
                try {
                    await collection.insertOne({
                        timestamp: new Date(),
                        fromStation: "College Park-U of Md",
                        toStation: stationName,  // This will preserve the hyphens
                        toStationCode: code,
                        ...routeInfo
                    });
                    
                    routesCollected++;
                    console.log(`Collected route ${routesCollected}/${totalRoutes}: College Park to ${stationName} (${code})`);
                } catch (insertError) {
                    console.error(`Error inserting route to ${stationName} (${code}):`, insertError);
                }
            }
        }

        console.log(`Collection complete! Collected ${routesCollected} routes.`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB");
    }
}

// Run the collection script
collectAllRoutes().then(() => {
    console.log("Script finished executing");
});