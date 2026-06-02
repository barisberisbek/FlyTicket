@echo off
echo Exporting FlyTicket database...
mongodump --db flyticket --out "%~dp0"
echo Done. Files saved to database-export\flyticket\
pause
