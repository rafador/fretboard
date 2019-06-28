const THREE = require('three');

// Music
var allNotes = [
    "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"
];
var allNotesEnh = [
    "c", "db", "d", "eb", "fb", "f", "gb", "g", "ab", "a", "bb", "cb"
];
var noteIntervals = [
    "1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"
];
var colors = ["red", "green", "blue", "black", "purple", "gray", "orange", "lightgray"];

var Scales = {
    // scales
    chromatic: "c c# d d# e f f# g g# a a# b",
    lydian: "c d e f# g a b",
    major: "c d e f g a b",
    "natural-minor": "c d eb f g ab bb", // same as aeolian
    "harmonic-minor": "c d eb f g ab b",
    "melodic-minor": "c d eb f g a b",
    mixolydian: "c d e f g a bb",
    dorian: "c d eb f g a bb",
    aeolian: "c d eb f g ab bb", // same as natural minor
    phrygian: "c db eb f g ab bb",
    locrian: "c db eb f gb ab bb",
    "minor-pentatonic": "c eb f g bb",
    "minor-blues": "c eb f f# g bb",
    "major-pentatonic": "c d e g a",
    "major-blues": "c d d# e g a",
    "composite-blues": "c d d# e f f# g a bb",
    "dom-pentatonic": "c e f g bb",
    japanese: "c db f g ab",
    // chords
    maj: "c e g",
    aug: "c e g#",
    min: "c eb g",
    dim: "c eb gb",
    maj7: "c e g b",
    7: "c e g bb",
    min7: "c eb g bb",
    m7b5: "c eb gb bb",
    dim7: "c eb gb a",
    _: function(scale) { return Scales[scale].split(" "); },
};


function whatIs(sequence) {
    let sections = sequence.split(" ");
    if (sections.length === 2 && typeof Scales[sections[1]] == "string") {
        return "scale";
    }
    if (sections[0].indexOf(":") > 0) {
        return "placeNotes";
    } else {
        return "addNotes";
    }
}


function asOffset(note) {
    note = note.toLowerCase();
    var offset = allNotes.indexOf(note);
    if(offset === -1) {
        offset = allNotesEnh.indexOf(note);
    }
    return offset;
}


function absNote(note) {
    var octave = note[note.length - 1];
    var pitch = asOffset(note.slice(0, -1));
    if (pitch > -1) {
        return pitch + octave * 12;
    }
}

function distanceToKey(note_with_octave, key_note)
{
    var octave = note_with_octave[note_with_octave.length - 1];
    var pitch = asOffset(note_with_octave.slice(0, -1));
    var pitch_key = asOffset(key_note);

    let pitch_distance = pitch - pitch_key;
    if(pitch_distance < 0)
        pitch_distance = 12 + pitch_distance;

    return noteIntervals[pitch_distance];
}


function noteName(absPitch) {
    let octave = Math.floor(absPitch / 12);
    let note = allNotes[absPitch % 12];
    return note + octave.toString();
}


function asNotes(scale) {
    let [root, type] = scale.split(" ");
    var scaleInC = Scales._(type);
    var offset = asOffset(root);
    var scaleTransposed = scaleInC.map(function(note) {
        return allNotes[(asOffset(note) + offset) % 12];
    });
    return scaleTransposed.join(" ");
}

var verbatim = function(d) { return d; };


// Fretboard
var Tunings = {
    bass4: {
        standard: ["e1", "a1", "d2", "g2", "b2", "e3"]
    },
    guitar6: {
        standard: ["e2", "a2", "d3", "g3", "b3", "e4"],
        E_4ths: ["e2", "a2", "d3", "g3", "c4", "f4"],
        Drop_D: ["d2", "a2", "d3", "g3", "b3", "e4"],
        G_open: ["d2", "g2", "d3", "g3", "b3", "d4"],
        DADGAD: ["d2", "a2", "d3", "g3", "a3", "d4"]
    },
    guitar7: {
        standard: ["b2", "e2", "a2", "d3", "g3", "b3", "e4"],
        E_4ths: ["b2", "e2", "a2", "d3", "g3", "c3", "f4"]
    }
};


