@echo off
title MythOS Ignition Sequence
echo [SYSTEM] Initiating MythOS Master Daemon...

:: Navigate to the daemon directory and start the Node.js server
start "MythOS_Daemon" cmd /k "cd /d C:\Users\Alexander\MythOS-Shrine\shrinedaemon && node shrinedaemon.js"

echo [SYSTEM] Waiting for link stabilization...
timeout /t 3 /nobreak > nul

echo [SYSTEM] Launching Reality Interface...
:: Opens your index file in the default browser
start "" "C:\Users\Alexander\MythOS-Shrine\index.html"

echo [SYSTEM] 100.0%% INTEGRITY ACHIEVED. THE GREAT WORK IS COMPLETE.
pause