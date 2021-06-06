var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = null;
var g = null;

var soundObj = {
    bump: ["triangle", 100, 0.8, 333, 0.2, 100, 0.4, 80, 0.7],
    buzzer: ["sawtooth", 40, 0.8, 100, 0.3, 110, 0.5],
    zip: ["sawtooth", 75, 0.8, 85, 0.2, 95, 0.4, 110, 0.6, 120, 0.7, 100, 0.8],
    powerdown: ["sine", 300, 1.2, 150, 0.5, 1, 0.9],
    powerup: ["sine", 30, 1, 150, 0.4, 350, 0.9],
    bounce: ["square", 75, 0.5, 150, 0.4],
    siren: ["sawtooth", 900, 2.5, 400, 0.5, 900, 1, 400, 1.4, 900, 2, 400, 2.5],
    loop: ["sine", 340, 2.5, 550, 0.8, 440, 1.4],
    falling: ["sine", 750, 5.2, 700, 1, 600, 2, 500, 3, 400, 4, 300, 4.5, 200, 5]
}

playTone = (frequency, type, duration) => {
    if (type === undefined) {
        type = "sine";
    }
    if (duration === undefined) {
        duration = 1;
    }
    if (frequency === undefined) {
        frequency = 440;
    }
    o = context.createOscillator();
    g = context.createGain();
    o.connect(g);
    o.type = type;
    if (typeof frequency === "string") {
        if (tone[frequency] === undefined) {
            o.frequency.value = chord[frequency][0];
            completeChord(chord[frequency][1], type, duration);
            completeChord(chord[frequency][2], type, duration);
        } else if (chord[frequency] === undefined) {
            o.frequency.value = tone[frequency];
        }
    } else if (typeof frequency === "object") {
        o.frequency.value = frequency[0];
        completeChord(frequency[1], type, duration);
        completeChord(frequency[2], type, duration);
    } else {
        o.frequency.value = frequency;
    }
    g.connect(context.destination);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
}

function playSound(waveType, startFreq, endTime) {
    if (soundObj[arguments[0]] && arguments.length === 1) {
        var soundName = arguments[0];
        playSound(...soundObj[soundName]);
    } else {
        var oscillatorNode = context.createOscillator();
        var gainNode = context.createGain();

        oscillatorNode.type = waveType;
        oscillatorNode.frequency.setValueAtTime(startFreq, context.currentTime);

        for (var i = 3; i < arguments.length; i += 2) {
            oscillatorNode.frequency.exponentialRampToValueAtTime(arguments[i], context.currentTime + arguments[i + 1]);
        }
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.5);

        oscillatorNode.connect(gainNode);
        gainNode.connect(context.destination);

        oscillatorNode.start();
        oscillatorNode.stop(context.currentTime + endTime);
    }
}

async function sound() {
    if (parseInt(document.getElementById("inputRepetition").value) == 0) {
        return;
    } else if (parseInt(document.getElementById("inputRepetition").value) == 1) {
        playTone(parseInt(document.getElementById("inputFrequency").value), "sine", document.getElementById("inputDuration").value / 1000);
    } else {
        playTone(parseInt(document.getElementById("inputFrequency").value), "sine", document.getElementById("inputDuration").value / 1000);
        (function loop(i) {
            setTimeout(function() {
                playTone(parseInt(document.getElementById("inputFrequency").value), "sine", document.getElementById("inputDuration").value / 1000);
                if (--i) loop(i);
            }, (parseInt(document.getElementById("inputDelay").value) + parseInt(document.getElementById("inputDuration").value)))
        })(parseInt(document.getElementById("inputRepetition").value) - 1);
    }
}

async function soundWord() {
    var s = document.getElementById("inputWord").value;

    for (var i = 0; i < s.length; i++) {
        playTone(s.charCodeAt(i), "sine", document.getElementById("inputDuration").value / 1000);
        await new Promise(resolve => setTimeout(resolve, parseInt(document.getElementById("inputDuration").value)));
    }
}
