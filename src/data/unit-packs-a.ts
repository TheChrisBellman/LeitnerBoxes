import type { UnitPackSeed } from './unit-pack-factory.ts'

export const unitPacksA: UnitPackSeed[] = [
  { unitId: 'a-01', topic: 'l’accueil d’une nouvelle collègue', goal: 'accueillir une nouvelle collègue', action: 'présenter la nouvelle collègue', imperative: 'présentez la nouvelle collègue', result: 'un accueil chaleureux', decision: 'présenter la nouvelle collègue avant la réunion', correctionWrong: 'la nouvelle collègue arrivent aujourd’hui', correctionRight: 'la nouvelle collègue arrive aujourd’hui', transformationSource: 'L’équipe présente la nouvelle collègue à tout le service.', transformationAnswer: 'La nouvelle collègue est présentée à tout le service par l’équipe.', scaffold: { context: 'A new colleague is joining the team. Introduce her before the meeting.', clozePrompt: '___ la nouvelle collègue.', clozeAnswer: 'présentez', clozeDistractors: ['accueillez', 'réunissez', 'appelez'], transformationSource: 'L’équipe présente la nouvelle collègue.', transformationAnswer: 'La nouvelle collègue est présentée par l’équipe.' }, reviewedDistractors: { bestResponse: ['Je vais présenter l’équipe.', 'Je vais inviter la nouvelle collègue.', 'Je vais accueillir l’équipe.'], cloze: ['invitez', 'accueillez', 'appelez'], reading: ['Elle doit inviter la nouvelle collègue.', 'Elle doit présenter l’équipe.', 'Elle doit accueillir l’équipe.'], transformation: ['L’équipe est présentée par la nouvelle collègue.', 'L’équipe ne présente pas la nouvelle collègue.', 'L’équipe présentera la nouvelle collègue.'], scenario: ['Je vais inviter la nouvelle collègue avant la réunion.', 'Je vais présenter l’équipe avant la réunion.', 'Je vais accueillir l’équipe avant la réunion.'] } },
  { unitId: 'a-02', topic: 'les documents de référence', goal: 'organiser les documents de référence', action: 'classer les documents', imperative: 'classez les documents', result: 'un dossier facile à consulter', decision: 'classer les documents avant de répondre', correctionWrong: 'les documents arrive demain', correctionRight: 'les documents arrivent demain', transformationSource: 'Nous classons les documents pour les retrouver facilement.', transformationAnswer: 'Les documents sont classés pour être retrouvés facilement.', scaffold: { context: 'The reference documents need to be organized before the meeting.', clozePrompt: '___ les documents.', clozeAnswer: 'classez', clozeDistractors: ['imprimez', 'copiez', 'supprimez'], transformationSource: 'L’équipe classe les documents.', transformationAnswer: 'Les documents sont classés par l’équipe.' }, reviewedDistractors: { bestResponse: ['Je vais imprimer les documents.', 'Je vais copier les documents.', 'Je vais supprimer les documents.'], cloze: ['imprimez', 'copiez', 'supprimez'], reading: ['Elle doit imprimer les documents.', 'Elle doit copier les documents.', 'Elle doit supprimer les documents.'], transformation: ['Les documents ne sont pas classés par l’équipe.', 'L’équipe classera les documents.', 'L’équipe classe les réunions.'], scenario: ['Je vais imprimer les documents avant la réunion.', 'Je vais copier les documents avant la réunion.', 'Je vais supprimer les documents avant la réunion.'] } },
  { unitId: 'a-03', topic: 'les liens entre les services', goal: 'indiquer les liens entre les services', action: 'indiquer le service responsable', imperative: 'indiquez le service responsable', result: 'une responsabilité bien comprise', decision: 'indiquer le service responsable avant de continuer', correctionWrong: 'le service responsable sont ici', correctionRight: 'le service responsable est ici', transformationSource: 'Il faut indiquer le service responsable.', transformationAnswer: 'Le service responsable doit être indiqué.', scaffold: { context: 'One service is responsible for the request. Say which service it is.', clozePrompt: '___ le service responsable.', clozeAnswer: 'indiquez', clozeDistractors: ['contactez', 'avertissez', 'changez'], transformationSource: 'L’équipe indique le service responsable.', transformationAnswer: 'Le service responsable est indiqué par l’équipe.' }, reviewedDistractors: { bestResponse: ['Je vais contacter le service responsable.', 'Je vais appeler le service responsable.', 'Je vais changer de service.'], cloze: ['contactez', 'appelez', 'changez'], reading: ['Elle doit contacter le service responsable.', 'Elle doit appeler le service responsable.', 'Elle doit changer de service.'], transformation: ['Le service responsable n’est pas indiqué par l’équipe.', 'L’équipe indiquera le service responsable demain.', 'L’équipe contacte le service responsable.'], scenario: ['Je vais contacter le service responsable avant de continuer.', 'Je vais appeler le service responsable avant de continuer.', 'Je vais changer de service avant de continuer.'] } },
  { unitId: 'a-04', topic: 'le matériel partagé', goal: 'vérifier ce qui appartient à l’équipe', action: 'vérifier les fournitures', imperative: 'vérifiez les fournitures', result: 'un poste de travail complet', decision: 'vérifier les fournitures avant de les distribuer', correctionWrong: 'les fournitures est sur la table', correctionRight: 'les fournitures sont sur la table', transformationSource: 'L’équipe vérifie les fournitures avant de les partager.', transformationAnswer: 'Avant de partager les fournitures, l’équipe les vérifie.', scaffold: { context: 'The team shares supplies. Check who they belong to.', clozePrompt: '___ les fournitures.', clozeAnswer: 'vérifiez', clozeDistractors: ['rangez', 'distribuez', 'remplacez'], transformationSource: 'L’équipe vérifie les fournitures.', transformationAnswer: 'Les fournitures sont vérifiées par l’équipe.' }, reviewedDistractors: { bestResponse: ['Je vais ranger les fournitures.', 'Je vais remplacer les fournitures.', 'Je vais distribuer les fournitures.'], cloze: ['rangez', 'remplacez', 'distribuez'], reading: ['Elle doit ranger les fournitures.', 'Elle doit remplacer les fournitures.', 'Elle doit distribuer les fournitures.'], transformation: ['Les fournitures ne sont pas vérifiées par l’équipe.', 'L’équipe vérifiera les fournitures demain.', 'L’équipe distribue les fournitures.'], scenario: ['Je vais ranger les fournitures avant de les distribuer.', 'Je vais remplacer les fournitures avant de les distribuer.', 'Je vais distribuer les fournitures avant de les vérifier.'] } },
  { unitId: 'a-05', topic: 'l’emplacement des salles', goal: 'indiquer où se trouvent les salles', action: 'indiquer le chemin', imperative: 'indiquez le chemin', result: 'un déplacement sans confusion', decision: 'indiquer le chemin avant le départ', correctionWrong: 'le guide indiquent clairement le chemin', correctionRight: 'le guide indique clairement le chemin', transformationSource: 'Le guide indique où se trouvent les salles.', transformationAnswer: 'Le guide donne l’emplacement des salles.' },
  { unitId: 'a-06', topic: 'le nombre de dossiers', goal: 'établir le nombre de dossiers', action: 'compter les dossiers', imperative: 'comptez les dossiers', result: 'un inventaire exact', decision: 'compter les dossiers avant de commander', correctionWrong: 'nous compte les dossiers avec soin', correctionRight: 'nous comptons les dossiers avec soin', transformationSource: 'Nous comptons les dossiers avant l’inventaire.', transformationAnswer: 'Avant l’inventaire, nous comptons les dossiers.' },
  { unitId: 'a-07', topic: 'l’itinéraire vers la salle', goal: 'orienter une personne vers la salle', action: 'décrire le trajet', imperative: 'décrivez le trajet', result: 'une arrivée à l’heure', decision: 'décrire le trajet avant la visite', correctionWrong: 'vous décrit le trajet clairement', correctionRight: 'vous décrivez le trajet clairement', transformationSource: 'Vous devez décrire le trajet jusqu’à la salle.', transformationAnswer: 'Il faut décrire le trajet jusqu’à la salle.' },
  { unitId: 'a-08', topic: 'les échéances du projet', goal: 'situer les échéances du projet', action: 'noter les dates', imperative: 'notez les dates', result: 'un calendrier fiable', decision: 'noter les dates avant de planifier', correctionWrong: 'le calendrier présentent les dates', correctionRight: 'le calendrier présente les dates', transformationSource: 'Le calendrier présente les dates du projet.', transformationAnswer: 'Le calendrier indique les dates du projet.' },
  { unitId: 'a-09', topic: 'les actions dans le temps', goal: 'situer les actions passées, présentes et futures', action: 'situer les événements', imperative: 'situez les événements', result: 'une chronologie claire', decision: 'situer les événements avant de résumer', correctionWrong: 'nous situe les événements dans le temps', correctionRight: 'nous situons les événements dans le temps', transformationSource: 'Nous situons les événements dans le temps.', transformationAnswer: 'Nous plaçons les événements dans le temps.' },
  { unitId: 'a-10', topic: 'la répartition des tâches', goal: 'assigner les tâches de l’équipe', action: 'attribuer les responsabilités', imperative: 'attribuez les responsabilités', result: 'un travail bien réparti', decision: 'attribuer les responsabilités avant de commencer', correctionWrong: 'nous attribue les responsabilités', correctionRight: 'nous attribuons les responsabilités', transformationSource: 'Je vais attribuer les responsabilités avant le début du travail.', transformationAnswer: 'Avant le début du travail, je vais attribuer les responsabilités.' },
  { unitId: 'a-11', topic: 'la procédure de classement', goal: 'expliquer comment réaliser la tâche', action: 'expliquer la méthode', imperative: 'expliquez la méthode', result: 'une tâche réalisée correctement', decision: 'expliquer la méthode avant de déléguer', correctionWrong: 'l’équipe expliquent la méthode', correctionRight: 'l’équipe explique la méthode', transformationSource: 'L’équipe explique la méthode à la nouvelle personne.', transformationAnswer: 'L’équipe montre la méthode à la nouvelle personne.' },
  { unitId: 'a-12', topic: 'la distribution des fournitures', goal: 'indiquer la répartition du matériel', action: 'répartir le matériel', imperative: 'répartissez le matériel', result: 'une quantité suffisante pour chacun', decision: 'répartir le matériel avant la livraison', correctionWrong: 'nous répartit le matériel', correctionRight: 'nous répartissons le matériel', transformationSource: 'Nous répartissons le matériel entre les collègues.', transformationAnswer: 'Nous partageons le matériel entre les collègues.', reviewedDistractors: { bestResponse: ['Je vais compter le matériel.', 'Je vais vérifier le matériel.', 'Je vais commander le matériel.'], cloze: ['comptez le matériel', 'vérifiez le matériel', 'commandez le matériel'], reading: ['Elle doit compter le matériel.', 'Elle doit vérifier le matériel.', 'Elle doit commander le matériel.'], transformation: ['Le matériel n’est pas partagé entre les collègues.', 'Le matériel sera partagé entre les collègues.', 'Les collègues vérifient le matériel avant la livraison.'], scenario: ['Je vais compter le matériel avant la livraison.', 'Je vais vérifier le matériel avant la livraison.', 'Je vais commander le matériel avant la livraison.'] } },
  { unitId: 'a-13', topic: 'les habitudes de l’équipe', goal: 'parler d’une expérience passée', action: 'raconter une expérience passée', imperative: 'racontez une expérience passée', result: 'un contexte bien compris', decision: 'raconter une expérience passée avant de conclure', correctionWrong: 'les expériences est décrites avec précision', correctionRight: 'les expériences sont décrites avec précision', transformationSource: 'Elle raconte une expérience passée pour expliquer le contexte.', transformationAnswer: 'Une expérience passée est racontée pour expliquer le contexte.' },
  { unitId: 'a-14', topic: 'l’annonce d’une réunion', goal: 'informer les collègues d’une réunion', action: 'informer les collègues', imperative: 'informez les collègues', result: 'une équipe bien préparée', decision: 'informer les collègues avant la réunion', correctionWrong: 'la réunion sont annoncée à l’équipe', correctionRight: 'la réunion est annoncée à l’équipe', transformationSource: 'Nous informons les collègues de la réunion.', transformationAnswer: 'Les collègues sont informés de la réunion.' },
  { unitId: 'a-15', topic: 'une demande de soutien', goal: 'obtenir le soutien nécessaire', action: 'formuler la demande', imperative: 'formulez la demande', result: 'une réponse utile', decision: 'formuler la demande avant d’attendre une réponse', correctionWrong: 'les demandes doit être formulées clairement', correctionRight: 'les demandes doivent être formulées clairement', transformationSource: 'Je formule la demande pour obtenir du soutien.', transformationAnswer: 'La demande est formulée pour obtenir du soutien.' },
  { unitId: 'a-16', topic: 'une offre d’aide', goal: 'faire une offre d’aide', action: 'proposer mon aide', narrativeAction: 'proposer de l’aide', imperative: 'proposez votre aide', result: 'une collaboration efficace', decision: 'proposer mon aide avant de repartir', correctionWrong: 'son aide sont proposée à l’équipe', correctionRight: 'son aide est proposée à l’équipe', transformationSource: 'Je propose mon aide à l’équipe.', transformationAnswer: 'Mon aide est proposée à l’équipe.' },
  { unitId: 'a-17', topic: 'la disponibilité de la salle', goal: 'confirmer la disponibilité de la salle', action: 'confirmer la disponibilité', imperative: 'confirmez la disponibilité', result: 'une réunion bien organisée', decision: 'confirmer la disponibilité avant de réserver', correctionWrong: 'la disponibilité de la salle sont confirmée', correctionRight: 'la disponibilité de la salle est confirmée', transformationSource: 'Nous confirmons la disponibilité de la salle.', transformationAnswer: 'La disponibilité de la salle est confirmée.' },
  { unitId: 'a-18', topic: 'les préférences de l’équipe', goal: 'exprimer ses goûts et préférences', action: 'exprimer mes préférences', narrativeAction: 'exprimer ses préférences', imperative: 'exprimez vos préférences', result: 'un choix partagé', decision: 'exprimer mes préférences avant de choisir', correctionWrong: 'les préférences est prises en compte', correctionRight: 'les préférences sont prises en compte', transformationSource: 'Je vais exprimer mes préférences avant de choisir.', transformationAnswer: 'Mes préférences seront exprimées avant le choix.' },
  { unitId: 'a-19', topic: 'la qualité d’un rapport', goal: 'évaluer la qualité du rapport', action: 'évaluer le rapport', imperative: 'évaluez le rapport', result: 'une recommandation fondée', decision: 'évaluer le rapport avant de recommander une option', correctionWrong: 'la qualité du rapport sont évaluée', correctionRight: 'la qualité du rapport est évaluée', transformationSource: 'L’équipe évalue la qualité du rapport.', transformationAnswer: 'La qualité du rapport est évaluée par l’équipe.' },
  { unitId: 'a-20', topic: 'les qualités d’un collègue', goal: 'évaluer les qualités d’un collègue', action: 'décrire les qualités du collègue', imperative: 'décrivez les qualités du collègue', result: 'une évaluation nuancée', decision: 'décrire les qualités du collègue avec précision', correctionWrong: 'les qualités du collègue est décrites', correctionRight: 'les qualités du collègue sont décrites', transformationSource: 'Nous décrivons les qualités du collègue avec précision.', transformationAnswer: 'Les qualités du collègue sont décrites avec précision.' },
  { unitId: 'a-21', topic: 'les règles de sécurité', goal: 's’informer sur les règles de sécurité', action: 'vérifier la conformité', imperative: 'vérifiez la conformité', result: 'un dossier conforme', decision: 'vérifier la conformité avant de signer', correctionWrong: 'la conformité doit être vérifiées', correctionRight: 'la conformité doit être vérifiée', transformationSource: 'Il faut vérifier la conformité avant de signer.', transformationAnswer: 'La conformité doit être vérifiée avant la signature.' },
  { unitId: 'a-22', topic: 'le calendrier de livraison', goal: 'préciser le moment de la livraison', action: 'préciser le délai', imperative: 'précisez le délai', result: 'une échéance réaliste', decision: 'préciser le délai avant de promettre une date', correctionWrong: 'le délai sont précisé avant l’envoi', correctionRight: 'le délai est précisé avant l’envoi', transformationSource: 'Nous précisons le délai avant de promettre une date.', transformationAnswer: 'Le délai est précisé avant qu’une date soit promise.' },
  { unitId: 'a-23', topic: 'les conditions du projet', goal: 'préciser les conditions du projet', action: 'définir les conditions', imperative: 'définissez les conditions', result: 'un projet réalisable', decision: 'définir les conditions avant de lancer le projet', correctionWrong: 'les conditions est définies avec soin', correctionRight: 'les conditions sont définies avec soin', transformationSource: 'L’équipe définit les conditions avant le lancement.', transformationAnswer: 'Les conditions sont définies avant le lancement.' },
  { unitId: 'a-24', topic: 'la succession des événements', goal: 'situer un événement par rapport à un autre', action: 'comparer les étapes', imperative: 'comparez les étapes', result: 'une relation temporelle claire', decision: 'comparer les étapes avant de rédiger le résumé', correctionWrong: 'les étapes doit être comparées', correctionRight: 'les étapes doivent être comparées', transformationSource: 'Nous comparons les étapes pour situer les événements.', transformationAnswer: 'Les étapes sont comparées pour situer les événements.' },
  { unitId: 'a-25', topic: 'les étapes du processus', goal: 'indiquer les étapes du processus', action: 'décrire la séquence', imperative: 'décrivez la séquence', result: 'une procédure facile à suivre', decision: 'décrire la séquence avant de former l’équipe', correctionWrong: 'la séquence sont décrite clairement', correctionRight: 'la séquence est décrite clairement', transformationSource: 'L’équipe décrit la séquence du processus.', transformationAnswer: 'La séquence du processus est décrite par l’équipe.' },
  { unitId: 'a-26', topic: 'le déplacement vers le client', goal: 'décrire un déplacement professionnel', action: 'organiser le trajet', imperative: 'organisez le trajet', result: 'une visite bien préparée', decision: 'organiser le trajet avant la mission', correctionWrong: 'le trajet sont organisé à l’avance', correctionRight: 'le trajet est organisé à l’avance', transformationSource: 'Nous organisons le trajet avant la mission.', transformationAnswer: 'Le trajet est organisé avant la mission.' },
  { unitId: 'a-27', topic: 'la manipulation du matériel', goal: 'décrire les opérations de la tâche', action: 'déplacer les boîtes', imperative: 'déplacez les boîtes', result: 'un espace dégagé', decision: 'déplacer les boîtes avant l’inspection', correctionWrong: 'les boîtes doit être déplacées', correctionRight: 'les boîtes doivent être déplacées', transformationSource: 'L’équipe déplace les boîtes avant l’inspection.', transformationAnswer: 'Les boîtes sont déplacées avant l’inspection.' },
  { unitId: 'a-28', topic: 'l’importance d’une directive', goal: 'préciser l’importance de la directive', action: 'expliquer la priorité', imperative: 'expliquez la priorité', result: 'une consigne respectée', decision: 'expliquer la priorité avant de donner la consigne', correctionWrong: 'la priorité sont expliquée à l’équipe', correctionRight: 'la priorité est expliquée à l’équipe', transformationSource: 'Le responsable explique la priorité à l’équipe.', transformationAnswer: 'La priorité est expliquée à l’équipe par le responsable.' },
  { unitId: 'a-29', topic: 'les compétences de l’équipe', goal: 'évaluer les compétences de l’équipe', action: 'décrire les compétences', imperative: 'décrivez les compétences', result: 'une affectation adaptée', decision: 'décrire les compétences avant de répartir le travail', correctionWrong: 'les compétences est décrites pour l’affectation', correctionRight: 'les compétences sont décrites pour l’affectation', transformationSource: 'Nous décrivons les compétences avant l’affectation.', transformationAnswer: 'Les compétences sont décrites avant l’affectation.' },
  { unitId: 'a-30', topic: 'l’accès au dossier', goal: 'indiquer ce qui est permis', action: 'autoriser l’accès', imperative: 'autorisez l’accès', result: 'une consultation sécurisée', decision: 'autoriser l’accès après la vérification', correctionWrong: 'l’accès sont autorisé après contrôle', correctionRight: 'l’accès est autorisé après contrôle', transformationSource: 'Le responsable autorise l’accès après la vérification.', transformationAnswer: 'L’accès est autorisé après la vérification.' },
  { unitId: 'a-31', topic: 'les objectifs de carrière', goal: 'exprimer un souhait professionnel', action: 'exprimer mes souhaits', narrativeAction: 'exprimer ses souhaits', imperative: 'exprimez vos souhaits', result: 'un projet professionnel clair', decision: 'exprimer mes souhaits avant de choisir une formation', correctionWrong: 'les souhaits doit être entendus', correctionRight: 'les souhaits doivent être entendus', transformationSource: 'Je vais exprimer mes souhaits avant de choisir une formation.', transformationAnswer: 'Mes souhaits seront exprimés avant le choix d’une formation.' },
  { unitId: 'a-32', topic: 'les conditions de réussite', goal: 'formuler une condition de réussite', action: 'préciser les conditions', imperative: 'précisez les conditions', result: 'un plan réaliste', decision: 'préciser les conditions avant de commencer', correctionWrong: 'les conditions est précisées avant le départ', correctionRight: 'les conditions sont précisées avant le départ', transformationSource: 'Nous précisons les conditions avant de commencer.', transformationAnswer: 'Les conditions sont précisées avant le début.' },
]

