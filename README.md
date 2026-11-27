# Arabic Garden

Arabic Garden is a browser app for a five-year-old starting Modern Standard Arabic. Its 24 short lessons progress through everyday conversation, all 28 letters, vowel marks, joined forms, simple reading and classroom routines. The play area has three games and an alphabet tracing board. The parent checklist records observed skills alongside completed lessons.

The app stores progress in the browser using local storage. It bundles Modern Standard Arabic synthetic speech for the general lessons and native-speaker recordings for the short and long vowel drills. The app uses no microphone and requires no learning account.

## Run from source

Serve the `docs` folder with a static HTTP server. With Python 3 installed, run this from the repository root and open `http://localhost:8000`.

```sh
python -m http.server 8000 --directory docs
```

GitHub Pages serves `docs/` from the `main` branch. The published site uses the bundled audio and fonts.

The curriculum is in `docs/curriculum.js`. To refresh its audio, use Node.js 22 or later and Python with `numpy` and `onnxruntime`. Download the ONNX checkpoint and put the three files from the `tiny_voca_ar` front end in a directory of that name on `PYTHONPATH`. The curriculum provides the diacritics, so a separate diacritization model is unnecessary. [Model checkpoint](https://huggingface.co/oddadmix/tiny-voca-arabic/tree/30da3c1/onnx) · [Arabic front end](https://huggingface.co/spaces/oddadmix/tiny-voca-arabic/tree/main/tiny_voca_ar)

Download the Arabic Speech Corpus ZIP and run `node scripts/generate-audio.mjs <python-executable> <model.onnx> <arabic-speech-corpus.zip>`. The renderer takes each vowel pair from the same studio recording and adjusts the vowel to 120 ms and 240 ms while retaining the consonant onset and pitch. [Arabic Speech Corpus download](https://en.arabicspeechcorpus.com/)

## Credits

- The learning path takes guidance from the [UAE Ministry of Education’s non-native Arabic KG1 and KG2 outcomes](https://www.moe.gov.ae/en/guides/Documents/Mandatory%20subjects/Performance-Levels-for-Mandatory-Kindergarten-Subjects-in-Private-Schools-En.pdf). It covers selected Arabic skills for home practice.
- General lesson audio is synthesized with oddadmix’s Modern Standard Arabic model. [tiny-voca-arabic](https://huggingface.co/oddadmix/tiny-voca-arabic)
- Vowel audio uses excerpts of Nawar Halabi’s Arabic Speech Corpus, edited for duration and level. [Arabic Speech Corpus](https://en.arabicspeechcorpus.com/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Nunito and Noto Naskh Arabic are supplied under their accompanying SIL Open Font Licenses in `docs/fonts`.
- The built-in ImageGen tool generated `docs/images/fennec-garden.webp` from this prompt.

  > Use case illustration-story. Create a single landscape 3:2 hero illustration for a premium whimsical preschool Arabic-learning web app called Arabic Garden (do not draw any text or letters). Composition: a big adorable golden sand baby fennec fox with enormous soft pointed ears, cherry pink inner ears, round black eyes and rosy cheeks, wearing a small sage-green neckerchief, sitting at the right-of-center holding open a violet picture book, looking up at a tiny hovering bumblebee. A vivid patch of spring greens, flowering pink and ivory daisies, lilac and blue wildflowers and leaves forms a layered little miniature garden around it, a couple of floating white seed puffs and butterflies. Both the fox and its book should fit in the middle-right 75% of the image, with only softly diffused pale lavender empty space all around the image edges and noticeably more empty space on the left for a fade into UI. Soft plain pale lilac background exactly around #ebe6ff, no horizon, no panel edge. Bespoke hand-painted storybook illustration with beautiful simplified shapes, faint paper texture, clean silhouettes, bold greens, golden oranges and lavender accents. Charming, airy, gentle, sophisticated and immediately legible at small scale. No text, no numbers, no lettering, no logo, no frame, no typography, no humans.
