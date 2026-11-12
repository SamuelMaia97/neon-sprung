// 1. Spielfeld und Startwerte
const spielfeld = document.querySelector("#spielfeld");
const stift = spielfeld.getContext("2d");
const aktion = document.querySelector("#aktion");
const meldung = document.querySelector("#status");
const boden = 262;
const figur = { x: 108, y: boden - 44, breite: 36, hoehe: 44, tempoY: 0 };
const hindernis = { x: 720, breite: 34, hoehe: 46, gezaehlt: false };
let zustand = "bereit";
let punkte = 0;
let rekord = 0;
let tempo = 250;
// 2. Das Spielfeld zeichnen
const himmel = stift.createLinearGradient(0, 0, 0, spielfeld.height);
himmel.addColorStop(0, "#29234f");
himmel.addColorStop(1, "#11182d");

function rechteck(farbe, x, y, breite, hoehe) {
stift.fillStyle = farbe;
stift.fillRect(x, y, breite, hoehe);
}
function zeichne() {
const oben = boden - hindernis.hoehe;
rechteck(himmel, 0, 0, spielfeld.width, spielfeld.height);
rechteck("#102438", 0, boden, spielfeld.width, spielfeld.height - boden);
rechteck("#65f9d3", 0, boden, spielfeld.width, 3);
rechteck("#65f9d3", figur.x, figur.y, figur.breite, figur.hoehe);
rechteck("#122236", figur.x + 24, figur.y + 12, 6, 7);
rechteck("#ff9d7e", hindernis.x, oben, hindernis.breite, hindernis.hoehe);
rechteck("#ffe0a5", hindernis.x + 5, oben + 5, 8, 8);
stift.fillStyle = "#f5f6ff";
stift.font = "bold 20px system-ui";
stift.fillText(`Punkte ${punkte}`, 24, 36);
stift.fillText(`Rekord ${rekord}`, 24, 64);
}
zeichne();

// 3. Den Rekord merken
const speicherName = "zukunftstag-jump-run-rekord";
try {
    rekord = Math.max(0, Number(localStorage.getItem(speicherName)) || 0);
    } catch {
    // Wenn der Browser den Speicher sperrt, startet der Rekord bei null.
}
function speichereRekord() {
if (punkte <= rekord) return;
rekord = punkte;
try {
    localStorage.setItem(speicherName, String(rekord));
        } catch {
        // Der Rekord bleibt bis zum Neuladen der Seite sichtbar.
    }
}

 // 4. Starten, springen oder neu starten
meldung.textContent = "Bereit? Starte mit Leertaste, Pfeil nach oben oder Knopf.";
aktion.textContent = "Spiel starten";
function ausloesen() {
if (zustand !== "laeuft") {
    zustand = "laeuft";
    figur.y = boden - figur.hoehe;
    figur.tempoY = 0;
    hindernis.x = spielfeld.width;
    hindernis.gezaehlt = false;
    punkte = 0;
    tempo = 250;
    aktion.textContent = "Springen";
    meldung.textContent = "Läuft! Springe über das Hindernis.";
    } else if (figur.y + figur.hoehe === boden) {
    figur.tempoY = -600;
    }
}

// 5. Bewegung, Treffer und Punkte
function aktualisiere(sekunden) {
    figur.tempoY += 1700 * sekunden;
    figur.y += figur.tempoY * sekunden;
    if (figur.y + figur.hoehe >= boden) {
    figur.y = boden - figur.hoehe;
    figur.tempoY = 0;
}
    hindernis.x -= tempo * sekunden;
    const rechts = hindernis.x + hindernis.breite;
    const trifftX = figur.x + figur.breite > hindernis.x && figur.x < rechts;
    const trifftY = figur.y + figur.hoehe > boden - hindernis.hoehe;
    if (trifftX && trifftY) {
    zustand = "vorbei";
    aktion.textContent = "Nochmal spielen";
    meldung.textContent = `Game over. Punkte ${punkte}. Rekord ${rekord}.`;
    aktion.focus({ preventScroll: true });
    return;
}
if (!hindernis.gezaehlt && rechts <= figur.x) {
    hindernis.gezaehlt = true;
    punkte += 1;
    tempo = Math.min(tempo + 20, 480);
    speichereRekord();
}
if (rechts < 0) {
    hindernis.x = spielfeld.width;
    hindernis.gezaehlt = false;
    }
}

// 6. Knopf und Tastatur verbinden
aktion.addEventListener("click", ausloesen);
document.addEventListener("keydown", (ereignis) => {
if (ereignis.code !== "Space" && ereignis.code !== "ArrowUp") return;
if (ereignis.code === "Space" && ereignis.target === aktion) return;
    ereignis.preventDefault();
    if (!ereignis.repeat) ausloesen();
});

// 7. Jedes Bild neu zeichnen
let letzteZeit = 0;
function spielschleife(jetzt) {
    const sekunden = Math.min((jetzt - letzteZeit) / 1000, 0.035);
    letzteZeit = jetzt;
    if (zustand === "laeuft") aktualisiere(sekunden);
    zeichne();
    requestAnimationFrame(spielschleife);
}
requestAnimationFrame(spielschleife);