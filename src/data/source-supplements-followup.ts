import { englishEvidenceFragments, type SourceEvidence, type SourceSupplement, type SourceSupplementRow } from './source-evidence.ts'

type EvidenceSpec = Pick<SourceEvidence, 'pdf' | 'page' | 'lineRange' | 'section' | 'category'>

const a01OrganizationRows: readonly SourceSupplementRow[] = [
  { lessonId: 'a-01', french: 'Agriculture et Agroalimentaire Canada', answer: 'Agriculture and Agri-Food Canada' },
  { lessonId: 'a-01', french: 'Communication Canada', answer: 'Communication Canada' },
  { lessonId: 'a-01', french: 'Commission de l’immigration et du statut de réfugié du Canada', answer: 'Immigration and Refugee Board of Canada' },
  { lessonId: 'a-01', french: 'Ressources naturelles Canada', answer: 'Natural Resources Canada' },
  { lessonId: 'a-01', french: 'Environnement Canada', answer: 'Environment Canada' },
  { lessonId: 'a-01', french: 'Affaires étrangères et Commerce international', answer: 'Foreign Affairs and International Trade' },
  { lessonId: 'a-01', french: 'Finances Canada', answer: 'Finance Canada' },
  { lessonId: 'a-01', french: 'Justice', answer: 'Justice' },
  { lessonId: 'a-01', french: 'Défense nationale', answer: 'National Defence' },
  { lessonId: 'a-01', french: 'Archives nationales du Canada', answer: 'National Archives of Canada' },
  { lessonId: 'a-01', french: 'Agence du revenu Canada', answer: 'Canada Revenue Agency' },
  { lessonId: 'a-01', french: 'Solliciteur général', answer: 'Solicitor General' },
  { lessonId: 'a-01', french: 'Transports Canada', answer: 'Transport Canada' },
  { lessonId: 'a-01', french: 'Société canadienne des Postes', answer: 'Canada Post Corporation' },
  { lessonId: 'a-01', french: 'Corporation commerciale canadienne', answer: 'Consumer and Corporate Affairs' },
  { lessonId: 'a-01', french: 'Pêches et Océans', answer: 'Fisheries and Oceans' },
  { lessonId: 'a-01', french: 'Santé Canada', answer: 'Health Canada' },
  { lessonId: 'a-01', french: 'Patrimoine canadien', answer: 'Canadian Heritage' },
  { lessonId: 'a-01', french: 'Chambre des communes', answer: 'House of Commons' },
  { lessonId: 'a-01', french: 'Affaires indiennes et du Nord', answer: 'Indian and Northern Affairs' },
  { lessonId: 'a-01', french: 'Bibliothèque nationale', answer: 'National Library' },
  { lessonId: 'a-01', french: 'Travaux publics et Services gouvernementaux Canada', answer: 'Public Works and Government Services Canada' },
  { lessonId: 'a-01', french: 'Conseil du Trésor', answer: 'Treasury Board' },
  { lessonId: 'a-01', french: 'Agence canadienne de développement international', answer: 'Canadian International Development Agency' },
  { lessonId: 'a-01', french: 'Commission de la Capitale nationale', answer: 'National Capital Commission' },
  { lessonId: 'a-01', french: 'Commission de la fonction publique', answer: 'Public Service Commission' },
  { lessonId: 'a-01', french: 'Centre national des arts', answer: 'National Arts Centre' },
  { lessonId: 'a-01', french: 'Conseil de la radiodiffusion et des télécommunications canadiennes', answer: 'Canadian Radio-television and Telecommunications Commission' },
  { lessonId: 'a-01', french: 'Gendarmerie royale du Canada', answer: 'Royal Canadian Mounted Police' },
  { lessonId: 'a-01', french: 'Office national du film', answer: 'National Film Board' },
]

const a02DocumentRows: readonly SourceSupplementRow[] = [
  { lessonId: 'a-02', french: 'l’annexe', answer: 'the appendix' },
  { lessonId: 'a-02', french: 'diffusion restreinte', answer: 'restricted' },
  { lessonId: 'a-02', french: 'protégé', answer: 'protected' },
  { lessonId: 'a-02', french: 'confidentiel', answer: 'confidential' },
  { lessonId: 'a-02', french: 'secret', answer: 'secret' },
  { lessonId: 'a-02', french: 'le tableau', answer: 'chart' },
]

const a02GrammarRows: readonly SourceSupplementRow[] = [
  { lessonId: 'a-02', french: 'la note de service', answer: 'the memo' },
]

const a15ObtainingRows: readonly SourceSupplementRow[] = [
  { lessonId: 'a-15', french: 'avoir', answer: 'to get' },
]

const a19QualityRows: readonly SourceSupplementRow[] = [
  { lessonId: 'a-19', french: 'élevé', answer: 'high' },
  { lessonId: 'a-19', french: 'élevée', answer: 'high' },
  { lessonId: 'a-19', french: 'basse', answer: 'low' },
  { lessonId: 'a-19', french: 'normale', answer: 'normal' },
  { lessonId: 'a-19', french: 'ordinaire', answer: 'ordinary' },
  { lessonId: 'a-19', french: 'parfaite', answer: 'perfect' },
  { lessonId: 'a-19', french: 'efficient', answer: 'efficient' },
]

