import {Midi} from "./Midi";
import {Fretboard} from "./fretboard"

var fb = Fretboard();
var midi = new Midi();

midi.on('keyDown', (note_name, note_octave) => {
    let full_note_name = note_name.toString() + note_octave.toString();
    //console.log("Key down: " + full_note_name);
    fb.activateNote(full_note_name);
});
midi.on('keyUp', (note_name, note_octave) => {
    let full_note_name = note_name.toString() + note_octave.toString();
    //console.log("Key up: " + note_name + note_octave);
    fb.deactivateNote(full_note_name);
});

// fb.scale("e natural-minor", "blue");
fb.scale("e natural-minor", "blue", true);


window.fb = fb;
// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function demo() {
//     fb.scale("c chromatic", "lightgray");
//     await sleep(500);
//     fb.scale("e melodic-minor", "navy");
//     await sleep(500);
//     fb.addNote("a4", "red");
//     await sleep(500);
//     fb.addNote("c5", "blue");
//     // await sleep(500);
//     // fb.clearNotes();
//     // await sleep(300);
//     // fb.addNote("d4", "blue");
//     // await sleep(300);
//     // fb.scale("c chromatic")
// }
//
// demo();