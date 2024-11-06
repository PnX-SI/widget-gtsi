const labels ={worldRedList: "Liste Rouge Mondiale",
    europeanRedList: "Liste Rouge europeenne",
    nationalRedList: "Liste Rouge nationale",
    localRedList: "Liste Rouge locale",
    bonnConvention: "Convention de Bonn",
    bernConvention: "Convention de Bern",
    barcelonaConvention: "Convention de Barcelona",
    osparConvention: "Convention d'Ospar",
    hffDirective: "Directive Habitats Faune Flore",
    birdDirective: "Directive Oiseau",
    nationalProtection: "Protection nationale",
    regionalProtection: "Protection regionale",
    departementalProtection: "Protection départementale",
    nationalActionPlan: "Plan d'Action Nationale",
    scapNationale: "Stratégie nationale pour les aires protégées",
    scapRegionale: "Stratégie régionale pour les aires protégées",
    sensibilite: "Sensibilité",
    biogeoStatus: "Status biogeo",
    reglementation: "Réglementation",
    invasiveReglementation: "Réglementation invasive",
    prioriteActionPubliqueNationale: "Priorité d'action publique nationale",}
async function getStatusForATaxon(taxonData) {
    const reponse = await fetch(`https://taxref.mnhn.fr/api/taxa/${taxonData.cd_ref}/status/columns`);
    const status = await reponse.json();
    return status._embedded
}
