// maybe we need a aided process, if so develop it and then move it into module (probably, though not sure Macro have any meaningful limits either)

class TRMeshDevice {
    static DEVICE_TYPES = { mote: "Mote", host: "Host", server: "Server" };

    constructor(name, deviceType, options = {}) {
        if (!name) {
            throw new Error("name required");
        }
        this.name = name;

        if (!Object.values(TRMeshDevice.DEVICE_TYPES).includes(deviceType)) {
            throw new Error(`deviceType must be in ${Object.values(TRMeshDevice.DEVICE_TYPES).join()}`);
        }
        this.deviceType = deviceType;
    }
}

class TRMeshAttack {

    static DEVICE_TYPES = { mote: "Mote", host: "Host", server: "Server" };
    static INTRUDER_STATUS = { hidden: "Hidden", covert: "Covert", spotted: "Spotted" };
    static SECURITY_ALERT = { passive: "Passive", active: "Active" };
    static COUNTERMEASURES_PASSIVE = [
        {
            name: "Backup",
            action: "Automatic",
            description: `Some systems are set to automatically backup all logs and critical data when a passive alert goes off. These backups are often copied to a secure storage in the cloud or to another dedicated system, where they are protected from deletion.`
        },
        {
            name: "Egress Filtering",
            action: "Automatic",
            description: `In an attempt to deter data exfiltration, the firewall temporarily blocks attempts to download or transfer specific files or data types. Ego backups and access logs are commonly flagged and blocked, though each system may designate its own specifics. To overcome this filtering, a hacker must make a complex action and win a Hacking Test.`
        },
        {
            name: "Locate Intruder",
            action: null,
            description: `The system defender can attempt to track down the source of the passive alert and pinpoint any interlopers. See Zeroing In ▶259.`
        },
        {
            name: "Re-Authenticate",
            action: "Automatic",
            description: `System firewalls can be set to automatically re-authenticate all active users whenever a passive alert is triggered. Each user will be re-authenticated in 1d6 action turns, though a large system with hundreds or thousands of users may take 1d6 minutes. Any intruders that do not have hidden status must make a Hacking Test against the system firewall. If the firewall wins, the intruder gains the spotted status and the system goes to active alert. If the intruder has valid credentials (such as a stolen passcode), they automatically succeed.`
        },
        {
            name: "Reduce Privileges",
            action: "Automatic",
            description: `As a protective measure, the system temporarily reduces access privileges available to standard users — and sometimes security accounts as well. This means that legitimate users may be unable to perform certain functions, use some apps/services, or access certain directories without authorization from an admin account.`
        }
    ];
    static COUNTERMEASURES_ACTIVE = [
        {
            name: "Counter-intrusion",
            action: null,
            description: `Though illegal in some jurisdictions, system defenders may pro-actively protect their wards by counter-attacking the hacker. For this to occur, the intruder must first be successfully traced ▶256 and their mesh ID obtained. Once this occurs, the defender can then launch their own intrusion on the system from which the hacker originates.`
        },
        {
            name: "Crash and Lockout",
            action: null,
            description: `The defender can attempt to crash the account shell of an intruder that has been spotted (Mesh Combat ▶264). If successful, the intruder’s mesh ID can be blocked from accessing the system again (Lockout ▶248). Hacked accounts are quarantined or deleted and not usable again until a security audit approves and reinstates it.`
        },
        {
            name: "Reboot/Shutdown",
            action: null,
            description: `The nuclear option for handling an interloper is to reboot or shut down the system. In this case, the system closes all connections to other systems, logs off users, terminates all processes, and shuts itself down — thereby booting out the intruder (at least temporarily). The disadvantage, of course, is that the system must interrupt its activities. For example, shutting down your mesh inserts means losing all communication with teammates, access to augmented reality, and control over slaved/linked devices. The intruder may attempt to access the system when it reboots, but if they don’t have account credentials or a back door, they will need to hack in again. Remote defenders will also need to take an action to log back in. Initiating a reboot/shutdown only takes a complex action, but the actual shutdown process takes 1d6 action turns (motes and hosts) or 1d6 minutes (servers). Rebooting takes an equivalent amount of time. Logged-in users (including intruders) are warned when a reboot or shutdown is initiated. Once started, the shutdown process cannot be stopped, but it may be prolonged by 1d6 action turns with a complex action; this requires security/admin privileges or an Infosec Test. Hard Shutdown: The shutdown process takes time in order to warn users, save files, end processes neatly, and otherwise protect the system. A “hard” shutdown is also possible in emergency situations. This requires an Interface Test, a complex action, and admin privileges. If successful, the system shuts down at the end of that action turn. Hard shutdowns require double the reboot time and may result in lost data (GM discretion). You can also cause a hard shutdown by physically powering down, cutting power, or destroying the device.`
        },
        {
            name: "Terminate Connections",
            action: "Automatic",
            description: `An alternative to shutdown or rebooting is simply to sever all connections (usually by temporarily disabling the device’s wireless capabilities and going into “airplane mode”). The system loses all active connections, but any intruders are dumped. Termination takes a complex action to initiate and completes at the end of that action turn. Connectivity may be set to restore on the next action turn, in a set time frame, or only when initiated by a local admin. Restarting connectivity takes 1 action turn. Any remote users will need to log back in; intruders without proper credentials will need to hack the system again. While connections are terminated, the system cannot communicate and interact with other systems.`
        },
        {
            name: "Trace",
            action: "Automatic",
            description: `Defenders can initiate a trace on a spotted intruder. Most hackers are careful to use an anonymizing service to mask their mesh ID and location, but this is not always the case. If an intruder is physically located, the standard procedure is to alert habitat security or other local or private police, who will mobilize to apprehend the suspect.`
        }
    ];