var Fretboard = function(config) {
    config = config || {};
    var where = config.where || "body";

    var id = "fretboard-" + Math.floor(Math.random() * 1000000);

    var instance = {
        frets: config.frets || 22,
        startFret: config.startFret || 0,
        strings: config.strings || 6,
        tuning: config.tuning || Tunings.guitar6.standard,
        fretWidth: 50,
        fretHeight: 40
    };

    var fretFitsIn = function(fret) {
        return (fret > instance.startFret) && (fret <= instance.frets);
    };

    var fretsWithDots = function () {
        var allDots = [3, 5, 7, 9, 15, 17, 19, 21];
        return allDots.filter(fretFitsIn);
    };

    var fretsWithDoubleDots = function () {
        var allDots = [12, 24];
        return allDots.filter(fretFitsIn);
    };

    var fretboardHeight = function () {
        return (instance.strings - 1) * instance.fretHeight + 2;
    };

    var fretboardWidth = function() {
        return (instance.frets - instance.startFret) * instance.fretWidth + 2;
    };

    var XMARGIN = function() { return instance.fretWidth; };
    var YMARGIN = function() { return instance.fretHeight; };

    var makeContainer = function(elem) {
        return d3
            .select(elem)
            .append("div")
            .attr("class", "fretboard")
            .attr("id", id)
            .append("svg")
            .attr("width", fretboardWidth() + XMARGIN() * 2)
            .attr("height", fretboardHeight() + YMARGIN() * 2);
    };

    var drawFrets = function() {
        for(var i=instance.startFret; i<=instance.frets; i++) {
            let x = (i - instance.startFret) * instance.fretWidth + 1 + XMARGIN();
            // fret
            instance.svgContainer
                .append("line")
                .attr("x1", x)
                .attr("y1", YMARGIN())
                .attr("x2", x)
                .attr("y2", YMARGIN() + fretboardHeight())
                .attr("stroke", "lightgray")
                .attr("stroke-width", i==0? 8:2);
            // number
            d3.select("#" + id)
                .append("p")
                .attr("class", "fretnum")
                .style("top", (fretboardHeight() + YMARGIN() + 5) + "px")
                .style("left", x - 4 + "px")
                .text(i)
                ;
        }
    }


    var drawStrings = function() {
        for(var i=0; i<instance.strings; i++) {
            instance.svgContainer
                .append("line")
                .attr("x1", XMARGIN())
                .attr("y1", i * instance.fretHeight + 1 + YMARGIN())
                .attr("x2", XMARGIN() + fretboardWidth())
                .attr("y2", i * instance.fretHeight + 1 + YMARGIN())
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                ;
        }
        var placeTuning = function(d, i) {
            return (instance.strings - i) * instance.fretHeight - 5 + "px";
        };

        var toBaseFretNote = function(note) {
            return noteName(absNote(note) + instance.startFret);
        };

        d3.select("#" + id)
            .selectAll(".tuning")
            .data(instance.tuning.slice(0, instance.strings))
            .style("top", placeTuning)
            .text(toBaseFretNote)
            .enter()
            .append("p")
            .attr("class", "tuning")
            .style("top", placeTuning)
            .text(toBaseFretNote)
            ;
    };


    var drawDots = function() {

        var p = instance.svgContainer
            .selectAll("circle")
            .data(fretsWithDots());

        function dotX(d) {
            return (d - instance.startFret - 1) * instance.fretWidth + instance.fretWidth/2 + XMARGIN();
        }

        function dotY(ylocation) { 
            let margin = YMARGIN();

            if(instance.strings % 2 == 0) {

                return ((instance.strings + 3)/2 - ylocation) * instance.fretHeight + margin;
            } else {
                return fretboardHeight() * ylocation/4 + margin;
            }
        }

        p.enter()
            .append("circle")
            .attr("cx", dotX)
            .attr("cy", dotY(2))
            .attr("r", 4).style("fill", "#ddd");

        var p = instance.svgContainer
            .selectAll(".octave")
            .data(fretsWithDoubleDots());

        p.enter()
            .append("circle")
            .attr("class", "octave")
            .attr("cx", dotX)
            .attr("cy", dotY(3))
            .attr("r", 4).style("fill", "#ddd");
        p.enter()
            .append("circle")
            .attr("class", "octave")
            .attr("cx", dotX)
            .attr("cy", dotY(1))
            .attr("r", 4).style("fill", "#ddd");
    };


    instance.svgContainer = makeContainer(where);

    instance.drawBoard = function() {
        drawFrets();
        drawDots();
        drawStrings();
        return instance;
    };

    // Notes on fretboard
    instance.activateNote = function(note) {
        let note_selector = ".note-"+absNote(note.toLowerCase());
        let note_text_selector = note_selector+"-text";
        let selected_note_selector = ".note.selected";

        let selected_notes = instance.svgContainer.selectAll(selected_note_selector);
        if(!selected_notes.empty())
        {
            let selected_note = instance.svgContainer.select(selected_note_selector);
            window.fret = {};
            window.fret.selected_vec = new THREE.Vector2(selected_note.attr('cx'), selected_note.attr('cy'));
            window.fret.min_dist = undefined;
            window.fret.closest_note = undefined;

            d3.selectAll(note_selector)
                .each(function (d, i) {
                    let me = d3.select(this);
                    let my_vec = new THREE.Vector2(me.attr('cx'), me.attr('cy'));

                    // compare distanse
                    let my_dist = my_vec.distanceTo(window.fret.selected_vec);

                    if(typeof window.fret.min_dist == "undefined" || my_dist < window.fret.min_dist)
                    {
                        window.fret.min_dist = my_dist;
                        window.fret.closest_note = me;
                    }
                });

            instance.styleAsActivated(window.fret.closest_note);
        }
        else {
            instance.styleAsActivated(instance.svgContainer.selectAll(note_selector));
        }
        instance.svgContainer.selectAll(note_text_selector)
            .attr("font-weight", "bold")

    };

    instance.styleAsActivated = function(d3_selection) {
        d3_selection
            .attr("r", 18)
            .attr("stroke-width", 8);

        d3_selection
            .classed('shrinking', false)
            .classed('growing', true);

        d3_selection
            .attr("r", 25)
            .attr("stroke-width", 8);
    };

    instance.deactivateNote = function(note) {
        let note_selector = ".note-"+absNote(note.toLowerCase());
        let note_text_selector = note_selector+"-text";

        instance.styleAsDeactivated(instance.svgContainer.selectAll(note_selector));

        instance.svgContainer.selectAll(note_text_selector)
            .attr("font-weight", "normal")
    };

    instance.styleAsDeactivated = function(d3_selection) {
        d3_selection
            .classed('growing', false)
            .classed('shrinking', true);

        d3_selection
            .attr("r", 13)
            .attr("stroke-width", 2);
    };

    instance.addNoteOnString = function(note, string, color) {
        var absPitch = absNote(note);
        let note_pitch_class = "note-"+absPitch;
        let note_pitch_on_string_class = note_pitch_class+"-string"+string;
        let note_text_class = note_pitch_class+"-text";
        let note_text = note.toUpperCase();

        if(instance.display_as_intervals)
            if(typeof instance.current_key == "string")
                note_text = distanceToKey(note, instance.current_key);

        let selection = instance.svgContainer.select("circle."+note_pitch_on_string_class);
        if(!selection.empty())
        {
            selection.style("stroke", color);
            instance.svgContainer.selectAll("text."+note_text_class)
                .style("fill", "black");
            return instance;
        }

        color = color || "black";
        var absString = (instance.strings - string);
        var basePitch = absNote(instance.tuning[absString]) + instance.startFret;
        if((absPitch >= basePitch) && (absPitch <= (basePitch + instance.frets - instance.startFret))) {
            instance.svgContainer
                .append("circle")
                .attr("class", "note note-"+absPitch+" note-"+absPitch+"-string"+string)
                // .attr("fill-opacity", 0.1)
                .attr("stroke-width", 2)
                // 0.75 is the offset into the fret (higher is closest to fret)
                .attr("cx", (absPitch - basePitch + 0.75) * instance.fretWidth)
                .attr("cy", (string - 1) * instance.fretHeight + 1 + YMARGIN())
                .attr("r", 15)
                .style("stroke", color)
                .style("fill", "white")
                .on("click", function(d) {
                    let fill = this.style.fill;
                    this.setAttribute("stroke-width", 10 - parseInt(this.getAttribute("stroke-width")));
                    this.style.fill = fill == "white" ? "lightgray" : "white";
                    if(this.classList.contains("selected"))
                        this.classList.remove("selected");
                    else
                        this.classList.add("selected");
                }).append("title").text(note_text);
            instance.svgContainer
                .append("text").text(note_text)
                .attr("class", "note note-"+absPitch+"-text")
                .attr("x", (absPitch - basePitch + 0.75) * instance.fretWidth)
                .attr("y", (string - 1) * instance.fretHeight + 5 + YMARGIN())
                .attr("text-anchor", "middle").style("fill", "gray");
        }
        return instance;
    };


    instance.addNote = function(note, color) {
        for(var string=1; string<=instance.strings; string++) {
            instance.addNoteOnString(note, string, color);
        }

        return instance;
    };


    instance.addNotes = function(notes, color) {
        var allNotes = notes.split(" ");
        for (var i=0; i<allNotes.length; i++) {
            var showColor = color || colors[i];
            var note = allNotes[i];
            for (var octave=1; octave<7; octave++) {
                instance.addNote(note + octave, showColor);
            }
        }

        return instance;
    };


    instance.scale = function(scaleName, color, display_as_intervals=false)
    {
        instance.clearNotes();

        instance.display_as_intervals = display_as_intervals;
        let root_transposed_scale = asNotes(scaleName);
        instance.current_key = root_transposed_scale[0];
        let root_transposed_chromatic_scale = asNotes(instance.current_key + " chromatic");

        instance.addNotes(root_transposed_chromatic_scale, "lightgray");
        instance.addNotes(root_transposed_scale, color);

        return instance;
    };


    instance.placeNotes = function(sequence) {
        // Sequence of string:note
        // e.g. "6:g2 5:b2 4:d3 3:g3 2:d4 1:g4"
        let pairs = sequence.split(" ");
        pairs.forEach(function(pair, i) {
            let [string, note] = pair.split(":");
            string = parseInt(string);
            instance.addNoteOnString(note, string);  // , i==0? "red" : "black");
        });

        return instance;
    };


    instance.draw = function(something) {
        let sections = something.split(";");
        sections.forEach(function(section) {
            section = section.trim();
            let what = whatIs(section);
            instance[what](section);
        });
    };


    instance.clearNotes = function() {
        instance.svgContainer
            .selectAll(".note")
            .remove();

        return instance;
    };


    instance.clear = function() {
        d3.select("#" + id).selectAll(".fretnum,.tuning").remove();
        instance.svgContainer
            .selectAll("line")
            .remove();
        instance.svgContainer
            .selectAll("circle")
            .remove();
        instance.drawBoard();

        return instance;
    };

    instance.delete = function() {
        d3.select("#" + id).remove();
    };

    return instance.drawBoard();
};


Fretboard.drawAll = function(selector, tuning) {
    let fretboards = document.querySelectorAll(selector);

    fretboards.forEach(function(e) {
        let fretdef = e.dataset["frets"];
        let startFret, frets;
        if (fretdef && (fretdef.indexOf("-") !== -1)) {
            [startFret, frets] = fretdef.split("-").map(function(x) {return parseInt(x)});
        } else {
            [startFret, frets] = [0, parseInt(fretdef) || 8];
        }
        let notes = e.dataset["notes"];
        let fretboard = Fretboard({frets: frets, startFret: startFret, where: e, tuning: tuning});
        if (notes) {
            fretboard.draw(notes);
        }
    });
};


function Guitar(strings, frets) {
    strings = strings || 6;
    frets = frets || 12;
    return Fretboard({
        strings: strings,
        frets: frets,
        tuning: Tunings["guitar" + strings].standard
    });
}

function Bass(strings, frets) {
    strings = strings || 4;
    frets = frets || 12;
    return Fretboard({
        strings: strings,
        frets: frets,
        tuning: Tunings["bass" + strings].standard
    });
}

export var Fretboard;