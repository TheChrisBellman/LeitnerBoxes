import type { CardTier, Word } from './types.ts'

type Row = {
  suffix: string
  french: string
  answer: string
  distractors: [string, string, string]
  reverseDistractors: [string, string, string]
  tier?: CardTier
}

const authored = (lessonId: string, rows: readonly Row[]): Word[] => rows.map((row, index) => ({
  id: `${lessonId}-${row.suffix}`,
  french: row.french,
  answer: row.answer,
  distractors: row.distractors,
  reverseDistractors: row.reverseDistractors,
  level: 'B',
  lessonId,
  kind: 'vocabulary',
  tier: row.tier ?? 'core',
  order: index + 1,
}))

export const wordsB: Word[] = [
  ...authored('b-33', [
    { suffix: '01', french: 'choisir entre', answer: 'to choose between', distractors: ['to hesitate between', 'to compare two options', 'to choose both'], reverseDistractors: ['hésiter entre', 'comparer deux options', 'choisir les deux'] },
    { suffix: '02', french: 'opter pour', answer: 'to opt for', distractors: ['to rule out', 'to hesitate over', 'to settle for'], reverseDistractors: ['écarter', 'hésiter entre', 'se contenter de'] },
    { suffix: '03', french: 'de préférence', answer: 'preferably', distractors: ['if necessary', 'without preference', 'necessarily'], reverseDistractors: ['si nécessaire', 'sans préférence', 'obligatoirement'] },
    { suffix: '04', french: 'le premier choix', answer: 'the first choice', distractors: ['the second choice', 'the final choice', 'the only choice'], reverseDistractors: ['le deuxième choix', 'le choix définitif', 'le seul choix'] },
    { suffix: '05', french: 'une solution de rechange', answer: 'an alternative solution', distractors: ['a primary solution', 'a temporary solution', 'a compromise solution'], reverseDistractors: ['une solution principale', 'une solution provisoire', 'une solution de compromis'] },
    { suffix: '06', french: 'quant à moi', answer: 'as for me', distractors: ['according to you', 'as for them', 'on our behalf'], reverseDistractors: ['selon vous', 'quant à eux', 'en notre nom'] },
  ]),
  ...authored('b-34', [
    { suffix: '01', french: 'cerner le problème', answer: 'to define the problem', distractors: ['to diagnose the problem', 'to minimize the problem', 'to solve the problem'], reverseDistractors: ['diagnostiquer le problème', 'minimiser le problème', 'résoudre le problème'] },
    { suffix: '02', french: 'proposer une solution', answer: 'to propose a solution', distractors: ['to evaluate a solution', 'to reject a solution', 'to implement a solution'], reverseDistractors: ['évaluer une solution', 'rejeter une solution', 'mettre en œuvre une solution'] },
    { suffix: '03', french: 'régler une difficulté', answer: 'to resolve a difficulty', distractors: ['to identify a difficulty', 'to avoid a difficulty', 'to create a difficulty'], reverseDistractors: ['cerner une difficulté', 'contourner une difficulté', 'créer une difficulté'] },
    { suffix: '04', french: 'une mesure corrective', answer: 'a corrective measure', distractors: ['a preventive measure', 'a temporary measure', 'a disciplinary measure'], reverseDistractors: ['une mesure préventive', 'une mesure provisoire', 'une mesure disciplinaire'] },
    { suffix: '05', french: 'envisager une autre approche', answer: 'to consider another approach', distractors: ['to reject another approach', 'to maintain the same approach', 'to compare two approaches'], reverseDistractors: ['écarter une autre approche', 'maintenir la même approche', 'comparer deux approches'] },
    { suffix: '06', french: 'remédier à', answer: 'to remedy', distractors: ['to prevent', 'to alleviate', 'to worsen'], reverseDistractors: ['prévenir', 'atténuer', 'aggraver'] },
  ]),
  ...authored('b-35', [
    { suffix: '01', french: 'prévoir une hausse', answer: 'to forecast an increase', distractors: ['to record an increase', 'to limit an increase', 'to explain an increase'], reverseDistractors: ['constater une hausse', 'limiter une hausse', 'expliquer une hausse'] },
    { suffix: '02', french: 'selon les prévisions', answer: 'according to the forecasts', distractors: ['according to the results', 'according to the estimates', 'according to the latest figures'], reverseDistractors: ['selon les résultats', 'selon les estimations', 'selon les derniers chiffres'] },
    { suffix: '03', french: 'à long terme', answer: 'in the long term', distractors: ['in the medium term', 'in the short term', 'immediately'], reverseDistractors: ['à moyen terme', 'à court terme', 'immédiatement'] },
    { suffix: '04', french: 'une tendance', answer: 'a trend', distractors: ['a fluctuation', 'a projection', 'an anomaly'], reverseDistractors: ['une fluctuation', 'une prévision', 'une anomalie'] },
    { suffix: '05', french: 'il est probable que', answer: 'it is likely that', distractors: ['it is possible that', 'it is certain that', 'it is unlikely that'], reverseDistractors: ['il est possible que', 'il est certain que', 'il est peu probable que'] },
    { suffix: '06', french: 'anticiper les besoins', answer: 'to anticipate needs', distractors: ['to assess current needs', 'to meet the needs', 'to reduce the needs'], reverseDistractors: ['évaluer les besoins actuels', 'répondre aux besoins', 'réduire les besoins'] },
  ]),
  ...authored('b-36', [
    { suffix: '01', french: 'l’état d’avancement', answer: 'the progress status', distractors: ['the current status', 'the completion rate', 'the final assessment'], reverseDistractors: ['l’état actuel', 'le taux d’achèvement', 'le bilan final'] },
    { suffix: '02', french: 'faire le point', answer: 'to take stock', distractors: ['to review the situation', 'to set the priorities', 'to monitor progress'], reverseDistractors: ['examiner la situation', 'fixer les priorités', 'suivre l’avancement'] },
    { suffix: '03', french: 'les prochaines étapes', answer: 'the next steps', distractors: ['the remaining tasks', 'the previous steps', 'the final outcomes'], reverseDistractors: ['les tâches restantes', 'les étapes précédentes', 'les résultats finaux'] },
    { suffix: '04', french: 'préciser les objectifs', answer: 'to clarify the objectives', distractors: ['to revise the objectives', 'to prioritize the objectives', 'to measure the objectives'], reverseDistractors: ['réviser les objectifs', 'prioriser les objectifs', 'mesurer les objectifs'] },
    { suffix: '05', french: 'un échéancier', answer: 'a timeline', distractors: ['a deadline', 'a milestone', 'a work plan'], reverseDistractors: ['une date limite', 'un jalon', 'un plan de travail'] },
    { suffix: '06', french: 'rendre compte de', answer: 'to report on', distractors: ['to decide on', 'to inquire about', 'to follow up on'], reverseDistractors: ['décider de', 'se renseigner sur', 'faire le suivi de'] },
  ]),
  ...authored('b-37', [
    { suffix: '01', french: 'la démarche suivie', answer: 'the approach taken', distractors: ['the method proposed', 'the decision made', 'the procedure rejected'], reverseDistractors: ['la méthode proposée', 'la décision prise', 'la procédure écartée'] },
    { suffix: '02', french: 'recueillir des données', answer: 'to collect data', distractors: ['to analyze data', 'to verify data', 'to publish data'], reverseDistractors: ['analyser des données', 'vérifier des données', 'publier des données'] },
    { suffix: '03', french: 'analyser les résultats', answer: 'to analyze the results', distractors: ['to compare the results', 'to present the results', 'to validate the results'], reverseDistractors: ['comparer les résultats', 'présenter les résultats', 'valider les résultats'] },
    { suffix: '04', french: 'mettre à l’essai', answer: 'to test', distractors: ['to deploy', 'to modify', 'to approve'], reverseDistractors: ['déployer', 'modifier', 'approuver'] },
    { suffix: '05', french: 'tirer une conclusion', answer: 'to draw a conclusion', distractors: ['to test a hypothesis', 'to present a finding', 'to revise an analysis'], reverseDistractors: ['vérifier une hypothèse', 'présenter un constat', 'revoir une analyse'] },
    { suffix: '06', french: 'documenter les décisions', answer: 'to document the decisions', distractors: ['to justify the decisions', 'to communicate the decisions', 'to implement the decisions'], reverseDistractors: ['justifier les décisions', 'communiquer les décisions', 'mettre en œuvre les décisions'] },
  ]),
  ...authored('b-38', [
    { suffix: '01', french: 'la cause principale', answer: 'the main cause', distractors: ['a contributing factor', 'the immediate consequence', 'the initial condition'], reverseDistractors: ['un facteur contributif', 'la conséquence immédiate', 'la condition initiale'] },
    { suffix: '02', french: 'entraîner des conséquences', answer: 'to lead to consequences', distractors: ['to prevent consequences', 'to assess consequences', 'to suffer consequences'], reverseDistractors: ['prévenir les conséquences', 'évaluer les conséquences', 'subir les conséquences'] },
    { suffix: '03', french: 'en raison de', answer: 'due to', distractors: ['despite', 'prior to', 'in addition to'], reverseDistractors: ['malgré', 'avant', 'en plus de'] },
    { suffix: '04', french: 'par conséquent', answer: 'consequently', distractors: ['nevertheless', 'previously', 'conversely'], reverseDistractors: ['néanmoins', 'auparavant', 'inversement'] },
    { suffix: '05', french: 'expliquer les répercussions', answer: 'to explain the repercussions', distractors: ['to predict the repercussions', 'to minimize the repercussions', 'to measure the repercussions'], reverseDistractors: ['prévoir les répercussions', 'minimiser les répercussions', 'mesurer les répercussions'] },
    { suffix: '06', french: 'avoir pour effet de', answer: 'to have the effect of', distractors: ['to have the purpose of', 'to run the risk of', 'to be the result of'], reverseDistractors: ['avoir pour objectif de', 'risquer de', 'résulter de'] },
  ]),
  ...authored('b-39', [
    { suffix: '01', french: 'une amélioration attendue', answer: 'an expected improvement', distractors: ['a temporary improvement', 'an unexpected decline', 'projected stability'], reverseDistractors: ['une amélioration temporaire', 'une détérioration imprévue', 'une stabilité prévue'] },
    { suffix: '02', french: 'les répercussions possibles', answer: 'the possible repercussions', distractors: ['the likely benefits', 'the immediate causes', 'the confirmed results'], reverseDistractors: ['les avantages probables', 'les causes immédiates', 'les résultats confirmés'] },
    { suffix: '03', french: 'être favorable à', answer: 'to be in favour of', distractors: ['to be opposed to', 'to be undecided about', 'to be responsible for'], reverseDistractors: ['être opposé à', 'être indécis quant à', 'être responsable de'] },
    { suffix: '04', french: 'soulever une réserve', answer: 'to raise a concern', distractors: ['to dismiss a concern', 'to resolve a concern', 'to note a limitation'], reverseDistractors: ['écarter une réserve', 'lever une réserve', 'signaler une limite'] },
    { suffix: '05', french: 'mesurer les résultats', answer: 'to measure the results', distractors: ['to compare the results', 'to interpret the results', 'to communicate the results'], reverseDistractors: ['comparer les résultats', 'interpréter les résultats', 'communiquer les résultats'] },
    { suffix: '06', french: 'un changement graduel', answer: 'a gradual change', distractors: ['a sudden change', 'a temporary change', 'a minor change'], reverseDistractors: ['un changement soudain', 'un changement temporaire', 'un changement mineur'] },
  ]),
  ...authored('b-40', [
    { suffix: '01', french: 'faire valoir un point de vue', answer: 'to make a case', distractors: ['to challenge an argument', 'to summarize a position', 'to state an objection'], reverseDistractors: ['contester un argument', 'résumer une position', 'formuler une objection'] },
    { suffix: '02', french: 'convaincre quelqu’un', answer: 'to convince someone', distractors: ['to reassure someone', 'to consult someone', 'to pressure someone'], reverseDistractors: ['rassurer quelqu’un', 'consulter quelqu’un', 'faire pression sur quelqu’un'] },
    { suffix: '03', french: 'mettre en évidence', answer: 'to highlight', distractors: ['to downplay', 'to conceal', 'to summarize'], reverseDistractors: ['minimiser', 'dissimuler', 'résumer'] },
    { suffix: '04', french: 'un argument solide', answer: 'a strong argument', distractors: ['a weak argument', 'a counterargument', 'an unsupported claim'], reverseDistractors: ['un argument faible', 'un contre-argument', 'une affirmation non étayée'] },
    { suffix: '05', french: 'recommander une approche', answer: 'to recommend an approach', distractors: ['to evaluate an approach', 'to reject an approach', 'to impose an approach'], reverseDistractors: ['évaluer une approche', 'rejeter une approche', 'imposer une approche'] },
    { suffix: '06', french: 'il serait préférable de', answer: 'it would be preferable to', distractors: ['it would be necessary to', 'it would be risky to', 'it would be premature to'], reverseDistractors: ['il serait nécessaire de', 'il serait risqué de', 'il serait prématuré de'] },
  ]),
]
