import express from "express";
import { workerData } from "worker_threads";

const app = express();
const port = 50555;

// open and load world cup data
const fs = require("fs");
console.log("Loading world cup data...");
const data = fs.readFileSync("src/world-cup.json");
console.log("World cup data loaded!");
console.log("Parsing world cup data...");
const worldCupDataArray = JSON.parse(data);
console.log("World cup data parsed!");

const worldCupData = JSON.parse(worldCupDataArray[0]);
const nations = worldCupData.teams.map((team: any) => team.team_name);
const years = worldCupData.tournaments.map(
    (tournament: any) => tournament.year
);

app.get("/get-matches", (req, res) => {
    const nation = req.query.nation;
    const year = req.query.year;

    // check if nation is valid
    if (nation && !nations.includes(nation)) {
        return res.status(400).json({
            error: "Please provide a valid nation",
            nations: nations,
        });
    }
    // check if year is valid
    if (year && !years.includes(parseInt(year as string))) {
        return res.status(400).json({
            error: "Please provide a valid worldcup year",
            years: years,
        });
    }

    if (nation && typeof nation == "string" && year) {
        const matches = worldCupData.matches.filter(
            (match: any) =>
                match.match_date.substring(0, 4) === year &&
                (match.home_team_name.toLowerCase() === nation.toLowerCase() ||
                    match.away_team_name.toLowerCase() === nation.toLowerCase())
        );
        return res.json(matches);
    } else {
        return res
            .status(400)
            .json({ error: "Please provide a nation and a year" });
    }
});

app.get("/get-winner", (req, res) => {
    const year = req.query.year;

    if (year && parseInt(year as string)) {
        // check if year is valid
        if (!years.includes(parseInt(year as string))) {
            return res.status(400).json({
                error: "Please provide a valid worldcup year",
                years: years,
            });
        }

        const winner = worldCupData.tournaments.filter(
            (tournament: any) => tournament.year === parseInt(year as string)
        );
        return res.json(winner[0]);
    }

    return res.status(400).json({ error: "Please provide a year" });
});

// 404 Error
app.use((_req, res) => {
    return res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
