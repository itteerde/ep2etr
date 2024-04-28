crew = game.folders.find(f => f.name === "PC").contents.map((a) => game.actors.get(a._id));

//console.log({crew: crew});

knowSkills = {
    academics: {
        aptitude: "cognition",
        skills: ["Archeology", "Astrobiology", "Astronomy", "Astrophysics", "Astrosociology", "Biology", "Botany", "Chemistry", "Computer Science", "Cryptography", "Economics", "Engineering", "Genetics", "Geology", "History", "Law", "Linguistics", "Mathematics", "Memetics", "Nanotechnology", "Physics", "Political Science", "Psychology", "Sociology", "Xeno-archeology", "Xenolinguistics", "Zoology"]
    },
    arts: {
        aptitude: "intuition",
        skills: ["Architecture", "AR Design", "Criticism", "Dance", "Drama", "Drawing", "Music", "Painting", "Performance", "Sculpture", "Singing", "Speech", "VR Design", "Writing"]
    },
    interests: {
        aptitude: "cognition",
        skills: ["Celebrities", "Conspiracies", "Factors", "Exhumans", "Exoplanet Colonies", "Gambling", "Hypercorp Politics", "Lunar Habitats", "Martian Beers", "Morphs", "Reclaimer Blogs", "Scum Drug Dealers", "Spaceship Models", "Strategy Games", "TITAN Tech", "Triad Economics", "Transhuman Factions", "Underground XP", "VR Games"]
    },
    professional: {
        aptitude: "cognition",
        skills: ["Accounting", "Administration", "Asteroid Mining", "Body Bank Ops", "Bodyguarding", "Cool Hunting", "Con Artistry", "Data Processing", "Ego Hunting", "Emergency Services", "Entertainment", "Fencing", "Field Science", "First-Contact Ops", "Flight Crew Ops", "Freelancing", "Gas Mining", "Gatecrashing", "Habitat Ops", "Instruction", "Investigation", "Journalism", "Lab Ops", "Medical Services", "Military Ops", "Morph Design", "Nanofacturing", "Network Engineering", "Police Ops", "Racketeering", "Scavenging", "Security Ops", "Service Work", "Smuggling", "Social Engineering", "Social Services", "Spycraft", "Surveying", "System Administration", "Terraforming"]
    }
};

//console.log({ knowSkills: knowSkills });

expertise = [];

knowSkills.academics.skills.forEach(s => {
    expertise.push({ name: s, field: "Academics", value: 0, experts: [] });
});
knowSkills.arts.skills.forEach(s => {
    expertise.push({ name: s, field: "Arts", value: 0, experts: [] });
});
knowSkills.interests.skills.forEach(s => {
    expertise.push({ name: s, field: "Interests", value: 0, experts: [] });
});
knowSkills.professional.skills.forEach(s => {
    expertise.push({ name: s, field: "Professional", value: 0, experts: [] });
});

expertise