# LeitnerBoxes

[Open LeitnerBoxes](https://thechrisbellman.github.io/LeitnerBoxes/)

A browser-based French workplace vocabulary practice app using a five-box Leitner review system. This repository publishes the static site artifact hosted by GitHub Pages.

The application source is retained under [`src/`](src/) for auditability; [`site/`](site/) contains the hosted release artifact.

## About

LeitnerBoxes is an unofficial study aid. Its material grouping and unit headings broadly follow archived Government of Canada PFL2 language-training materials:

- [PFL2 A/B archive](https://publications.aws.tpsgc-pwgsc.cloud-nuage.canada.ca/site/fra/recherche/CataloguedesproduitsdeformationlinguistiqueAB.html)
- [PFL2 C archive catalogue](https://publications.gc.ca/site/eng/search/LanguageLearningProductsCatalogueC.html?wbdisable=false)

The app ships a 2,121-entry source-aligned vocabulary corpus selected from the public PFL2 PDFs so learners can practise terms, grammar forms, spelling, and phonetics that occur in the lessons. Learners choose practice directly: **Word meanings** uses the source vocabulary corpus across all 61 A, B, and C units, while **Grammar & usage** separately offers 154 recognition cards and the app provides present-tense conjugation practice. French-only rows from selected sparse A/B primary tables use English glosses reviewed for this app and are marked separately in the source evidence report; they are not presented as PDF-supplied English. The app also includes 401 independently authored exercise variants across 400 exercise targets; these are separate from the vocabulary corpus and are not official Government material. The source courses' exercises, recordings, and instructional text are not reproduced. Answer keys, corrections, and transcriptions were used only as secondary cross-checks; answer-key-only terms are excluded. The app is not affiliated with or endorsed by the Government of Canada. Government source material remains subject to the [Canada.ca terms and conditions](https://www.canada.ca/en/transparency/terms.html?lang=en).

## Source audit

Run `npm run validate:exercises` for the authored exercise coverage gate. The local source evidence check covers the reviewed sparse-unit rows and immutable identity snapshot; the full source audit runs after the supplied PDF text is present under `.tmp/pdf-text/` and `.tmp/source-audit.json`. The audit checks 76 PDFs, primary French/English evidence, reviewed-translation metadata, stable source IDs, and excludes answer-key-only rows; the PDFs and extracted text remain local.

## Privacy

The app has no accounts or backend. Learning progress and preferences stay in this browser; nothing is sent to analytics or a remote application service. See [PRIVACY.md](PRIVACY.md) for details.

## License

The application code is licensed under GPL-2.0-only; see [LICENSE](LICENSE). Runtime dependency notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Government of Canada source material and headings are identified above and are not relicensed by this file.
