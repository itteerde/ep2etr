var start_time = performance.now();
console.log("tablerules is loading.");

const MODULE_SCOPE = "tablerules";
const RARE_GP = 4;

class TRUtils {

    static isDebugEnabled() {
        return (game.settings.get(MODULE_SCOPE, "logLevel") >= 3);
    }

    static registerSettings() {
        game.settings.register(MODULE_SCOPE, 'isEnabled', {
            name: "Enable Tablerules",
            hint: "Enables Tablerules Module changes. If we ever implement this disabling this setting will make all other Tablerules settings be ignored and return the stuff that has settings configured return to what it is without the Module. This has no effect as of now, and might just get removed instead of being implemented in the future.",
            scope: 'world',
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "healthBarHack", {
            name: "Use Healt Bar Hack",
            hint: "on updateActor modifies the system data with system.hp which has the structure to be displayed as a health bar on token with the correct coloring (dropping dur remaining).",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "whispersIncludeGM", {
            name: "Whispers, add GM",
            hint: "adds the GM to all whispered chat messages",
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "modifyDefaultVolumes", {
            name: "Modify Default Volumes",
            hint: "modified the core default volumes, if enabled the Module checks the current settings and adjusts them to the configured below values if they are at assumed core default values.",
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "globalPlaylistVolume", {
            name: "globalPlaylistVolume default overwrite value",
            hint: "if Modify Default Volumes is enabled this overwrites the core default",
            scope: "world",
            config: true,
            default: 0.1,
            type: Number,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "globalAmbientVolume", {
            name: "globalAmbientVolume default overwrite value",
            hint: "if Modify Default Volumes is enabled this overwrites the core default",
            scope: "world",
            config: true,
            default: 0.1,
            type: Number,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "globalInterfaceVolume", {
            name: "globalInterfaceVolume default overwrite value",
            hint: "if Modify Default Volumes is enabled this overwrites the core default",
            scope: "world",
            config: true,
            default: 0.1,
            type: Number,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "modifyChatBubbles", {
            name: "modify the default for Chat Bubbles",
            hint: "modifies the default for Chat Bubbles. Users can still overwrite this changed default.",
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "chatBubbles", {
            name: "chatBubbles default overwrite",
            hint: "if Modify Chat Bubbles is enabled, overwrite the default setting for displaying chat Bubbles",
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "chatBubblesPan", {
            name: "chatBubbles Pan default overwrite",
            hint: "if Modify Chat Bubbles is enabled, overwrite the default setting for displaying chat Bubbles",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, "logLevel", {
            name: "Log Level",
            hint: "The Module's own log level. By default FVTT and the module don't log debug and info. Set to error for normal operation and debug for development.",
            scope: 'world',
            config: true,
            default: "error",
            type: Number,
            choices: {
                0: "error",
                1: "warning",
                2: "info",
                3: "debug"
            },
            requiresReload: true
        });

        game.settings.register(MODULE_SCOPE, 'logOwn', {
            name: "Use own logging function.",
            hint: "Enable to log using own logging method. Disable for play and enable for development if debugging (with Log Level set to debug above).",
            scope: 'world',
            config: true,
            default: false,
            type: Boolean,
            requiresReload: true
        });
    }

    static renderGearToChat(item) {
        if (!item) {
            ChatMessage.create({ content: `cannot render, item: ${item}` });
        }
    }
}

class Tablerules {

    static config = {
        loglevel: 0,
        logOwn: false
    }

    static log(level, message) {
        let levelstring;

        switch (level) {
            case 0:
                levelstring = "ERROR";
                break;
            case 1:
                levelstring = "WARNING";
                break;
            case 2:
                levelstring = "INFO";
                break;
            case 3:
                levelstring = "DEBUG";
                break;
            default:
                console.error("No logging level set.");
                console.error(message);
        }

        if (typeof message === "object") {
            console.log(message);
        } else {
            console.log({ message: "Tablerules | " + levelstring + ":" + message, obj: typeof message === "object" ? message : null });
        }
    }

    static debug(message) {
        if (Tablerules.config.loglevel < 3)
            return;
        if (Tablerules.config.logOwn) {
            Tablerules.log(3, message);
        } else {
            console.debug(message);
        }
    }

    static error(message) {
        if (Tablerules.config.logOwn) {
            Tablerules.log(0, message);
        } else {
            console.error(message);
        }
    }

    static warn(message) {
        if (Tablerules.config.loglevel < 1)
            return;
        if (Tablerules.config.logOwn) {
            Tablerules.log(1, message);
        } else {
            console.warn(message);
        }
    }

    static info(message) {
        if (Tablerules.config.loglevel < 2)
            return;
        if (Tablerules.config.logOwn) {
            Tablerules.log(2, message);
        } else {
            console.info(message);
        }
    }
}

class TREP2eDB {

    static sources = new Map();

    /**
     * for populating the sources Map only (readability and stuff)
     * 
     * name: technical name (our id, don't want to use id as we might want to put an external id in that property)
     * cName: full human readable name
     * label: for display purposes, probably always name
     * bibLaTeX: for LaTeX citations
     */
    static sourcesArray = [
        { name: "ep2e", cName: "Eclipse Phase 2nd Edition", label: "ep2e", bibLaTeX: "ep2e_1.1_2019" }
    ];

    static skills = [
        { name: "Accounting", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Administration", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "AR Design", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Archeology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Architecture", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Asteroid Mining", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Astrobiology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Astronomy", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Astrophysics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Astrosociology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Athletics", types: ["Active", "Physical"], value: 0, aptitude: "Somatics" },
        { name: "Animal Handling", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Savvy" },
        { name: "Biology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Black Markets", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Body Bank Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Bodyguarding", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Bow", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "Bot Models", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Reflexes" },
        { name: "Cartel Politics", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Celebrities", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Chemistry", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Computer Science", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Con Artistry", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Conflict Zones", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Conspiracies", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Cool Hunting", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Criticism", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Cryptography", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Current Events", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Intuition" },
        { name: "Dance", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Data Processing", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Deceive", types: ["Active", "Social"], value: 0, aptitude: "Savvy" },
        { name: "Disguise", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Intuition" },
        { name: "Drama", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Drawing", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Economics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Ego Hunting", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Emergency Services", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Engineering", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Entertainment", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Escape Artist", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "Exhumans", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Exoplanet Colonies", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Factors", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Fencing", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Field Science", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "First-Contact Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Flight Crew Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Fray", types: ["Active", "Combat"], value: 0, aptitude: "Reflexes" },
        { name: "Free Fall", types: ["Active", "Physical"], value: 0, aptitude: "Somatics" },
        { name: "Freelancing", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Gambling", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Gas Mining", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Gatecrashing", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Genetics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Geology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Guns", types: ["Active", "Combat"], value: 0, aptitude: "Reflexes" },
        { name: "Habitat Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Hardware: Aerospace", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition", bookName: "Aerospace (aircraft and spacecraft)", source: { source: "ep2e", page: 49 } },
        { name: "Hardware: Armorer", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition" },
        { name: "Hardware: Demolitions", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition" },
        { name: "Hardware: Electronics", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition", bookName: "Electronics", source: { source: "ep2e", page: 49 } },
        { name: "Hardware: Groundcraft", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition" },
        { name: "Hardware: Industrial", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition", bookName: "Electronics", source: { source: "ep2e", page: 49 } },
        { name: "Hardware: Robotics", types: ["Active", "Field", "Technical"], value: 0, aptitude: "Cognition", bookName: "Robotics (bots and synthmorphs)", source: { source: "ep2e", page: 49 } },
        { name: "History", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Hypercorp Politics", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Infiltrate", types: ["Active", "Physical"], value: 0, aptitude: "Reflexes" },
        { name: "Infosec", types: ["Active", "Technical"], value: 0, aptitude: "Cognition" },
        { name: "Instruction", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Interface", types: ["Active", "Technical"], value: 0, aptitude: "Cognition" },
        { name: "Investigation", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Journalism", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Kinesics", types: ["Active", "Social"], value: 0, aptitude: "Savvy" },
        { name: "Lab Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Law", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Linguistics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Lunar Habitats", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Martian Beers", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Mathematics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Medical Services", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Medicine: Biotech", types: ["Active", "Field", "Technical", "Medicine"], value: 0, aptitude: "Cognition" },
        { name: "Medicine: Forensics", types: ["Active", "Field", "Technical", "Medicine"], value: 0, aptitude: "Cognition" },
        { name: "Medicine: Paramedic", types: ["Active", "Field", "Medicine"], value: 0, aptitude: "Cognition" },
        { name: "Medicine: Pharmacology", types: ["Active", "Field", "Technical", "Medicine"], value: 0, aptitude: "Cognition" },
        { name: "Medicine: Psychosurgery", types: ["Active", "Field", "Technical", "Medicine"], value: 0, aptitude: "Cognition" },
        { name: "Medicine: Veterinary", types: ["Active", "Field", "Technical", "Medicine"], value: 0, aptitude: "Cognition" },
        { name: "Melee", types: ["Active", "Combat"], value: 0, aptitude: "Somatics" },
        { name: "Memetics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Military Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Monowire Garrote", types: ["Active", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "Morph Design", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Morphs", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Music", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Nanofacturing", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Nanotechnology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Network Engineering", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Painting", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Perceive", types: ["Active", "Combat"], value: 0, aptitude: "Intuition" },
        { name: "Performance", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Persuade", types: ["Active", "Social"], value: 0, aptitude: "Savvy" },
        { name: "Physics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Pilot: Air", types: ["Active", "Field", "Vehicle", "Pilot"], value: 0, aptitude: "Reflexes" },
        { name: "Pilot: Ground", types: ["Active", "Field", "Vehicle", "Pilot"], value: 0, aptitude: "Reflexes" },
        { name: "Pilot: Nautical", types: ["Active", "Field", "Vehicle", "Pilot"], value: 0, aptitude: "Reflexes" },
        { name: "Pilot: Space", types: ["Active", "Field", "Vehicle", "Pilot"], value: 0, aptitude: "Reflexes" },
        { name: "Plasma Cutter", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "Police Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Political Science", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Program", types: ["Active", "Technical"], value: 0, aptitude: "Cognition" },
        { name: "Provoke", types: ["Active", "Social"], value: 0, aptitude: "Savvy" },
        { name: "PSI", types: ["Active", "Mental", "Psi"], value: 0, aptitude: "Willpower" },
        { name: "Psychology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Racketeering", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Reclaimer Blogs", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Research", types: ["Active", "Technical"], value: 0, aptitude: "Intuition" },
        { name: "Spaceship Models", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Scavenging", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Sculpture", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Scum Drug Dealers", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Security Ops", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Service Work", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Singing", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Sleight of Hand", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "Smuggling", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Social Engineering", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Social Services", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Sociology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Speech", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Spycraft", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Stock Market", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Strategy Games", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Surveying", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Survival", types: ["Active", "Physical"], value: 0, aptitude: "Intuition" },
        { name: "System Administration", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Terraforming", types: ["Know", "Field", "Professional Training"], value: 0, aptitude: "Cognition" },
        { name: "Throwing Knieves", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "TITAN Tech", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Transhuman Factions", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Triad Economics", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Uplift Rights", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Underground XP", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "VR Design", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "VR Games", types: ["Know", "Field", "Interests"], value: 0, aptitude: "Cognition" },
        { name: "Whips", types: ["Active", "Field", "Exotic"], value: 0, aptitude: "Reflexes" },
        { name: "Writing", types: ["Know", "Field", "Arts"], value: 0, aptitude: "Intuition" },
        { name: "Xeno-archeology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Xenolinguistics", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
        { name: "Zoology", types: ["Know", "Field", "Academics"], value: 0, aptitude: "Cognition" },
    ];

    static factions = [
        { name: "Anarchist", description: "You believe power is corrupt and favor voluntary, non-hierarchical organizations based on direct democracy." },
        { name: "Argonaut", description: "You seek technoprogressive solutions to transhumanity's injustices and inequalities." },
        { name: "Barsoomian", description: "You wish to see Mars liberated from hypercorp control." },
        { name: "Brinker", description: "You belong to a cult, commune, or other group that seeks isolation from the rest of transhumanity." },
        { name: "Criminal", description: "You are associated with the underworld, either part of a large cartel, smaller gang, or as an independent operator." },
        { name: "Extropian", description: "You believe in unrestricted free markets and that taking proactive risks with technology is better than playing it safe." },
        { name: "Hypercorp", description: "You support hypercapitalist expansion and competitive-economics-driven social order. You accept that certain liberties must be restricted for security and freedom." },
        { name: "Jovian", description: "You are a bioconservative concerned about out-of-contol transhuman technologies." },
        { name: "Lunar/Orbital", description: "You support the conservative economics, Earth-tied nationalism, and traditionalism of the Lunar-Lagrange Alliance." },
        { name: "Mercurial", description: "You oppose the assimilation and oppression of AGIs and uplifts, supporting self-determination for your kind." },
        { name: "Reclaimer", description: "You believe transhumanity should be focused on reclaiming, terraforming, and repopulating Earth." },
        { name: "Scum", description: "You push the boundaries of the experimental, fully testing what it means to be transhuman." },
        { name: "Socialite", description: "You are a part of the glitterati, defining and defined by inner-system media culture." },
        { name: "Titanian", description: "You are a technosocialist, believing that science and technology can provide for the well-being of all." },
        { name: "Venusian", description: "You adhere to the Morningstar Constellation's vision for a more socialized, friendlier hypercapitalism." },
        { name: "Regional", description: "You are a Solarian, Sifter, Belter, Europan, Ringer, or Skimmer invested in the culture, prosperity, and security of your area of the Solar System." },
    ];

    /**
     * The Skills the System's author singled out to have special meaning and put into the EPactor model directly. For a more general approach they have to be unified with those they decided to implement as Item. There is nothing wrong with having a nice runtime solution (caching essentially) avoiding CPR's performance problems. The problem is that there is never one uniform database to refer to, even for operations than can be slow, like reporting. Therefore we create that single database independently and couple uni-directionally (we pull System data into the Module, instead of extending the System directly) and losely.
     */
    static modelSkills = ["Infosec", "Interface", "Perceive", "Program", "Research", "Survival", "Deceive", "Kinesics", "Persuade", "Provoke", "PSI", "Athletics", "Fray", "Free Fall", "Guns", "Infiltrate", "Melee"];

    /**
     * Everything keywording/ tagging/ classifying in the rules should be available for computation.
     */
    static wareTypes = [
        { name: null, abbreviation: null, description: null, source: { source: null, page: null } }
    ];

    /**
     * Could alternatively put it all into a JournalEntry. Don't think making it EPItem is really an option though. And if that isn't an option I think this is better. Can a Module extend the data model?
     */
    static gear = [
        {
            name: "Armor Clothing",
            classification: ["Armor"],
            waretypes: [],
            compexity: { compexity: "Min", gp: 1, restricted: false },
            description: 'Resilient fibers and fullerenes are interwoven with normal smart materials to provide a subtle level of security. Such garments are indistinguishable from regular smart clothing and come in all styles and designs.',
            notes: ["Concealable"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Armor Coat",
            classification: ["Armor"],
            wareTypes: [],
            compexity: { compexity: "Min", pg: 1, restricted: false },
            description: 'Like armor clothing, this slightly bulkier coat provides a layer of discreet protection with smart material fabrics.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Armor Vest (Heavy)",
            classification: ["Armor"],
            waretypes: [],
            compexity: { compexity: "Mod", gp: 2, restricted: false },
            description: 'Armor vests protect the body’s vital areas. Light vests cover the abdomen and torso and can be concealed under other clothing. Heavy vests are bulkier and obvious, protecting the neck with a rigid collar, and even providing wrap-under protection for the groin.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Armor Vest (Light)",
            classification: ["Armor"],
            waretypes: [],
            complexity: { compexity: "Min", gp: 1, restricted: false },
            description: 'Armor vests protect the body’s vital areas. Light vests cover the abdomen and torso and can be concealed under other clothing. Heavy vests are bulkier and obvious, protecting the neck with a rigid collar, and even providing wrap-under protection for the groin.',
            notes: ["Concealable"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Atlas Loader",
            classification: ["Armor", "Vehicle", "Exoskeleton"],
            waretypes: [],
            compexity: { complexity: "Rare", gp: RARE_GP, restricted: false },
            description: 'This common example of a heavy-use industrial exoskeleton is large (just over 3 meters tall) and designed for handling heavy/large objects. Though open frame, the wearer is partially protected by a meshed cage. Atlas’s provide a +2 bonus to Vigor pool and increase melee damage by +2d10. Melee damage also becomes armor-piercing.',
            notes: [],
            size: "VL",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 350 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }
            ]
        },
        {
            name: "Ballistic Shield",
            classification: ["Armor"],
            waretypes: [],
            complexity: { complexity: "Mod", gp: 2, restricted: false },
            description: 'This heavy shield is essentially a portable barrier equipped with floodlights. It requires both hands to carry.',
            notes: ["Two-Handed"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Battle Laser",
            classification: ["Beam Weapon"],
            waretypes: [],
            complexity: { compexity: "Maj", gp: 3, restricted: true },
            description: 'This heavy laser pulser is typically mounted and used for battlefield support, firing more powerful beams than the standard laser pulser.',
            notes: ["Fixed", "Long"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 208 }]
        },
        {
            name: "Battlesuit",
            classification: ["Armor", "Vehicle"],
            waretypes: [],
            compexity: { compexity: "Rare", gp: RARE_GP, restricted: true },
            description: 'This power armor features a military-grade fullerene armor shell with flexible aerogel for thermal insulation and a diamond-hardened exterior designed to resist even potent ballistic and energy-based weapons. It increases Vigor pool by 2, inflicts an extra 1d10 damage in melee, increases your Walker movement rate to 8/32, and doubles your jumping distance.',
            notes: [],
            size: "L",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 351 }
            ]
        },
        {
            name: "Bioweave",
            classification: ["Armor"],
            waretypes: ["B"],
            compexity: { complexity: "Min", gp: 1, restricted: false },
            description: 'The morph’s dermal layers are laced with spidersilk fibers, providing protection without changing the appearance, texture, or sensitivity of the skin.',
            notes: ["Concealable"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 214 }]
        },
        {
            name: "Body Armor",
            classification: ["Armor"],
            waretypes: [],
            complexity: { compexity: "Mod", gp: 2, restricted: false },
            description: 'These high performance armor outfits, typically worn by security and police forces, protect the wearer from head to toe. The integrated armor vest, helmet, gauntlets, and limb guards are form-fitting, flexible, and non-restrictive. The suit includes a built-in ecto, cameras, and health monitors.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Combat Armor",
            classification: ["Armor"],
            waretypes: [],
            complexity: { complexity: "Maj", gp: 3, restricted: true },
            description: 'A tougher version of body armor worn by soldiers, this suit is environmentally sealed with climate control to protect the wearer from hostile environments and chemicals with 1 hour of air.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Crash Suit",
            classification: ["Armor"],
            waretypes: [],
            complexity: { complexity: "Min", gp: 1, restricted: false },
            description: 'Designed for industrial workplace safety and protection from accidental zero-g collisions, crash suits are also favored by sports enthusiasts and explorers. The basic jumpsuit offers comfortable protection, but in more hazardous circumstances the suit can be activated with an electronic signal, so that elastic polymers stiffen and form rigid impact protection for vital areas.',
            notes: ["Concealable"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Cybercortex",
            classification: ["Mental Augmentation"],
            waretypes: ["C"],
            compexity: { complexity: "Mod", gp: 2, restricted: false },
            description: 'Designed for smart animals, this artificial cortex aid increases the creature’s ability to learn, comprehend instructions, and reason. It also overrides some instinctive behaviors that would be undesirable in a service animal. Apply a +10 modifier to Exotic Skill: Animal Handling Tests made against this creature, and apply a +10 modifier for COG Checks to understand commands.',
            notes: [],
            size: "VS",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 320 }]
        },
        {
            name: "Dermal Armor",
            classification: ["Armor"],
            waretypes: ["B"],
            complexity: { complexity: "Min", gp: 1, restricted: false },
            description: 'The morph is equipped with a dense layer of ballistic fibers and flexible subdermal plates. This does not reduce mobility, but it does make the skin smoother and less flexible (except at the joints), and the plated areas are visibly raised. The morph’s touch-based perception suffers a –20 modifier.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Envirosuit",
            classification: ["Armor", "Hardsuit"],
            waretypes: [],
            complexity: { complexity: "Maj", gp: 3, restricted: false },
            description: 'These shells feature both increased radiation shielding and thermal regulation systems to withstand extreme environments such as deep undersea and the surfaces of Mercury and Venus. They can withstand temperatures from –270 to 1,000 C.',
            notes: [],
            size: "M",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 351 }
            ]
        },
        {
            name: "Exowalker Frame",
            classification: ["Armor", "Exoskeleton", "Vehicle"],
            waretypes: [],
            complexity: { compexity: "Maj", gp: 3, restricted: false },
            description: 'Exowalkers are minimal framework exoskeletons, primarily designed to bolster the wearer’s strength and movement. They provide a +1 bonus to Vigor pool, increase melee damage by 1d6, increase your walker speed to 8/32 (fast), and double your jumping distance.',
            notes: [],
            size: "M",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 350 }
            ]
        },
        {
            name: "Guardian Angel",
            classification: ["Bot"],
            waretypes: ["H"],
            compexity: { compexity: "Mod", gp: 2, restricted: false },
            description: 'Similar to gnats, guardian angels are larger rotorcraft used for defensive purposes. They hover around their charges, keeping a watchful eye out to protect them from threats.',
            statsblock: null, // this would be where the table with all the game mechanics goes, probably only useful if html ready to be rendered. The rendered content could be in Journal. Guess a few MByte on load and in memory are actually better than lagging the fromUUID loads. So no, if we do it we do it this way. Just might have to switch it to another data structure.
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 347 }]
        },
        {
            name: "Hand Laser",
            classification: ["Beam Weapon"],
            waretypes: ["C", "H"],
            compexity: { compexity: "Mod", gp: 2, restricted: true },
            description: 'The morph has a weapon-grade laser implanted in its forearm, with a flexible waveguide leading to a lens located between the first two knuckles on the morph’s dominant hand. The laser’s  batteries are implanted and not easily swapped out in biomorphs.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 208 }]
        },
        {
            name: "Hardsuit",
            classification: ["Armor", "Hardsuit"],
            waretypes: [],
            complexity: { compexity: "Rare", gp: 6, restricted: false },
            description: 'This heavy-duty suit can almost be considered a miniature spaceship. It appears as a large metallic ovoid with jointed, servo-assisted arms and legs. It increases Vigor pool by 1 and inflicts an extra 1d10 damage in melee. Its miniature plasma thrusters are capable of delivering 0.01 g for 10 hours.',
            notes: [],
            size: "L",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 351 }
            ]
        },
        {
            name: "Heavy Combat Armor",
            classification: ["Armor"],
            waretypes: ["H"],
            complexity: { complexity: "Maj", gp: 3, restricted: false },
            description: 'These bulky and noticeable armor plates protect against heavy weaponry for serious combat operations. The shell’s mobility systems and power output are also modified to handle the extra mass.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Helmet",
            classification: ["Armor"],
            waretypes: [],
            compexity: { compexity: "Min", gp: 1, restricted: false },
            description: 'Helmets come in various open and closed styles, all protecting the head. If targeted with a called shot, helmets have AV 4/10. Helmets are already included with body armor, combat armor, and all suits (use that armor´s full AV against called head shots).',
            notes: ["AV 4/10 vs. head shots"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "High-Dive Suit",
            classification: ["Armor", "Hardsuit"],
            waretypes: [],
            compexity: { compexity: "Maj", gp: 3, restricted: false },
            description: 'High-dive suits are personal spacesuits designed to withstand atmospheric re-entry. Wearing one of these, you can step out a spacecraft in orbit around a planet, enter the atmosphere without burning up, and safely land using both drogue and conventional parachutes. High-dive suits are meant for unpowered descent only; they do not possess the capability for flight.',
            notes: [],
            size: "M",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 351 }
            ]
        },
        {
            name: "Industrial Armor",
            classification: ["Armor"],
            waretypes: ["H"],
            compexity: { complexity: "Min", gp: 1, restricted: false },
            description: 'This armor is designed to protect shells from collisions, extreme weather, industrial accidents, and similar wear-and-tear.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Light Combat Armor",
            classification: ["Armor"],
            waretypes: ["H"],
            complexity: { complexity: "Mod", gp: 2, restricted: false },
            description: 'This light plating is common for shells used in security and policing duties.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Medium Pistol (Firearm)",
            classification: ["Kinetic Weapon", "Firearm"],
            waretypes: [],
            compexity: { compexity: "Min", gp: 1, restricted: true },
            description: '',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Riot Shield",
            classification: ["Armor"],
            waretypes: [],
            compexity: { compexity: "Min", gp: 1, restricted: false },
            description: 'Used for mob suppression, riots shields are lightweight, tough, and can be set to electrify on command, (treat as a melee shock attack ▶219).',
            notes: ["Shock, Touch-Only"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Scale/Carapace Armor",
            classification: ["Armor"],
            waretypes: ["B"],
            complexity: { complexity: "Mod", gp: 2, restricted: false },
            description: 'As dermal armor, but combined with hard but flexible external chitinous scales and/or plates, modeled on arthropod exoskeletons. This armor is obvious and the skin has the appearance of a crocodile, insect, pangolin, snake, or similarly armored creature.',
            notes: [],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Second Skin",
            classification: ["Armor"],
            waretypes: [],
            complexity: { complexity: "Min", gp: 1, restricted: false },
            description: 'This lightweight bodysuit, woven from spider silks and fullerenes, is typically worn as an underlayer, though some athletes use it as a uniform.',
            notes: ["Concealable"],
            size: "S",
            sources: [{ source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 }]
        },
        {
            name: "Transporter Exoskeleton",
            classification: ["Armor", "Exoskeleton", "Vehicle"],
            waretypes: [],
            compexity: { compexity: "Mod", gp: 2, restricted: false },
            description: 'This exoskeleton framework features a pair of vector-thrust turbofan engines, giving you flight capabilities. Use Pilot: Air and a Movement Rate of 8/40 (very fast).',
            notes: [],
            size: "L",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 350 }
            ]
        },
        {
            name: "Trike Exoskeleton",
            classification: ["Armor", "Exoskeleton", "Vehicle"],
            waretypes: [],
            compexity: { compexity: "Mod", gp: 2, restricted: false },
            description: 'The trike exoskeleton is a three-wheeled personal motorcycle design, rather than a walker. Use Pilot: Ground and a Movement Rate of 8/40 (very fast).',
            notes: [],
            size: "L",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 350 }
            ]
        },
        {
            name: "Vacsuit (Light)",
            classification: ["Armor"],
            waretypes: [],
            compexity: { compexity: "Mod", gp: 2, restricted: false },
            description: 'Both smart-fabric and legacy light vacsuit models are ideal for less harsh environments such as Mars, the Venusian clouds, or exoplanets with moderate but unbreathable atmospheres. Their rebreathers provide 8 hours of air. All models include a headlight, an ecto, and atmospheric sensors. They protect you from temperatures from –75 to 100 C. These vacuum suits also provide an Armor Value of 5/2 and instantly self-seal breaches unless more than 20 points of damage are inflicted at once.',
            notes: [],
            size: "S",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 341 }
            ]
        },
        {
            name: "Vacsuit (Standard)",
            classification: ["Armor"],
            waretypes: [],
            compexity: { compexity: "Maj", gp: 3, restricted: false },
            description: 'Made from thicker and more durable materials, standard vacsuits provide 48 hours of air and incorporate an autocook capable of recycling all wastes and producing food and water indefinitely. Each suit is equipped with an ecto, a radio booster, specs, and atmospheric sensors. These suits have an Armor Value of 8/6 and protect you from temperatures from –175 to 140 C. They instantly seal any hole unless more than 30 points of damage are inflicted at once.',
            notes: [],
            size: "S",
            sources: [
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 215 },
                { source: this.sourcesArray.find(s => s.name === "ep2e"), pg: 341 }
            ]
        }
    ];
}

TREP2eDB.factions.forEach(f => {
    TREP2eDB.skills.push({ name: f.name, types: ["Know", "Faction"], value: 0, aptitude: "Cognition" });
});

TREP2eDB.sourcesArray.forEach(s => {
    TREP2eDB.sources.set(s.name, s); // there might be an argument for structuredClone
});

TREP2eDB.skills.sort((a, b) => {
    return a.name.localeCompare(b.name);
});


class TRTacNet {
    static reportSkill(name, folderName = "PC") {
        let skill = TREP2eDB.skills.find(s => s.name === name);
        if (skill === undefined) {
            Tablerules.info({ message: `TRTacNet.reportSkill(${name}), not found.`, name: name });
            return null;
        }

        const crew = game.folders.find(f => f.name === folderName).contents;
        const report = { skill: skill, experts: [] };
        crew.forEach(a => {

            if (TREP2eDB.modelSkills.includes(name)) { // one could work with a lookup and a.system.skillsIns["infosec"].value and such, but it would still only remove the leaf, still requiring the model vs. Item branch and three branches in model. The model design just sucks.
                const modSkill = { name: name, system: { aptitude: null, roll: 0, value: 0 } };
                if (name === "Infosec") {
                    modSkill.system.aptitude = "cog";
                    modSkill.system.value = a.system.skillsIns.infosec.value;
                    modSkill.system.roll = a.system.skillsIns.infosec.roll; // is this always there?
                }

                if (name === "Interface") {
                    modSkill.system.aptitude = "cog";
                    modSkill.system.value = a.system.skillsIns.interface.value;
                    modSkill.system.roll = a.system.skillsIns.interface.roll;
                }

                if (name === "Perceive") {
                    modSkill.system.aptitude = "int";
                    modSkill.system.value = a.system.skillsIns.perceive.value;
                    modSkill.system.roll = a.system.skillsIns.perceive.roll;
                }

                if (name === "Program") {
                    modSkill.system.aptitude = "cog";
                    modSkill.system.value = a.system.skillsIns.program.value;
                    modSkill.system.roll = a.system.skillsIns.program.roll;
                }

                if (name === "Research") {
                    modSkill.system.aptitude = "int";
                    modSkill.system.value = a.system.skillsIns.research.value;
                    modSkill.system.roll = a.system.skillsIns.research.roll;
                }

                if (name === "Survival") {
                    modSkill.system.aptitude = "int";
                    modSkill.system.value = a.system.skillsIns.survival.value;
                    modSkill.system.roll = a.system.skillsIns.survival.roll;
                }

                if (name === "Deceive") {
                    modSkill.system.aptitude = "sav";
                    modSkill.system.value = a.system.skillsMox.deceive.value;
                    modSkill.system.roll = a.system.skillsMox.deceive.roll;
                }

                if (name === "Kinesics") {
                    modSkill.system.aptitude = "sav";
                    modSkill.system.value = a.system.skillsMox.kinesics.value;
                    modSkill.system.roll = a.system.skillsMox.kinesics.roll;
                }

                if (name === "Persuade") {
                    modSkill.system.aptitude = "sav";
                    modSkill.system.value = a.system.skillsMox.persuade.value;
                    modSkill.system.roll = a.system.skillsMox.persuade.roll;
                }

                if (name === "Provoke") {
                    modSkill.system.aptitude = "sav";
                    modSkill.system.value = a.system.skillsMox.provoke.value;
                    modSkill.system.roll = a.system.skillsMox.provoke.roll;
                }

                if (name === "PSI") {
                    modSkill.system.aptitude = "wil";
                    modSkill.system.value = a.system.skillsMox.psi.value;
                    modSkill.system.roll = a.system.skillsMox.psi.roll;
                }

                if (name === "Athletics") {
                    modSkill.system.aptitude = "som";
                    modSkill.system.value = a.system.skillsVig.athletics.value;
                    modSkill.system.roll = a.system.skillsVig.athletics.roll;
                }

                if (name === "Fray") {
                    modSkill.system.aptitude = "ref";
                    modSkill.system.value = a.system.skillsVig.fray.value;
                    modSkill.system.roll = a.system.skillsVig.fray.roll;
                }

                if (name === "Free Fall") {
                    modSkill.system.aptitude = "som";
                    modSkill.system.value = a.system.skillsVig["free fall"].value;
                    modSkill.system.roll = a.system.skillsVig["free fall"].roll;
                }

                if (name === "Guns") {
                    modSkill.system.aptitude = "ref";
                    modSkill.system.value = a.system.skillsVig.guns.value;
                    modSkill.system.roll = a.system.skillsVig.guns.roll;
                }

                if (name === "Infiltrate") {
                    modSkill.system.aptitude = "ref";
                    modSkill.system.value = a.system.skillsVig.infiltrate.value;
                    modSkill.system.roll = a.system.skillsVig.infiltrate.roll;
                }

                if (name === "Melee") {
                    modSkill.system.aptitude = "som";
                    modSkill.system.value = a.system.skillsVig.melee.value;
                    modSkill.system.roll = a.system.skillsVig.melee.roll;
                }

                report.experts.push({ actor: a, item: modSkill });
                return;
            }

            const item = a.items.find(i => i.name === name && (i.type === "knowSkill" || i.type === "specialSkill"));
            if (item !== undefined) {
                if (item.system.roll === 0) {
                    item.system.roll = Number(item.system.value);
                    if (item.system.aptitude === "cog") {
                        item.system.roll += a.system.aptitudes.cog.value;
                    }
                    if (item.system.aptitude === "int") {
                        item.system.roll += a.system.aptitudes.int.value;
                    }
                    if (item.system.aptitude === "ref") {
                        item.system.roll += a.system.aptitudes.ref.value;
                    }
                    if (item.system.aptitude === "sav") {
                        item.system.roll += a.system.aptitudes.sav.value;
                    }
                    if (item.system.aptitude === "som") {
                        item.system.roll += a.system.aptitudes.som.value;
                    }
                    if (item.system.aptitude === "wil") {
                        item.system.roll += a.system.aptitudes.wil.value;
                    }
                }

                report.experts.push({ actor: a, item: item });
                return;
            }
        });

        report.experts.sort((a, b) => {
            if (b.item.system.roll - a.item.system.roll != 0) {
                return b.item.system.roll - a.item.system.roll;
            } else {
                return a.actor.name.localeCompare(b.actor.name);
            }
        });

        return report;
    }

    static shortenReportSkill(report) {
        if (report == null) {
            return report;
        }
        const shortForm = [];
        report.experts.forEach(e => {
            shortForm.push({ name: e.actor.name, value: e.item.system.value, roll: e.item.system.roll });
        });
        return shortForm;
    }

    static reportUnknownSkills(folderName = "PC") {
        const crew = game.folders.find(f => f.name === folderName).contents;
        const unknownSkills = [];
        crew.forEach(a => {
            a.items.contents.forEach(i => {
                if (i.type === "knowSkill" || i.type === "specialSkill") {
                    if (TREP2eDB.skills.find(s => s.name === i.name) === undefined) {
                        unknownSkills.push({ actor: a, item: i });
                    }
                }
            });
        });
        unknownSkills.sort((a, b) => {
            if (a.actor.name.localeCompare(b.actor.name) != 0) {
                return a.actor.name.localeCompare(b.actor.name);
            } else {
                return a.item.name.localeCompare(b.item.name);
            }
        })
        return unknownSkills;
    }
}


Hooks.on('init', () => {
    TRUtils.registerSettings();

    CONFIG.statusEffects = [
        { id: "dead", name: "Dead", icon: "modules/tablerules/icons/statuses/dead.svg" },
        { id: "unconscious", name: "Unconscious", icon: "modules/tablerules/icons/statuses/unconscious.svg" },
        { id: "sleep", name: "Asleep", icon: "modules/tablerules/icons/statuses/sleep.svg" },
        { id: "stun", name: "Stunned", icon: "modules/tablerules/icons/statuses/stunned.svg" },
        { id: "prone", name: "Prone", icon: "modules/tablerules/icons/statuses/prone.svg" },
        { id: "restrain", name: "Restrained", icon: "modules/tablerules/icons/statuses/restrained.svg" },
        { id: "paralysis", name: "Paralysed", icon: "modules/tablerules/icons/statuses/paralysed.svg" },
        { id: "fly", name: "Flying", icon: "modules/tablerules/icons/statuses/flying.svg" },
        { id: "blind", name: "Blind", icon: "modules/tablerules/icons/statuses/blind.svg" },
        { id: "deaf", name: "Deaf", icon: "modules/tablerules/icons/statuses/deaf.svg" },
        { id: "burning", name: "Burning", icon: "modules/tablerules/icons/statuses/burning.svg" },
        { id: "frozen", name: "Frozen", icon: "modules/tablerules/icons/statuses/frozen.svg" },
        { id: "shock", name: "Shocked", icon: "modules/tablerules/icons/statuses/shocked.svg" },
        { id: "corrode", name: "Corroding", icon: "modules/tablerules/icons/statuses/corroding.svg" },
        { id: "disease", name: "Diseased", icon: "modules/tablerules/icons/statuses/disease.svg" },
        { id: "poison", name: "Poisoned", icon: "modules/tablerules/icons/statuses/poisoned.svg" },
        { id: "upgrade", name: "Upgraded", icon: "modules/tablerules/icons/statuses/upgrade.svg" },
        { id: "downgrade", name: "Downgraded", icon: "modules/tablerules/icons/statuses/downgrade.svg" },
        { id: "invisible", name: "Invisible", icon: "modules/tablerules/icons/statuses/invisible.svg" },
        { id: "target", name: "Targeted", icon: "modules/tablerules/icons/statuses/target.svg" },
        { id: "targeting", name: "Targeting", icon: "modules/tablerules/icons/statuses/targeting.svg" },
        { id: "dazed", name: "Dazed", icon: "modules/tablerules/icons/statuses/dazed.svg" },
        { id: "grappled", name: "Grappled", icon: "modules/tablerules/icons/statuses/grappled.webp" },
        { id: "speeding", name: "Speeding", icon: "modules/tablerules/icons/statuses/speeding.webp" },
        { id: "privacy", name: "Privacy Mode", icon: "modules/tablerules/icons/statuses/privacy.webp" },
        { id: "fullDefense", name: "Full Defense", icon: "modules/tablerules/icons/statuses/fullDefense.webp" },
        { id: "insight", name: "Insight", icon: "modules/tablerules/icons/statuses/insight.webp" },
        { id: "insightBlue", name: "Insight (blue)", icon: "modules/tablerules/icons/statuses/insightBlue.webp" },
        { id: "insightGreen", name: "Insight (green)", icon: "modules/tablerules/icons/statuses/insightGreen.webp" },
        { id: "insightRed", name: "Insight (red)", icon: "modules/tablerules/icons/statuses/insightRed.webp" },
        { id: "insightYellow", name: "Insight (yellow)", icon: "modules/tablerules/icons/statuses/insightYellow.webp" },
        { id: "insightWhite", name: "Insight (white)", icon: "modules/tablerules/icons/statuses/insightWhite.webp" },
        { id: "vigor", name: "Vigor", icon: "modules/tablerules/icons/statuses/vigor.webp" },
        { id: "vigorBlue", name: "Vigor (blue)", icon: "modules/tablerules/icons/statuses/vigorBlue.webp" },
        { id: "vigorGreen", name: "Vigor (green)", icon: "modules/tablerules/icons/statuses/vigorGreen.webp" },
        { id: "vigorRed", name: "Vigor (red)", icon: "modules/tablerules/icons/statuses/vigorRed.webp" },
        { id: "vigorYellow", name: "Vigor (yellow)", icon: "modules/tablerules/icons/statuses/vigorYellow.webp" },
        { id: "vigorWhite", name: "Vigor (white)", icon: "modules/tablerules/icons/statuses/vigorWhite.webp" },
        { id: "moxie", name: "Moxie", icon: "modules/tablerules/icons/statuses/moxie.webp" },
        { id: "moxieBlue", name: "Moxie (blue)", icon: "modules/tablerules/icons/statuses/moxieBlue.webp" },
        { id: "moxieGreen", name: "Moxie (green)", icon: "modules/tablerules/icons/statuses/moxieGreen.webp" },
        { id: "moxieRed", name: "Moxie (red)", icon: "modules/tablerules/icons/statuses/moxieRed.webp" },
        { id: "moxieYellow", name: "Moxie (yellow)", icon: "modules/tablerules/icons/statuses/moxieYellow.webp" },
        { id: "moxieWhite", name: "Moxie (white)", icon: "modules/tablerules/icons/statuses/moxieWhite.webp" },
        { id: "flex", name: "Flex", icon: "modules/tablerules/icons/statuses/flex.webp" },
        { id: "flexBlue", name: "Flex (blue)", icon: "modules/tablerules/icons/statuses/flexBlue.webp" },
        { id: "flexGreen", name: "Flex (green)", icon: "modules/tablerules/icons/statuses/flexGreen.webp" },
        { id: "flexRed", name: "Flex (red)", icon: "modules/tablerules/icons/statuses/flexRed.webp" },
        { id: "flexYellow", name: "Flex (yellow)", icon: "modules/tablerules/icons/statuses/flexYellow.webp" },
        { id: "flexWhite", name: "Flex (white)", icon: "modules/tablerules/icons/statuses/flexWhite.webp" },
        { id: "concentrating", name: "Concentrating", icon: "modules/tablerules/icons/statuses/concentrating.svg" },
        { id: "impairedSenses10", name: "Impaired Senses (-10)", icon: "modules/tablerules/icons/statuses/impairedSensesYellow.webp" },
        { id: "impairedSenses20", name: "Impaired Senses (-20)", icon: "modules/tablerules/icons/statuses/impairedSensesOrange.webp" },
        { id: "impairedSenses30", name: "Impaired Senses (-30)", icon: "modules/tablerules/icons/statuses/impairedSensesRed.webp" },
        { id: "intruderStatusHidden", name: "Intruder Status: Hidden", icon: "modules/tablerules/icons/statuses/hidden.svg" },
        { id: "intruderStatusCovert", name: "Intruder Status: Covert", icon: "modules/tablerules/icons/statuses/covert.webp" },
        { id: "intruderStatusSpotted", name: "Intruder Status: Spotted", icon: "modules/tablerules/icons/statuses/spotted.svg" },
        { id: "privilegesPublic", name: "Privileges: Public", icon: "modules/tablerules/icons/statuses/privilegesPublic.svg" },
        { id: "privilegesUser", name: "Privileges: User", icon: "modules/tablerules/icons/statuses/privilegesUser.svg" },
        { id: "privilegesSecurity", name: "Privileges: Security", icon: "modules/tablerules/icons/statuses/privilegesSecurity.svg" },
        { id: "privilegesAdmin", name: "Privileges: Admin", icon: "modules/tablerules/icons/statuses/privilegesAdmin.svg" },
        { id: "activeDefense", name: "Active Defense", icon: "modules/tablerules/icons/statuses/activeDefense.svg" },
        { id: "alertPassive", name: "Alert (Passive)", icon: "modules/tablerules/icons/statuses/alertPassive.svg" },
        { id: "alertActive", name: "Alert (Active)", icon: "modules/tablerules/icons/statuses/alertActive.svg" },
        { id: "defensiveMode", name: "Defensive Mode", icon: "modules/tablerules/icons/statuses/defensiveMode.svg" }
    ];

    CONFIG.statusEffects.sort((a, b) => a.name.localeCompare(b.name));
});


Hooks.on("preCreateChatMessage", (messageDoc, rawMessageData, context, userId) => {

    if (!game.settings.get(MODULE_SCOPE, "whispersIncludeGM") || !game.settings.get(MODULE_SCOPE, "isEnabled")) {
        return;
    }

    const gmWhisperIds = ChatMessage.getWhisperRecipients("gm").map(i => i.id) // get all gm ids in the world
    let whisperArray = duplicate(messageDoc.whisper) // Copy our array out
    if (whisperArray.length === 0) return // Not a whisper if there's no whisper ids


    for (let gmId of gmWhisperIds) {// Push each gm id into the array of whisper ids
        if (gmId === game.user.id) continue // You never include yourself in the whisper so this would erronously add yourself causing the "we changed the array! trigger later on"
        if (!whisperArray.includes(gmId)) {
            whisperArray.push(gmId)
        }
    }

    if (whisperArray.length !== messageDoc.whisper.length) { //only modify if needed
        let userListString = ""
        for (let userId of messageDoc.whisper) {
            userListString = userListString + game.users.get(userId).name + ", "
        }
        userListString = userListString.slice(0, -2)

        messageDoc.updateSource({
            content: `${messageDoc.content}`,//<br>Original Whisper Recipients: ${userListString}`,
            whisper: whisperArray
        })
    }
});

Hooks.on("ready", function () {
    console.log("Tablerules hooked onto ready.");

    Tablerules.config.loglevel = game.settings.get(MODULE_SCOPE, "logLevel");
    Tablerules.config.logOwn = game.settings.get(MODULE_SCOPE, "logOwn");

    if (game.settings.get(MODULE_SCOPE, "modifyDefaultVolumes")) {
        if (Array.from(game.settings.settings, ([key, value]) => ({ key, value })).find(e => e.key === "core.globalPlaylistVolume").value.default === game.settings.get("core", "globalPlaylistVolume")) {
            game.settings.set("core", "globalPlaylistVolume", game.user.flags?.world?.globalPlaylistVolume ?? game.settings.get(MODULE_SCOPE, "globalPlaylistVolume"));
        }

        if (Array.from(game.settings.settings, ([key, value]) => ({ key, value })).find(e => e.key === "core.globalAmbientVolume").value.default === game.settings.get("core", "globalAmbientVolume")) {
            game.settings.set("core", "globalAmbientVolume", game.user.flags?.world?.globalAmbientVolume ?? game.settings.get(MODULE_SCOPE, "globalAmbientVolume"));
        }

        if (Array.from(game.settings.settings, ([key, value]) => ({ key, value })).find(e => e.key === "core.globalInterfaceVolume").value.default === game.settings.get("core", "globalInterfaceVolume")) {
            game.settings.set("core", "globalInterfaceVolume", game.user.flags?.world?.globalInterfaceVolume ?? game.settings.get(MODULE_SCOPE, "globalInterfaceVolume"));
        }

        ui.sidebar.tabs.playlists.render();
    }

    if (game.settings.get(MODULE_SCOPE, "modifyChatBubbles")) {
        if (Array.from(game.settings.settings, ([key, value]) => ({ key, value })).find(e => e.key === "core.chatBubbles").value.default === game.settings.get("core", "chatBubbles")) {
            game.settings.set("core", "chatBubbles", game.user.flags?.world?.globalInterfaceVolume ?? game.settings.get(MODULE_SCOPE, "chatBubbles"));
        }

        if (Array.from(game.settings.settings, ([key, value]) => ({ key, value })).find(e => e.key === "core.chatBubblesPan").value.default === game.settings.get("core", "chatBubblesPan")) {
            game.settings.set("core", "chatBubblesPan", game.user.flags?.world?.globalInterfaceVolume ?? game.settings.get(MODULE_SCOPE, "chatBubblesPan"));
        }
    }

});

Hooks.on("updateActor", async function (actor, system, diff, id) {
    if (game.settings.get(MODULE_SCOPE, "healthBarHack")) {
        await actor.update({ "system.hp": { max: actor.system.health.physical.max, value: actor.system.health.physical.max - actor.system.health.physical.value } });
    }
});


console.log(`Tablerules has been loaded (${performance.now() - start_time}ms).`);