const a19OpinionRows: readonly SourceSupplementRow[] = [
  { lessonId: 'a-19', french: 'l’opinion', answer: 'the opinion' },
  { lessonId: 'a-19', french: 'à mon avis', answer: 'in my opinion' },
  { lessonId: 'a-19', french: 'd’après eux', answer: 'according to them' },
  { lessonId: 'a-19', french: 'selon elle', answer: 'according to her' },
  { lessonId: 'a-19', french: 'avoir l’impression que', answer: 'to have the impression that' },
  { lessonId: 'a-19', french: 'croire que', answer: 'to believe that' },
  { lessonId: 'a-19', french: 'être d’avis que', answer: 'to be of the opinion that' },
  { lessonId: 'a-19', french: 'penser de', answer: 'to think of' },
  { lessonId: 'a-19', french: 'penser que', answer: 'to think that' },
  { lessonId: 'a-19', french: 'trouver que', answer: 'to find that' },
  { lessonId: 'a-19', french: 'ça me paraît', answer: 'it appears to me' },
  { lessonId: 'a-19', french: 'il nous semble que', answer: 'it seems to us that' },
  { lessonId: 'a-19', french: 'je dirais que', answer: 'I would say that' },
  { lessonId: 'a-19', french: 'en ce qui me concerne', answer: 'as far as I am concerned' },
  { lessonId: 'a-19', french: 'personnellement', answer: 'personally' },
  { lessonId: 'a-19', french: 'pour ma part', answer: 'for my part' },
  { lessonId: 'a-19', french: 'quant à moi', answer: 'as for me' },
  { lessonId: 'a-19', french: 'être d’accord', answer: 'to agree' },
  { lessonId: 'a-19', french: 'être en désaccord', answer: 'to disagree' },
  { lessonId: 'a-19', french: 'd’accord', answer: 'agree' },
  { lessonId: 'a-19', french: 'être de l’avis de quelqu’un', answer: 'to be of the same opinion as someone' },
  { lessonId: 'a-19', french: 'partager l’avis de quelqu’un', answer: 'to share the opinion of someone' },
]

const withEvidence = (rows: readonly SourceSupplementRow[], spec: EvidenceSpec): readonly SourceSupplement[] => rows.map((row) => ({
  ...row,
  evidence: { ...spec, evidenceType: 'source-table', englishFragments: englishEvidenceFragments(row.answer) },
}))

export const sourceSupplementsFollowup: readonly SourceSupplement[] = [
  ...withEvidence(a01OrganizationRows.slice(0, 13), {
    pdf: 'SC102-2-1-2005-fra.pdf', page: 15, lineRange: '370-396',
    section: '1.1 Notions — partial list of ministries and organizations (similar names)', category: 'expression',
  }),
  ...withEvidence(a01OrganizationRows.slice(13, 23), {
    pdf: 'SC102-2-1-2005-fra.pdf', page: 16, lineRange: '404-423',
    section: '1.1 Notions — partial list of ministries and organizations (different names)', category: 'expression',
  }),
  ...withEvidence(a01OrganizationRows.slice(23), {
    pdf: 'SC102-2-1-2005-fra.pdf', page: 16, lineRange: '427-453',
    section: '1.1 Notions — frequently used acronyms and organizations', category: 'expression',
  }),
  ...withEvidence(a02DocumentRows.slice(0, 5), {
    pdf: 'SC102-2-2-2005-fra.pdf', page: 20, lineRange: '424-436',
    section: '2.1 Notions — document classification', category: 'vocabulary',
  }),
  ...withEvidence(a02DocumentRows.slice(5), {
    pdf: 'SC102-2-2-2005-fra.pdf', page: 20, lineRange: '464-474',
    section: '2.1 Notions — illustrated documents', category: 'vocabulary',
  }),
  ...withEvidence(a02GrammarRows, {
    pdf: 'SC102-2-2-2005-fra.pdf', page: 26, lineRange: '656-670',
    section: '2.2 Grammaire — noun gender chart', category: 'grammar',
  }),
  ...withEvidence(a15ObtainingRows, {
    pdf: 'SC102-2-15-2005-fra.pdf', page: 12, lineRange: '272-314',
    section: '15.1 Notions — obtaining indicators', category: 'verb/form',
  }),
  ...withEvidence(a19QualityRows, {
    pdf: 'SC102-2-19-2005-fra.pdf', page: 18, lineRange: '382-413',
    section: '19.1 Notions — quality indicators', category: 'spelling',
  }),
  ...withEvidence(a19OpinionRows, {
    pdf: 'SC102-2-19-2005-fra.pdf', page: 76, lineRange: '2293-2318',
    section: '19.7 Notions — opinion, agreement, and disagreement indicators', category: 'expression',
  }),
]
