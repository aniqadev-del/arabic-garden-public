"""Render the curriculum voice clips and level-matched native-speaker vowel pairs."""

import io
import json
import sys
import wave
import zipfile
from pathlib import Path

import numpy as np

from tiny_voca_ar import arabic_frontend as frontend
from tiny_voca_ar.text import SYMBOL_TO_ID
import onnxruntime as ort


RATE = 24_000
SHORT_MS = 120
LONG_MS = 240
PAD_START_MS = 55
PAD_END_MS = 125

# With the help of the corpus TextGrids, choose clean /b/ + vowel segments from
# لِلْبَائِعِ, الْبِيئِيِّ and الْأُسْبُوع. The times mark the closure, vowel onset
# and end of stable voicing, before the next consonant enters the waveform.
RECORDINGS = {
    ('بَ', 'بَا'): ('test set/wav/ARA NORM  0001.wav', 1.135, 1.195, 1.337),
    ('بِ', 'بِي'): ('wav/ARA NORM  0454.wav', 1.580, 1.640, 1.823),
    ('بُ', 'بُو'): ('wav/ARA NORM  0131.wav', 1.365, 1.422, 1.629),
}

# Keep the familiar spoken greeting endings and the feminine -ki in direct address.
SPOKEN = {
    'مَرْحَبًا': 'مَرْحَبَنْ',
    'شُكْرًا': 'شُكْرَنْ',
    'أُرِيدُ مَاءً': 'أُرِيدُ مَاءَنْ',
}
FEMININE_ADDRESS = {'كَيْفَ حَالُكِ؟', 'مِنْ فَضْلِكِ'}


def samples(ms):
    return round(ms * RATE / 1000)


def silence(ms):
    return np.zeros(samples(ms), dtype=np.float32)


def fade(audio, start_ms, end_ms):
    result = audio.copy()
    start = samples(start_ms)
    end = samples(end_ms)
    result[:start] *= np.linspace(0, 1, start)
    result[-end:] *= np.linspace(1, 0, end)
    return result


def sustain(vowel, length):
    """Extend stable voicing with phase-matched overlap, without altering pitch."""
    overlap = samples(17)
    loop = samples(55)
    tolerance = samples(7)
    splice = samples(89)
    original = vowel
    weight = np.linspace(0, 1, overlap)

    while len(vowel) < length:
        reference = vowel[splice - overlap:splice]
        expected = splice - loop

        def similarity(position):
            segment = original[position - overlap:position]
            return float(np.dot(reference, segment) / (np.linalg.norm(reference) * np.linalg.norm(segment) + 1e-9))

        match = max(range(expected - tolerance, expected + tolerance), key=similarity)
        blend = reference * (1 - weight) + original[match - overlap:match] * weight
        vowel = np.concatenate((vowel[:splice - overlap], blend, vowel[match:]))
        splice += splice - match

    return vowel[:length]


def native_vowels(corpus_path):
    clips = {}
    with zipfile.ZipFile(corpus_path) as corpus:
        for labels, (file_name, start, onset, end) in RECORDINGS.items():
            with wave.open(io.BytesIO(corpus.read(f'arabic-speech-corpus/{file_name}'))) as recording:
                assert recording.getnchannels() == 1 and recording.getsampwidth() == 2
                source_rate = recording.getframerate()
                assert source_rate == 2 * RATE
                recording.setpos(round(start * source_rate))
                raw = recording.readframes(round((end - start) * source_rate))
            raw = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768
            # A two-sample average filters the decoded recording before decimation.
            segment = raw[:len(raw) // 2 * 2].reshape(-1, 2).mean(axis=1)
            split = round((onset - start) * RATE)
            consonant, vowel = segment[:split], segment[split:]
            held = sustain(vowel, samples(LONG_MS))
            gain = 0.80 / np.max(np.abs(np.concatenate((consonant, held))))
            for label, length in zip(labels, (SHORT_MS, LONG_MS)):
                target = vowel[:samples(length)] if length == SHORT_MS else held
                sound = fade(np.concatenate((consonant, target)) * gain, 7, 18)
                clips[label] = np.concatenate((silence(PAD_START_MS), sound, silence(PAD_END_MS)))
            short, long = (clips[label] for label in labels)
            assert len(long) - len(short) == samples(LONG_MS - SHORT_MS)
            print(f'{labels[0]} / {labels[1]}: {SHORT_MS} ms / {LONG_MS} ms of vowel')
    return clips


def msa_phones(text):
    written = SPOKEN.get(text, text)
    # The curriculum supplies the diacritics. Preserve them exactly instead of
    # sending the spelling through an automatic diacritizer.
    result = frontend.phonemize(written, [phrase for phrase, _ in frontend.split_phrases(written)])
    if text in FEMININE_ADDRESS:
        last_phone = max(index for index, phone in enumerate(result.phones) if phone.word >= 0)
        assert result.phones[last_phone].p == 'k'
        result.phones.insert(last_phone + 1, frontend.Phone('i', result.phones[last_phone].word))

    special = {'^': '<bos>', '$': '<eos>', ' ': '<sp>', '؟': '?', '،': ',', '؛': ';'}
    tokens = [special.get(phone.p, phone.p) for phone in result.phones]
    return [SYMBOL_TO_ID[token] for token in tokens], [phone.stress for phone in result.phones]


def synthesize(session, text):
    tokens, stress = msa_phones(text)
    out, _ = session.run(None, {
        'tokens': np.array([tokens], dtype=np.int64),
        'stress': np.array([stress], dtype=np.int64),
        'voice': np.array([0], dtype=np.int64),
        'speed': np.array([0.94], dtype=np.float32),
        'pitch_shift': np.array([0.0], dtype=np.float32),
        'pitch_range': np.array([1.0], dtype=np.float32),
    })
    sound = out[0]
    peak = float(np.max(np.abs(sound)))
    if peak < 1e-4 or not np.all(np.isfinite(sound)):
        raise ValueError(f'Invalid speech for {text}')
    active = np.flatnonzero(np.abs(sound) > peak * 0.008)
    sound = sound[max(0, active[0] - samples(12)):active[-1] + samples(20)]
    if len(sound) < samples(100):
        raise ValueError(f'Speech cut short for {text}')
    sound = fade(sound * (0.79 / peak), 4, 8)
    return np.concatenate((silence(PAD_START_MS), sound, silence(PAD_END_MS)))


def write_clip(path, audio):
    pcm = np.rint(np.clip(audio, -0.98, 0.98) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm.tobytes())


def main():
    model_path, corpus_path, output_path = sys.argv[1:]
    clips = json.loads(sys.stdin.buffer.read())
    native = native_vowels(corpus_path)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    session = ort.InferenceSession(model_path, sess_options=options, providers=['CPUExecutionProvider'])
    rendered = {}
    for clip in clips:
        text = clip['text']
        if 'pair' in clip:
            brief, held = clip['pair']
            rendered[clip['id']] = np.concatenate((native[brief], silence(230), native[held]))
        else:
            rendered[clip['id']] = native[text] if text in native else synthesize(session, text)
    for clip_id, audio in rendered.items():
        write_clip(Path(output_path) / f'{clip_id}.wav', audio)


if __name__ == '__main__':
    main()
