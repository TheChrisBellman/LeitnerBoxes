# LeitnerBoxes

[Open LeitnerBoxes](https://thechrisbellman.github.io/LeitnerBoxes/)

A browser-based French workplace vocabulary practice app using a five-box Leitner review system. This repository publishes the static site artifact hosted by GitHub Pages.

The application source is retained under [`src/`](src/) for auditability; [`site/`](site/) contains the hosted release artifact.

## About

LeitnerBoxes is an unofficial study aid. Its progression structure and unit headings broadly follow archived Government of Canada PFL2 language-training materials:

- [PFL2 A/B archive](https://publications.aws.tpsgc-pwgsc.cloud-nuage.canada.ca/site/fra/recherche/CataloguedesproduitsdeformationlinguistiqueAB.html)
- [PFL2 C archive catalogue](https://publications.gc.ca/site/eng/search/LanguageLearningProductsCatalogueC.html?wbdisable=false)

The app ships a 550-card source-aligned vocabulary corpus selected from the public PFL2 PDFs so learners can practise terms that occur in the lessons. Those cards are organized by the source curriculum units and use deterministic, form-matched answer choices from the reviewed lesson vocabulary. The app also retains an independently authored legacy vocabulary/conjugation corpus and practice exercises, which power its ten activity types; these are separate from the source-aligned cards and are not official Government material. The source courses' exercises, recordings, and instructional text are not reproduced. The app is not affiliated with or endorsed by the Government of Canada. Government source material remains subject to the [Canada.ca terms and conditions](https://www.canada.ca/en/transparency/terms.html?lang=en).

## Privacy

The app has no accounts or backend. Learning progress and preferences stay in this browser; nothing is sent to analytics or a remote application service. See [PRIVACY.md](PRIVACY.md) for details.

## License

The application code is licensed under GPL-2.0-only; see [LICENSE](LICENSE). Runtime dependency notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Government of Canada source material and headings are identified above and are not relicensed by this file.
