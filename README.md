# LeitnerBoxes

[Open LeitnerBoxes](https://thechrisbellman.github.io/LeitnerBoxes/)

A browser-based French workplace vocabulary practice app using a five-box Leitner review system. This repository publishes the static site artifact hosted by GitHub Pages.

The application source is retained under [`src/`](src/) for auditability; [`site/`](site/) contains the hosted release artifact.

## About

LeitnerBoxes is an unofficial study aid. Its progression structure and unit headings broadly follow archived Government of Canada PFL2 language-training materials:

- [PFL2 A/B archive](https://publications.aws.tpsgc-pwgsc.cloud-nuage.canada.ca/site/fra/recherche/CataloguedesproduitsdeformationlinguistiqueAB.html)
- [PFL2 C archive catalogue](https://publications.gc.ca/site/eng/search/LanguageLearningProductsCatalogueC.html?wbdisable=false)

The app ships a 2,034-entry source-aligned corpus selected from the public PFL2 PDFs so learners can practise terms, grammar forms, spelling, and phonetics that occur in the lessons. Those entries are organized by the source curriculum units and use deterministic, form-matched answer choices from the reviewed source vocabulary. The app also includes 401 independently authored exercise variants across 400 exercise targets, alongside its legacy vocabulary/conjugation corpus; these are separate from the source-aligned corpus and are not official Government material. The source courses' exercises, recordings, and instructional text are not reproduced. Answer keys, corrections, and transcriptions were used only as secondary cross-checks; answer-key-only terms are excluded. The app is not affiliated with or endorsed by the Government of Canada. Government source material remains subject to the [Canada.ca terms and conditions](https://www.canada.ca/en/transparency/terms.html?lang=en).

## Source audit

Run `npm run validate:exercises` for the authored exercise coverage gate. Run `npm run audit:source` after generating the supplied PDF text under `.tmp/pdf-text/` and `.tmp/source-audit.json`. The audit checks 76 PDFs, primary French/English evidence, stable source IDs, and excludes answer-key-only rows; the PDFs and extracted text remain local.

## Privacy

The app has no accounts or backend. Learning progress and preferences stay in this browser; nothing is sent to analytics or a remote application service. See [PRIVACY.md](PRIVACY.md) for details.

## License

The application code is licensed under GPL-2.0-only; see [LICENSE](LICENSE). Runtime dependency notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Government of Canada source material and headings are identified above and are not relicensed by this file.
