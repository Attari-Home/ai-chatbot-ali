const fs = require('fs');

// Generate detailed questions and answers for UAE/Dubai
const generateDetailedQuestions = () => {
    const questions = [];

    // Tourist attractions details
    const attractions = [
        {
            name: "Burj Khalifa",
            details: "World's tallest building at 828m. Features observation decks, luxury restaurants, and stunning views. Built in 2010, designed by Adrian Smith."
        },
        {
            name: "Dubai Mall",
            details: "World's largest shopping mall with 1,200+ stores, Dubai Aquarium, VR Park, and the famous Dubai Fountain show."
        },
        {
            name: "Palm Jumeirah",
            details: "Artificial island shaped like a palm tree, home to luxury resorts, Atlantis The Palm, and exclusive beach clubs."
        },
        {
            name: "Dubai Marina",
            details: "Modern waterfront district with skyscrapers, yacht marina, walking paths, and vibrant nightlife scene."
        },
        {
            name: "Burj Al Arab",
            details: "7-star luxury hotel shaped like a sail, features helipad, luxury suites, and underwater restaurant."
        },
        {
            name: "Dubai Frame",
            details: "Largest picture frame in the world at 150m, offering panoramic views of old and new Dubai."
        },
        {
            name: "Dubai Miracle Garden",
            details: "World's largest flower garden with 150 million flowers, seasonal displays, and photo opportunities."
        },
        {
            name: "Dubai Creek",
            details: "Historic waterway dividing old and new Dubai, featuring abra boat rides and traditional markets."
        },
        {
            name: "Gold Souk",
            details: "Traditional gold market in Deira with 300+ shops, authentic jewelry, and competitive prices."
        },
        {
            name: "Atlantis Aquaventure",
            details: "World-class waterpark with 105 slides, marine habitats, and the world's largest aquarium tunnel."
        }
    ];

    // Generate questions for each attraction
    attractions.forEach(attraction => {
        questions.push({
            question: `Tell me about ${attraction.name}`,
            answer: `${attraction.name} is one of Dubai's most iconic landmarks. ${attraction.details} It's a must-visit destination that showcases Dubai's innovation and luxury.`
        });

        questions.push({
            question: `What makes ${attraction.name} special?`,
            answer: `${attraction.name} stands out for its unique features: ${attraction.details} This makes it a unique and memorable experience for visitors.`
        });

        questions.push({
            question: `Why should I visit ${attraction.name}?`,
            answer: `You should visit ${attraction.name} because: ${attraction.details} It's an essential part of experiencing Dubai's world-class attractions.`
        });
    });

    // Beaches and water activities
    const beaches = [
        {
            name: "JBR Beach",
            details: "Family-friendly beach with soft sand, calm waters, beach volleyball, restaurants, and promenade walks."
        },
        {
            name: "Kite Beach",
            details: "Popular for kitesurfing and water sports, features beach bars, live music, and vibrant atmosphere."
        },
        {
            name: "La Mer Beach",
            details: "Modern beach destination with entertainment, water sports, beach clubs, and family facilities."
        },
        {
            name: "Jumeirah Beach Park",
            details: "Largest public beach park with playgrounds, BBQ areas, sports facilities, and shaded areas."
        },
        {
            name: "Al Mamzar Beach Park",
            details: "Multiple beaches and pools, perfect for families, with water slides, playgrounds, and picnic areas."
        }
    ];

    beaches.forEach(beach => {
        questions.push({
            question: `What can I do at ${beach.name}?`,
            answer: `At ${beach.name}, you can enjoy: ${beach.details} It's perfect for relaxation and recreation.`
        });

        questions.push({
            question: `Is ${beach.name} good for families?`,
            answer: `${beach.name} is ${beach.details.includes('family') ? 'excellent for families' : 'great for various activities'}. ${beach.details} Plan your visit accordingly.`
        });
    });

    // Food and dining
    const foods = [
        {
            name: "Al Harees",
            details: "Traditional Emirati dish made from wheat and meat, slow-cooked for hours, served during special occasions."
        },
        {
            name: "Al Machboos",
            details: "National dish of UAE, spiced rice with meat (usually chicken or lamb), flavored with cardamom and cinnamon."
        },
        {
            name: "Luqaimat",
            details: "Sweet dumplings made from flour and yeast, deep-fried and coated in date syrup, traditional dessert."
        },
        {
            name: "Shawarma",
            details: "Middle Eastern street food, marinated meat roasted on vertical spit, served in pita with garlic sauce."
        },
        {
            name: "Khameer",
            details: "Traditional Emirati bread, similar to naan, served with curries, hummus, or as a side dish."
        }
    ];

    foods.forEach(food => {
        questions.push({
            question: `What is ${food.name}?`,
            answer: `${food.name} is a ${food.details} It's an authentic taste of Emirati cuisine.`
        });

        questions.push({
            question: `How is ${food.name} made?`,
            answer: `${food.name} is prepared by: ${food.details} The traditional preparation makes it unique and flavorful.`
        });

        questions.push({
            question: `Where can I try ${food.name} in Dubai?`,
            answer: `You can try authentic ${food.name} at traditional Emirati restaurants like Al Fanar, Arabian Tea House, or Al Dawaar. ${food.details}`
        });
    });

    // Transportation
    const transportOptions = [
        {
            name: "Dubai Metro",
            details: "Modern metro system with driverless trains, air-conditioned, covers major routes, operates 5 AM to 1 AM."
        },
        {
            name: "Dubai Tram",
            details: "Light rail system connecting Dubai Marina to Al Sufouh, scenic route along the coast, modern facilities."
        },
        {
            name: "Dubai Bus",
            details: "Extensive bus network covering the entire city, air-conditioned, affordable fares, connects to metro stations."
        },
        {
            name: "Taxi services",
            details: "Available through RTA, Careem, and Uber apps, reliable, metered fares, lady taxis available."
        },
        {
            name: "Water Taxi",
            details: "Boat service across Dubai Creek, traditional abras and modern boats, connects Deira and Bur Dubai."
        }
    ];

    transportOptions.forEach(transport => {
        questions.push({
            question: `How do I use ${transport.name} in Dubai?`,
            answer: `${transport.name} is easy to use: ${transport.details} It's a convenient way to get around the city.`
        });

        questions.push({
            question: `What are the advantages of ${transport.name}?`,
            answer: `${transport.name} offers: ${transport.details} It's designed for comfort and efficiency.`
        });
    });

    // Cultural experiences
    const culturalSites = [
        {
            name: "Dubai Museum",
            details: "Located in Al Fahidi Fort, showcases Dubai's history from pearl diving to modern development, interactive exhibits."
        },
        {
            name: "Sheikh Mohammed Centre for Cultural Understanding",
            details: "Cultural center offering insights into Emirati traditions, mosque visits, Arabic calligraphy, traditional meals."
        },
        {
            name: "Jumeirah Mosque",
            details: "Beautiful white mosque open to non-Muslims, guided tours available, stunning Islamic architecture."
        },
        {
            name: "Al Fahidi Historical District",
            details: "Old Dubai neighborhood with traditional architecture, art galleries, cafes, and cultural events."
        },
        {
            name: "Gold and Spice Souks",
            details: "Traditional markets in Deira, gold souk has 300+ shops, spice souk offers authentic Middle Eastern spices."
        }
    ];

    culturalSites.forEach(site => {
        questions.push({
            question: `What can I learn at ${site.name}?`,
            answer: `At ${site.name}, you can discover: ${site.details} It's a great way to understand Emirati culture and history.`
        });

        questions.push({
            question: `Is ${site.name} worth visiting?`,
            answer: `Yes, ${site.name} is definitely worth visiting because: ${site.details} It offers authentic cultural experiences.`
        });
    });

    // Shopping destinations
    const shoppingAreas = [
        {
            name: "Dubai Mall",
            details: "World's largest mall with luxury brands, entertainment, aquarium, and the spectacular Dubai Fountain."
        },
        {
            name: "Mall of the Emirates",
            details: "Features Ski Dubai, luxury shopping, diverse dining options, and entertainment complex."
        },
        {
            name: "Ibn Battuta Mall",
            details: "Themed mall inspired by explorer Ibn Battuta, six courtyards representing different cultures."
        },
        {
            name: "Dubai Marina Mall",
            details: "Waterfront shopping with international brands, dining, and marina views."
        },
        {
            name: "City Centre Mirdif",
            details: "Family-friendly mall with affordable shopping, entertainment, and diverse food court."
        }
    ];

    shoppingAreas.forEach(area => {
        questions.push({
            question: `What stores are in ${area.name}?`,
            answer: `${area.name} features: ${area.details} It's a comprehensive shopping destination.`
        });

        questions.push({
            question: `Why shop at ${area.name}?`,
            answer: `${area.name} offers: ${area.details} It's perfect for all your shopping needs.`
        });
    });

    // Weather and seasonal questions
    const weatherInfo = [
        {
            season: "Winter (November-March)",
            details: "Pleasant temperatures 15-25°C, ideal for outdoor activities, fewer crowds, comfortable sightseeing."
        },
        {
            season: "Spring (March-May)",
            details: "Warm temperatures 25-35°C, blooming gardens, good for desert activities, moderate tourist crowds."
        },
        {
            season: "Summer (June-September)",
            details: "Very hot 35-48°C, indoor activities recommended, air-conditioned malls, early morning outdoor activities."
        },
        {
            season: "Autumn (October-November)",
            details: "Warm temperatures 25-35°C, good weather for sightseeing, fewer tourists, pleasant evenings."
        }
    ];

    weatherInfo.forEach(weather => {
        questions.push({
            question: `What is the weather like in Dubai during ${weather.season}?`,
            answer: `During ${weather.season}, Dubai experiences: ${weather.details} Plan your activities accordingly.`
        });

        questions.push({
            question: `When is the best time to visit Dubai in ${weather.season.split(' ')[0]}?`,
            answer: `${weather.season} offers: ${weather.details} It's a great time for specific types of activities.`
        });
    });

    // Emergency and safety
    const emergencyTopics = [
        {
            topic: "Police emergency",
            details: "Call 999 for police assistance, available 24/7, English-speaking operators, quick response times."
        },
        {
            topic: "Medical emergency",
            details: "Call 998 for ambulance, modern hospitals like Cleveland Clinic Abu Dhabi, Mediclinic, and Saudi German Hospital."
        },
        {
            topic: "Fire emergency",
            details: "Call 997 for fire services, well-equipped fire department, rapid response throughout the city."
        },
        {
            topic: "Tourist police",
            details: "Call 800-4438 for tourist assistance, help with lost items, directions, and general guidance."
        }
    ];

    emergencyTopics.forEach(emergency => {
        questions.push({
            question: `What should I do in case of ${emergency.topic} in Dubai?`,
            answer: `For ${emergency.topic}: ${emergency.details} Stay calm and follow instructions.`
        });

        questions.push({
            question: `How do I contact ${emergency.topic} services?`,
            answer: `${emergency.topic} services: ${emergency.details} Remember these numbers for safety.`
        });
    });

    // Add more varied questions to reach 999+
    const generalQuestions = [
        {
            question: "What languages are spoken in Dubai?",
            answer: "Arabic is the official language, but English is widely spoken in business, tourism, and education. Hindi, Urdu, and other languages are common due to the diverse expatriate community."
        },
        {
            question: "Is Dubai safe for tourists?",
            answer: "Yes, Dubai is very safe for tourists with low crime rates, strict laws, and excellent police presence. However, always be aware of your surroundings and follow local customs."
        },
        {
            question: "What currency is used in UAE?",
            answer: "The UAE Dirham (AED) is the official currency. US Dollars, Euros, and other major currencies are widely accepted. ATMs are plentiful and credit cards are accepted everywhere."
        },
        {
            question: "Do I need a visa to visit UAE?",
            answer: "Many nationalities get visa on arrival (90 days for US citizens, 60 days for EU). Others need e-visa. Check UAE government website for your nationality requirements."
        },
        {
            question: "What is the time difference in Dubai?",
            answer: "Dubai is 8 hours ahead of GMT, 11 hours ahead of EST, and 4 hours behind IST. No daylight saving time is observed."
        },
        {
            question: "Can I drink alcohol in Dubai?",
            answer: "Alcohol is available in licensed hotels, restaurants, and bars for those 21+. Public drinking is not allowed. Duty-free alcohol available at airports."
        },
        {
            question: "What should I wear in Dubai?",
            answer: "Modest clothing is recommended - cover shoulders and knees in public places. Very conservative dress in mosques. Light, breathable fabrics for summer heat."
        },
        {
            question: "Is there public WiFi in Dubai?",
            answer: "Free WiFi available at malls, airports, and many public areas. Dubai Tourism app provides access. Hotels and cafes offer reliable WiFi."
        },
        {
            question: "How much should I tip in Dubai?",
            answer: "Tipping is not mandatory but appreciated (10% at restaurants). Small tips for taxi drivers and hotel staff. Not expected at fast food places."
        },
        {
            question: "What are the business hours in Dubai?",
            answer: "Government offices: Sunday-Thursday 7:30 AM-2:30 PM. Private sector: Sunday-Thursday 9 AM-6 PM. Malls: 10 AM-10 PM daily. Some businesses open Friday."
        }
    ];

    questions.push(...generalQuestions);

    // Generate more questions by varying existing ones
    const questionVariations = [
        "Can you tell me about",
        "I'd like to know about",
        "What do you know about",
        "Give me information on",
        "Tell me more about",
        "Explain",
        "Describe",
        "What is",
        "How does",
        "Where can I find"
    ];

    // Take first 200 questions and create variations
    const baseQuestions = questions.slice(0, 200);
    questionVariations.forEach(variation => {
        baseQuestions.forEach(q => {
            if (Math.random() < 0.1) { // Add 10% variations
                const newQuestion = q.question.replace(/^(What|Tell me|Where|How|Is|Can|Give)/, variation);
                questions.push({
                    question: newQuestion,
                    answer: q.answer
                });
            }
        });
    });

    return questions;
};

// Generate the questions
const newQuestions = generateDetailedQuestions();

// Load existing data
const existingData = JSON.parse(fs.readFileSync('src/assets/data/question_answer.json', 'utf8'));

// Combine and shuffle
const allQuestions = [...existingData.suggestions, ...newQuestions];
const shuffled = allQuestions.sort(() => Math.random() - 0.5);

// Keep only 999 new + original (about 1077 total)
const finalQuestions = shuffled.slice(0, 999 + existingData.suggestions.length);

// Save
const finalData = {
    suggestions: finalQuestions
};

fs.writeFileSync('src/assets/data/question_answer.json', JSON.stringify(finalData, null, 4));

console.log(`Added ${newQuestions.length} detailed questions. Total: ${finalQuestions.length}`);