type ReviewedChoices = NonNullable<UnitPackSeed['reviewedDistractors']>

const reviewedDistractorsByUnitId: Record<string, ReviewedChoices> = {
  'a-01': {
    bestResponse: ['Je vais présenter l’équipe à la nouvelle collègue.', 'Je vais présenter la nouvelle collègue après la réunion.', 'Je vais annuler sa présentation avant la réunion.'],
    cloze: ['accueillez la nouvelle collègue', 'invitez la nouvelle collègue', 'présentez l’équipe'],
    reading: ['Elle doit présenter l’équipe à la nouvelle collègue.', 'Elle doit présenter la nouvelle collègue après la réunion.', 'Elle doit annuler sa présentation avant la réunion.'],
    transformation: ['La nouvelle collègue présente l’équipe à tout le service.', 'L’équipe présentera la nouvelle collègue à tout le service.', 'L’équipe ne présente pas la nouvelle collègue à tout le service.'],
    scenario: ['Je vais présenter l’équipe à la nouvelle collègue avant la réunion.', 'Je vais présenter la nouvelle collègue après la réunion.', 'Je vais annuler sa présentation avant la réunion.'],
  },
  'a-02': {
    bestResponse: ['Je vais archiver les documents.', 'Je vais numériser les documents.', 'Je vais envoyer les documents aux collègues.'],
    cloze: ['archivez les documents', 'numérisez les documents', 'envoyez les documents'],
    reading: ['Elle doit archiver les documents.', 'Elle doit numériser les documents.', 'Elle doit envoyer les documents aux collègues.'],
    transformation: ['Les documents sont imprimés pour être retrouvés facilement.', 'Nous classerons les documents pour les retrouver facilement.', 'Nous classons les dossiers pour les retrouver facilement.'],
    scenario: ['Je vais archiver les documents avant la réunion.', 'Je vais numériser les documents avant la réunion.', 'Je vais envoyer les documents avant la réunion.'],
  },
  'a-03': {
    bestResponse: ['Je vais contacter le service responsable.', 'Je vais transférer la demande au service responsable.', 'Je vais attendre la réponse du service responsable.'],
    cloze: ['contactez le service responsable', 'appelez le service responsable', 'prévenez le service responsable'],
    reading: ['Elle doit contacter le service responsable.', 'Elle doit appeler le service responsable.', 'Elle doit attendre la réponse du service responsable.'],
    transformation: ['Le service responsable est contacté par l’équipe.', 'L’équipe indique le service demandeur.', 'L’équipe indiquera le service responsable demain.'],
    scenario: ['Je vais contacter le service responsable avant de continuer.', 'Je vais appeler le service responsable avant de continuer.', 'Je vais attendre la réponse du service responsable avant de continuer.'],
  },
  'a-04': {
    bestResponse: ['Je vais compter les fournitures.', 'Je vais distribuer les fournitures.', 'Je vais remplacer les fournitures.'],
    cloze: ['comptez les fournitures', 'distribuez les fournitures', 'rangez les fournitures'],
    reading: ['Elle doit compter les fournitures.', 'Elle doit distribuer les fournitures.', 'Elle doit ranger les fournitures.'],
    transformation: ['L’équipe vérifie où sont les fournitures avant de les partager.', 'L’équipe partage les fournitures avant de vérifier à qui elles appartiennent.', 'L’équipe vérifie à qui appartient le bureau avant de le déplacer.'],
    scenario: ['Je vais distribuer les fournitures avant de vérifier à qui elles appartiennent.', 'Je vais compter les fournitures avant de vérifier à qui elles appartiennent.', 'Je vais remplacer les fournitures avant de vérifier à qui elles appartiennent.'],
  },
  'a-05': {
    bestResponse: ['Je vais indiquer où se trouve le bureau.', 'Je vais visiter les salles après avoir donné les indications.', 'Je vais réserver une autre salle.'],
    cloze: ['indiquez où se trouve le bureau', 'visitez les salles après avoir donné les indications', 'réservez une autre salle'],
    reading: ['Elle doit indiquer où se trouve le bureau.', 'Elle doit visiter les salles après avoir donné les indications.', 'Elle doit réserver une autre salle.'],
    transformation: ['Le guide indique où se trouve le bureau.', 'Le guide indiquera où se trouvent les salles.', 'Les salles indiquent le chemin au guide.'],
    scenario: ['Je vais indiquer où se trouve le bureau avant le départ.', 'Je vais visiter les salles après avoir donné les indications.', 'Je vais réserver une autre salle avant le départ.'],
  },
  'a-06': {
    bestResponse: ['Je vais compter les boîtes.', 'Je vais vérifier les dossiers après l’inventaire.', 'Je vais commander les dossiers avant de les compter.'],
    cloze: ['comptez les boîtes', 'vérifiez les dossiers après l’inventaire', 'commandez les dossiers avant de les compter'],
    reading: ['Elle doit compter les boîtes.', 'Elle doit vérifier les dossiers après l’inventaire.', 'Elle doit commander les dossiers avant de les compter.'],
    transformation: ['Nous vérifions les dossiers avant l’inventaire.', 'Nous comptions les dossiers avant l’inventaire.', 'Nous comptons les dossiers après l’inventaire.'],
    scenario: ['Je vais compter les boîtes avant de commander.', 'Je vais vérifier les dossiers après l’inventaire.', 'Je vais commander les dossiers avant de les compter.'],
  },
  'a-07': {
    bestResponse: ['Je vais demander le plan de la salle.', 'Je vais préparer la salle.', 'Je vais réserver la salle.'],
    cloze: ['demandez le plan de la salle', 'préparez la salle', 'réservez la salle'],
    reading: ['Elle doit demander le plan de la salle.', 'Elle doit préparer la salle.', 'Elle doit réserver la salle.'],
    transformation: ['Vous devez demander le trajet jusqu’à la salle.', 'Vous devez décrire le trajet depuis la salle.', 'Il faut réserver la salle avant la visite.'],
    scenario: ['Je vais demander le plan avant la visite.', 'Je vais préparer la salle avant la visite.', 'Je vais réserver la salle avant la visite.'],
  },
  'a-08': {
    bestResponse: ['Je vais noter les tâches du projet.', 'Je vais annoncer les dates après la planification.', 'Je vais modifier les dates sans vérifier les échéances.'],
    cloze: ['notez les tâches du projet', 'annoncez les dates après la planification', 'modifiez les dates sans vérifier les échéances'],
    reading: ['Elle doit noter les tâches du projet.', 'Elle doit annoncer les dates après la planification.', 'Elle doit modifier les dates sans vérifier les échéances.'],
    transformation: ['Le calendrier présente les tâches du projet.', 'Le calendrier présentera les dates du projet.', 'Les dates présentent le calendrier du projet.'],
    scenario: ['Je vais noter les tâches du projet avant de planifier.', 'Je vais annoncer les dates après la planification.', 'Je vais modifier les dates sans vérifier les échéances.'],
  },
  'a-09': {
    bestResponse: ['Je vais analyser les événements.', 'Je vais résumer les événements.', 'Je vais raconter les événements.'],
    cloze: ['analysez les événements', 'résumez les événements', 'racontez les événements'],
    reading: ['Elle doit analyser les événements.', 'Elle doit résumer les événements.', 'Elle doit raconter les événements.'],
    transformation: ['Nous analysons les événements dans le temps.', 'Nous situerons les événements dans le temps.', 'Nous situons les événements sans ordre précis.'],
    scenario: ['Je vais classer les événements avant de résumer.', 'Je vais raconter les événements avant de les situer.', 'Je vais résumer les événements avant de les situer.'],
  },
  'a-10': {
    bestResponse: ['Je vais attribuer les responsabilités après le début du travail.', 'Je vais expliquer les responsabilités sans les attribuer.', 'Je vais vérifier les disponibilités après la répartition.'],
    cloze: ['attribuez les responsabilités après le début du travail', 'expliquez les responsabilités sans les attribuer', 'vérifiez les disponibilités après la répartition'],
    reading: ['Elle doit attribuer les responsabilités après le début du travail.', 'Elle doit expliquer les responsabilités sans les attribuer.', 'Elle doit vérifier les disponibilités après la répartition.'],
    transformation: ['Je vais attribuer les responsabilités après le début du travail.', 'Je vais expliquer les responsabilités avant le début du travail.', 'Nous allons attribuer les responsabilités avant le début du travail.'],
    scenario: ['Je vais attribuer les responsabilités après le début du travail.', 'Je vais expliquer les responsabilités sans les attribuer.', 'Je vais vérifier les disponibilités après la répartition.'],
  },
  'a-11': {
    bestResponse: ['Je vais préparer une démonstration.', 'Je vais pratiquer la tâche.', 'Je vais déléguer la tâche.'],
    cloze: ['préparez une démonstration', 'pratiquez la méthode', 'déléguez la tâche'],
    reading: ['Elle doit préparer une démonstration.', 'Elle doit pratiquer la tâche.', 'Elle doit déléguer la tâche.'],
    transformation: ['La nouvelle personne explique la méthode à l’équipe.', 'L’équipe expliquera la méthode à la nouvelle personne.', 'L’équipe explique la tâche à la nouvelle personne.'],
    scenario: ['Je vais préparer une démonstration avant de déléguer.', 'Je vais déléguer la tâche avant d’expliquer la méthode.', 'Je vais demander à la nouvelle personne de pratiquer avant d’expliquer la méthode.'],
  },
  'a-12': {
    bestResponse: ['Je vais compter le matériel.', 'Je vais vérifier le matériel.', 'Je vais commander le matériel.'],
    cloze: ['comptez le matériel', 'vérifiez le matériel', 'commandez le matériel'],
    reading: ['Elle doit compter le matériel.', 'Elle doit vérifier le matériel.', 'Elle doit commander le matériel.'],
    transformation: ['Le matériel est distribué à un seul collègue.', 'Nous vérifions le matériel pour les collègues.', 'Nous répartirons le matériel entre les collègues.'],
    scenario: ['Je vais compter le matériel avant la livraison.', 'Je vais vérifier le matériel avant la livraison.', 'Je vais commander le matériel avant de le répartir.'],
  },
  'a-13': {
    bestResponse: ['Je vais écouter une expérience passée.', 'Je vais raconter un projet futur.', 'Je vais parler des habitudes actuelles.'],
    cloze: ['écoutez une expérience passée', 'racontez un projet futur', 'parlez des habitudes actuelles'],
    reading: ['Elle doit écouter une expérience passée.', 'Elle doit raconter un projet futur.', 'Elle doit parler des habitudes actuelles.'],
    transformation: ['Elle raconte une expérience future pour expliquer le contexte.', 'Une collègue raconte une expérience passée pour expliquer le contexte.', 'Elle oublie une expérience passée au lieu d’expliquer le contexte.'],
    scenario: ['Je vais décrire une expérience passée avant de conclure.', 'Je vais parler des habitudes actuelles avant de conclure.', 'Je vais annoncer un projet futur avant de conclure.'],
  },
  'a-14': {
    bestResponse: ['Je vais confirmer la réunion.', 'Je vais annuler la réunion.', 'Je vais préparer la réunion.'],
    cloze: ['confirmez la réunion', 'annulez la réunion', 'préparez la réunion'],
    reading: ['Elle doit confirmer la réunion.', 'Elle doit annuler la réunion.', 'Elle doit préparer la réunion.'],
    transformation: ['Les collègues sont informés du projet.', 'Nous informerons les collègues de la réunion.', 'Les collègues informent l’équipe de la réunion.'],
    scenario: ['Je vais confirmer la réunion avant le rendez-vous.', 'Je vais préparer la réunion avant le rendez-vous.', 'Je vais annuler la réunion avant le rendez-vous.'],
  },
  'a-15': {
    bestResponse: ['Je vais expliquer le besoin.', 'Je vais attendre une réponse.', 'Je vais refuser le soutien.'],
    cloze: ['expliquez le besoin', 'attendez une réponse', 'refusez le soutien'],
    reading: ['Elle doit expliquer le besoin.', 'Elle doit attendre une réponse.', 'Elle doit refuser le soutien.'],
    transformation: ['La demande est formulée pour obtenir des informations.', 'La demande est reçue pour obtenir du soutien.', 'Je formule la demande après avoir reçu du soutien.'],
    scenario: ['Je vais expliquer le besoin avant d’attendre une réponse.', 'Je vais attendre une réponse avant de formuler la demande.', 'Je vais refuser le soutien avant de formuler la demande.'],
  },
  'a-16': {
    bestResponse: ['Je vais accepter l’aide de l’équipe.', 'Je vais demander de l’aide à l’équipe.', 'Je vais remercier l’équipe pour l’aide reçue.'],
    cloze: ['acceptez l’aide de l’équipe', 'demandez de l’aide à l’équipe', 'remerciez l’équipe pour son aide'],
    reading: ['Elle doit accepter l’aide de l’équipe.', 'Elle doit demander de l’aide à l’équipe.', 'Elle doit remercier l’équipe pour son aide.'],
    transformation: ['L’équipe me propose son aide.', 'Je proposerai mon aide à l’équipe.', 'Mon aide est refusée par l’équipe.'],
    scenario: ['Je vais accepter l’aide de l’équipe avant de repartir.', 'Je vais demander de l’aide à l’équipe avant de repartir.', 'Je vais remercier l’équipe pour son aide avant de repartir.'],
  },
  'a-17': {
    bestResponse: ['Je vais réserver la salle.', 'Je vais libérer la salle.', 'Je vais chercher une autre salle.'],
    cloze: ['réservez la salle', 'libérez la salle', 'cherchez une autre salle'],
    reading: ['Elle doit réserver la salle.', 'Elle doit libérer la salle.', 'Elle doit chercher une autre salle.'],
    transformation: ['Nous réservons la salle.', 'La disponibilité de la salle sera confirmée.', 'Nous confirmons la disponibilité du bureau.'],
    scenario: ['Je vais réserver la salle avant de confirmer sa disponibilité.', 'Je vais libérer la salle avant de la réserver.', 'Je vais chercher une autre salle avant de confirmer sa disponibilité.'],
  },
  'a-18': {
    bestResponse: ['Je vais écouter les préférences de l’équipe.', 'Je vais imposer mon choix.', 'Je vais comparer les options.'],
    cloze: ['écoutez les préférences de l’équipe', 'imposez votre choix', 'comparez les options'],
    reading: ['Elle doit écouter les préférences de l’équipe.', 'Elle doit imposer son choix.', 'Elle doit comparer les options.'],
    transformation: ['Je vais exprimer les préférences de l’équipe avant de choisir.', 'Mes préférences seront exprimées après mon choix.', 'Mes préférences seront ignorées avant que je choisisse.'],
    scenario: ['Je vais demander les préférences de l’équipe avant de choisir.', 'Je vais comparer les options avant de choisir.', 'Je vais imposer mon choix avant de choisir.'],
  },
  'a-19': {
    bestResponse: ['Je vais résumer le rapport.', 'Je vais corriger le rapport.', 'Je vais recommander une option.'],
    cloze: ['résumez le rapport', 'corrigez le rapport', 'recommandez une option'],
    reading: ['Elle doit résumer le rapport.', 'Elle doit corriger le rapport.', 'Elle doit recommander une option.'],
    transformation: ['L’équipe évalue la qualité de la présentation.', 'L’équipe évaluera la qualité du rapport.', 'La qualité du rapport est ignorée par l’équipe.'],
    scenario: ['Je vais résumer le rapport avant de recommander une option.', 'Je vais corriger le rapport avant de recommander une option.', 'Je vais recommander une option avant d’évaluer le rapport.'],
  },
  'a-20': {
    bestResponse: ['Je vais décrire les tâches du collègue.', 'Je vais féliciter le collègue.', 'Je vais demander une référence.'],
    cloze: ['décrivez les tâches du collègue', 'félicitez le collègue', 'demandez une référence'],
    reading: ['Elle doit décrire les tâches du collègue.', 'Elle doit féliciter le collègue.', 'Elle doit demander une référence.'],
    transformation: ['Les tâches du collègue sont décrites avec précision.', 'Nous décrirons les qualités du collègue avec précision.', 'Les qualités du collègue sont comparées avec précision.'],
    scenario: ['Je vais décrire les tâches du collègue avec précision.', 'Je vais demander une référence avec précision.', 'Je vais féliciter le collègue avec précision.'],
  },
  'a-21': {
    bestResponse: ['Je vais signer le dossier avant de vérifier la conformité.', 'Je vais vérifier la conformité après la signature.', 'Je vais consulter une autre procédure avant de signer.'],
    cloze: ['signez le dossier avant de vérifier la conformité', 'vérifiez la conformité après la signature', 'consultez une autre procédure avant de signer'],
    reading: ['Elle doit signer le dossier avant de vérifier la conformité.', 'Elle doit vérifier la conformité après la signature.', 'Elle doit consulter une autre procédure avant de signer.'],
    transformation: ['La conformité aux règles de sécurité doit être vérifiée après la signature.', 'Il faut respecter les règles de sécurité avant de signer.', 'La conformité aux règles de sécurité ne doit pas être vérifiée avant la signature.'],
    scenario: ['Je vais signer le dossier avant de vérifier la conformité.', 'Je vais vérifier la conformité après la signature.', 'Je vais consulter une autre procédure avant de signer.'],
  },
  'a-22': {
    bestResponse: ['Je vais demander une date.', 'Je vais promettre une date.', 'Je vais suivre la livraison.'],
    cloze: ['demandez une date', 'promettez une date', 'suivez la livraison'],
    reading: ['Elle doit demander une date.', 'Elle doit promettre une date.', 'Elle doit suivre la livraison.'],
    transformation: ['Le délai est confirmé avant l’envoi.', 'Nous préciserons le délai avant de promettre une date.', 'Le délai est précisé après l’envoi.'],
    scenario: ['Je vais demander une date avant de promettre un délai.', 'Je vais promettre une date avant de préciser le délai.', 'Je vais suivre la livraison avant de préciser le délai.'],
  },
  'a-23': {
    bestResponse: ['Je vais lancer le projet.', 'Je vais vérifier les ressources.', 'Je vais annoncer le projet.'],
    cloze: ['lancez le projet', 'vérifiez les ressources', 'annoncez le projet'],
    reading: ['Elle doit lancer le projet.', 'Elle doit vérifier les ressources.', 'Elle doit annoncer le projet.'],
    transformation: ['Les conditions sont définies après le lancement.', 'L’équipe définit le calendrier avant le lancement.', 'Les conditions ne sont pas définies avant le lancement.'],
    scenario: ['Je vais vérifier les ressources avant de lancer le projet.', 'Je vais lancer le projet avant de définir les conditions.', 'Je vais annoncer le projet avant de définir les conditions.'],
  },
  'a-24': {
    bestResponse: ['Je vais ordonner les étapes.', 'Je vais décrire les étapes.', 'Je vais résumer les événements.'],
    cloze: ['ordonnez les étapes', 'décrivez les étapes', 'résumez les événements'],
    reading: ['Elle doit ordonner les étapes.', 'Elle doit décrire les étapes.', 'Elle doit résumer les événements.'],
    transformation: ['Les étapes sont comparées après le résumé.', 'Nous comparons les résultats pour situer les événements.', 'Les étapes ne sont pas comparées pour situer les événements.'],
    scenario: ['Je vais ordonner les étapes avant de rédiger le résumé.', 'Je vais décrire les étapes avant de rédiger le résumé.', 'Je vais rédiger le résumé avant de comparer les étapes.'],
  },
  'a-25': {
    bestResponse: ['Je vais suivre la séquence.', 'Je vais modifier la séquence.', 'Je vais former l’équipe.'],
    cloze: ['suivez la séquence', 'modifiez la séquence', 'formez l’équipe'],
    reading: ['Elle doit suivre la séquence.', 'Elle doit modifier la séquence.', 'Elle doit former l’équipe.'],
    transformation: ['La séquence du projet est décrite par l’équipe.', 'L’équipe décrira la séquence du processus.', 'La séquence du processus n’est pas décrite par l’équipe.'],
    scenario: ['Je vais suivre la séquence avant de former l’équipe.', 'Je vais modifier la séquence avant de former l’équipe.', 'Je vais former l’équipe avant de décrire la séquence.'],
  },
  'a-26': {
    bestResponse: ['Je vais réserver l’hôtel.', 'Je vais confirmer le rendez-vous.', 'Je vais annuler la mission.'],
    cloze: ['réservez l’hôtel', 'confirmez le rendez-vous', 'annulez la mission'],
    reading: ['Elle doit réserver l’hôtel.', 'Elle doit confirmer le rendez-vous.', 'Elle doit annuler la mission.'],
    transformation: ['Le trajet est organisé après la mission.', 'Nous organisons la visite avant la mission.', 'Le trajet n’est pas organisé avant la mission.'],
    scenario: ['Je vais réserver l’hôtel avant la mission.', 'Je vais confirmer le rendez-vous avant la mission.', 'Je vais annuler la mission avant de préparer le trajet.'],
  },
  'a-27': {
    bestResponse: ['Je vais inspecter les boîtes.', 'Je vais emballer les boîtes.', 'Je vais étiqueter les boîtes.'],
    cloze: ['inspectez les boîtes', 'emballez les boîtes', 'étiquetez les boîtes'],
    reading: ['Elle doit inspecter les boîtes.', 'Elle doit emballer les boîtes.', 'Elle doit étiqueter les boîtes.'],
    transformation: ['Les boîtes sont déplacées après l’inspection.', 'L’équipe déplace les étagères avant l’inspection.', 'Les boîtes ne sont pas déplacées avant l’inspection.'],
    scenario: ['Je vais inspecter les boîtes avant de les déplacer.', 'Je vais emballer les boîtes avant de les déplacer.', 'Je vais étiqueter les boîtes avant de les déplacer.'],
  },
  'a-28': {
    bestResponse: ['Je vais vérifier la priorité.', 'Je vais donner la consigne.', 'Je vais ignorer la priorité.'],
    cloze: ['vérifiez la priorité', 'donnez la consigne', 'ignorez la priorité'],
    reading: ['Elle doit vérifier la priorité.', 'Elle doit donner la consigne.', 'Elle doit ignorer la priorité.'],
    transformation: ['La priorité est expliquée à la direction.', 'Le responsable expliquera la priorité à l’équipe.', 'Le responsable cache la priorité à l’équipe.'],
    scenario: ['Je vais vérifier la priorité avant de donner la consigne.', 'Je vais donner la consigne avant d’expliquer la priorité.', 'Je vais ignorer la priorité avant de donner la consigne.'],
  },
  'a-29': {
    bestResponse: ['Je vais demander les disponibilités de l’équipe.', 'Je vais répartir le travail.', 'Je vais former l’équipe.'],
    cloze: ['demandez les disponibilités de l’équipe', 'répartissez le travail', 'formez l’équipe'],
    reading: ['Elle doit demander les disponibilités de l’équipe.', 'Elle doit répartir le travail.', 'Elle doit former l’équipe.'],
    transformation: ['Les compétences sont évaluées après l’affectation.', 'Nous décrivons les besoins avant l’affectation.', 'Les compétences ne sont pas évaluées avant l’affectation.'],
    scenario: ['Je vais demander les disponibilités de l’équipe avant de répartir le travail.', 'Je vais répartir le travail avant d’évaluer les compétences.', 'Je vais former l’équipe avant d’évaluer les compétences.'],
  },
  'a-30': {
    bestResponse: ['Je vais vérifier l’identité.', 'Je vais refuser l’accès.', 'Je vais ouvrir le dossier.'],
    cloze: ['vérifiez l’identité', 'refusez l’accès', 'ouvrez le dossier'],
    reading: ['Elle doit vérifier l’identité.', 'Elle doit refuser l’accès.', 'Elle doit ouvrir le dossier.'],
    transformation: ['L’accès est autorisé avant la vérification.', 'Le responsable autorise l’accès après la réservation.', 'L’accès n’est pas autorisé après la vérification.'],
    scenario: ['Je vais vérifier l’identité avant d’autoriser l’accès.', 'Je vais refuser l’accès après la vérification.', 'Je vais ouvrir le dossier avant d’autoriser l’accès.'],
  },
  'a-31': {
    bestResponse: ['Je vais choisir une formation.', 'Je vais demander un conseil professionnel.', 'Je vais abandonner mon projet professionnel.'],
    cloze: ['choisissez une formation', 'demandez un conseil professionnel', 'abandonnez votre projet professionnel'],
    reading: ['Elle doit choisir une formation.', 'Elle doit demander un conseil professionnel.', 'Elle doit abandonner son projet professionnel.'],
    transformation: ['Je vais exprimer mes souhaits après avoir choisi une formation.', 'Mes souhaits seront imposés avant le choix d’une formation.', 'Mes souhaits ne seront pas exprimés avant le choix d’une formation.'],
    scenario: ['Je vais demander un conseil professionnel avant de choisir une formation.', 'Je vais choisir une formation avant d’exprimer mes souhaits.', 'Je vais abandonner mon projet professionnel avant d’exprimer mes souhaits.'],
  },
  'a-32': {
    bestResponse: ['Je vais commencer le projet.', 'Je vais vérifier les ressources.', 'Je vais annoncer le plan.'],
    cloze: ['commencez le projet', 'vérifiez les ressources', 'annoncez le plan'],
    reading: ['Elle doit commencer le projet.', 'Elle doit vérifier les ressources.', 'Elle doit annoncer le plan.'],
    transformation: ['Les conditions sont précisées après le début.', 'Nous précisons les objectifs avant de commencer.', 'Les conditions ne sont pas précisées avant le début.'],
    scenario: ['Je vais vérifier les ressources avant de commencer.', 'Je vais commencer le projet avant de préciser les conditions.', 'Je vais annoncer le plan avant de préciser les conditions.'],
  },
}

