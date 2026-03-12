const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // This gives the engine power to touch Windows
const app = express();

app.use(cors());
app.use(express.json());

app.post('/command', (req, res) => {
    const { command } = req.body;
    console.log(`[REALITY_SYNC] > Executing: ${command}`);

    // THE TO-DO LIST:
    if (command.toUpperCase() === "OPEN SHRINE") {
        // This tells Windows to open your specific folder
        exec('explorer "C:\\Users\\Alexander\\MythOS-Shrine"'); 
        return res.json({ status: "SUCCESS", msg: "Folder opened." });
    }

    res.json({ status: "SUCCESS", integrity: "100.0%" });
});

app.listen(3000, () => {
    console.log("---------------------------------");
    console.log("MYTHOS MASTER DAEMON // PORT: 3000");
    console.log("ACTIVE PROTOCOL: COMMAND_EXECUTION");
    console.log("---------------------------------");
});