    constructor(name, deviceType, options = {}) {
        if (!name) {
            throw new Error("name required");
        }
        this.name = name;

        if (!Object.values(TRMeshAttack.DEVICE_TYPES).includes(deviceType)) {
            throw new Error(`deviceType must be in ${Object.values(TRMeshAttack.DEVICE_TYPES).join()}`);
        }
        this.deviceType = deviceType;

        if (options?.intruderStatus) {
            if (!Object.values(TRMeshAttack.INTRUDER_STATUS).includes(options.intruderStatus)) {
                throw new Error(`intruderStatus must be in ${Object.values(TRMeshAttack.INTRUDER_STATUS).join()}`);
            }
            this.intruderStatus = options.intruderStatus;
        }

        if (game) {
            this.version = game.modules.find(m => m.id === MODULE_SCOPE)?.version;
        }

        this.target = this;
        this.contents = [];
    }

    /**
     * 
     * @param {*} intruderStatus 
     * @returns the set value, or undefined if the parameter is not in MeshRelationState.INTRUDER_STATUS
     */
    setIntruderStatus(intruderStatus) {
        if (!Object.values(TRMeshAttack.INTRUDER_STATUS).includes(intruderStatus)) {
            return undefined;
        }

        this.intruderStatus = intruderStatus;
        return this.intruderStatus;
    }

    /**
     * 
     * @param {boolean} intruderHasMeshID 
     * @returns the set value, or undefined if parameter is neither true nor false.
     */
    setIntruderHasMeshID(intruderHasMeshID) {
        if (!(intruderHasMeshID === true || intruderHasMeshID === false)) {
            return undefined;
        }
        this.intruderHasMeshID = intruderHasMeshID;
        return this.intruderHasMeshID;
    }

    hack() {
        if (!this?.intruderHasMeshID) {
            return `must acquire MeshID before hacking.`;
        }
        return `TODO: implement.`;
    }

    /**
     * Configures a system for further use (such as deciding if wired or air gapped, if in range)
     * 
     * @param {*} options 
     * @returns 
     */
    configure(options = {}) {
        return `TODO: implement.`;
    }

    connect(credentials, options = {}) {
        if (this.isConnected) {
            return `already connected`;
        }
    }

    setIntruder(id) {
        if (!id) {
            return undefined;
        }

        if (!game.actors.get(id)) {
            return undefined;
        }

        this.intruder = game.actors.get(id);
        return this.intruder;
    }

    setDefender(id) {
        if (!id) {
            return undefined;
        }

        if (!game.actors.get(id)) {
            return undefined;
        }

        this.defender = game.actors.get(id);
        return this.defender;
    }

    /**
     * This looking like a problem points to a problem in design, not capturing the container aspect of devices able to host Infomorphs.
     * 
     * @returns 
     */
    impairSenses() {
        if (!(this.isCyberbrain || this.isInfomorph)) {
            return `only possible against Cyberbrain and Infomorph`;
        }
    }

    setTarget(target) {
        if (!this.contents.includes(target)) {
            return `target must be on the device`;
        }

        this.target = target;
        return this.target;
    }
}

function setupMeshTest() {

}