for (const seed of unitPacksA) {
  seed.reviewedDistractors = reviewedDistractorsByUnitId[seed.unitId]
}

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-01')!, { reviewedDistractors: { ...reviewedDistractorsByUnitId['a-01'], cloze: ['accueillez', 'invitez', 'appelez'] } })
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-02')!, { reviewedDistractors: { ...reviewedDistractorsByUnitId['a-02'], cloze: ['archivez', 'numérisez', 'envoyez'] } })
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-03')!, { reviewedDistractors: { ...reviewedDistractorsByUnitId['a-03'], cloze: ['contactez', 'appelez', 'prévenez'] } })
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-04')!, { reviewedDistractors: { ...reviewedDistractorsByUnitId['a-04'], cloze: ['comptez', 'distribuez', 'rangez'] } })

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-04')!, {
  goal: 'vérifier à qui appartiennent les fournitures partagées',
  action: 'vérifier à qui appartiennent les fournitures',
  imperative: 'vérifiez à qui appartiennent les fournitures',
  decision: 'vérifier à qui appartiennent les fournitures avant de les distribuer',
  transformationSource: 'L’équipe vérifie à qui appartiennent les fournitures avant de les partager.',
  transformationAnswer: 'Avant de partager les fournitures, l’équipe vérifie à qui elles appartiennent.',
  scaffold: {
    context: 'The team is about to share supplies. Check who they belong to first.',
    clozePrompt: '___ à qui appartiennent les fournitures.',
    clozeAnswer: 'vérifiez',
    clozeDistractors: ['comptez', 'distribuez', 'rangez'],
    transformationSource: 'L’équipe vérifie à qui appartiennent les fournitures.',
    transformationAnswer: 'Les fournitures sont vérifiées par l’équipe pour déterminer à qui elles appartiennent.',
  },
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-03')!, {
  goal: 'indiquer quel service est responsable',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-21')!, {
  goal: 'vérifier la conformité aux règles de sécurité',
  action: 'vérifier la conformité aux règles de sécurité',
  imperative: 'vérifiez la conformité aux règles de sécurité',
  decision: 'vérifier la conformité aux règles de sécurité avant de signer',
  correctionWrong: 'la conformité aux règles de sécurité doit être vérifiées',
  correctionRight: 'la conformité aux règles de sécurité doit être vérifiée',
  transformationSource: 'Il faut vérifier la conformité aux règles de sécurité avant de signer.',
  transformationAnswer: 'La conformité aux règles de sécurité doit être vérifiée avant la signature.',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-29')!, {
  action: 'évaluer les compétences',
  imperative: 'évaluez les compétences',
  decision: 'évaluer les compétences avant de répartir le travail',
  correctionWrong: 'les compétences est évaluées pour l’affectation',
  correctionRight: 'les compétences sont évaluées pour l’affectation',
  transformationSource: 'Nous évaluons les compétences avant l’affectation.',
  transformationAnswer: 'Les compétences sont évaluées avant l’affectation.',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-11')!, {
  transformationAnswer: 'La méthode est expliquée par l’équipe à la nouvelle personne.',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-16')!, {
  correctionWrong: 'mon aide sont proposée à l’équipe',
  correctionRight: 'mon aide est proposée à l’équipe',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-18')!, {
  transformationAnswer: 'Mes préférences seront exprimées avant que je choisisse.',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-31')!, {
  transformationAnswer: 'Mes souhaits seront exprimés avant que je choisisse une formation.',
})

Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-02')!, {
  transformationAnswer: 'Pour les retrouver facilement, nous classons les documents.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-07')!, {
  transformationAnswer: 'Vous devez décrire le trajet jusqu’à la salle.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-13')!, {
  transformationAnswer: 'Pour expliquer le contexte, elle raconte une expérience passée.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-14')!, {
  transformationAnswer: 'Pour préparer les collègues, nous les informons de la réunion.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-15')!, {
  transformationAnswer: 'Pour obtenir du soutien, je formule la demande.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-17')!, {
  transformationAnswer: 'Avant de réserver, nous confirmons la disponibilité de la salle.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-19')!, {
  transformationAnswer: 'Pour fonder la recommandation, l’équipe évalue la qualité du rapport.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-20')!, {
  transformationAnswer: 'Pour nuancer l’évaluation, nous décrivons les qualités du collègue avec précision.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-22')!, {
  transformationAnswer: 'Avant de promettre une date, nous précisons le délai.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-23')!, {
  transformationAnswer: 'Avant le lancement, l’équipe définit les conditions.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-24')!, {
  transformationAnswer: 'Pour situer les événements, nous comparons les étapes.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-26')!, {
  transformationAnswer: 'Avant la mission, nous organisons le trajet.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-27')!, {
  transformationAnswer: 'Avant l’inspection, l’équipe déplace les boîtes.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-29')!, {
  transformationAnswer: 'Avant l’affectation, nous évaluons les compétences.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-30')!, {
  transformationAnswer: 'Après la vérification, le responsable autorise l’accès.',
})
Object.assign(unitPacksA.find((seed) => seed.unitId === 'a-32')!, {
  transformationAnswer: 'Avant le début, nous précisons les conditions.',
})
