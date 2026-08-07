const messagesFR = {
    fr: {
        title: 'BAM - Biodiversité autour de moi',
        discover: {
            title: 'Explore',
        },
        subtitle: 'Rechercher des espèces autour de moi',
        howto: 'Comment ça marche ?',
        introTitle: "Qu'est-ce que Biodiversité autour de moi ?",

        intro: `*Biodiversité autour de moi* est un widget dédié à **l'exploration des espèces 🔍** !

Cette interface vous permet de **rechercher les espèces observées dans une zone géographique spécifique 🌍**.

**Utilisez la carte interactive 🗺️** pour sélectionner la zone où vous souhaitez effectuer votre recherche.

La **liste des espèces 🥝🍃** trouvées dans la zone sélectionnée s'affichera à côté de la carte 📋.

Vous pouvez également **partager vos résultats 📤** pour collaborer avec d'autres utilisateurs.
`,
        parameters: 'Paramètres',
        nbDisplayedSpecies: "Nombre d'espèces affichées",
        filters: 'Filtres',
        showFilters: 'Afficher les filtres',
        RefreshFilters: 'Rafraîchir les paramètres',
        IndicateGeoJSONUrl: 'Indiquer une URL vers un GeoJSON',
        IndicateDetailTemplateUrl: 'https://<urlFicheDeTaxon>/',
        TaxonListModeSelection: "Mode d'affichage des espèces",
        widgetTypeSelection: "Mode d'affichage du widget",
        UseGeoJSONSource: 'Utiliser une source GeoJSON',
        UseCustomDetailPage:
            'Modifier la redirection du bouton "En Savoir Plus" ',
        filtersTitle: 'Filtres',
        filtersOnList: 'Afficher les filtres sur la liste',
        primaryColor: 'Changer la couleur primaire',
        mapEditable: ' Zone de recherche éditable',
        bufferSize: 'Taille du buffer (en mètre)',
        dateMin: 'Date min',
        dateMax: 'Date max',
        search: 'Rechercher',
        reset: 'Réinitialiser',
        limit: 'Limite',
        nbPages: 'Nombre de pages',
        searchResults: 'Résultats de la recherche',
        noResults: 'Aucun résultat',
        previousPage: 'Précedent',
        nextPage: 'Suivant',
        loading: 'Chargement en cours',
        loadingError: 'Une erreur est survenue lors du chargement',
        noObservations: 'Aucune observation trouvée',
        noSpeciesObserved: 'Aucune espèce observée dans cette zone !',
        emptySearch: 'Aucune espèce ne correspond à votre recherche',
        noGeometry: 'Aucune géometrie trouvée',
        error404: {
            title: 'Page introuvable',
            subtitle: "La page que vous recherchez n'existe pas",
        },
        browserIntegration: 'Intégrer le widget dans votre site',
        drawGeometry: 'Dessiner une zone pour afficher les espèces',
        size: {
            width: 'Largeur',
            height: 'Hauteur',
        },
        embed: 'Code HTML',
        typeWidget: {
            title: 'Type de widget',
            default: 'Carte et liste',
            list: "Liste d'espèces",
            config: 'Configurateur',
        },
        sortBy: 'Trier par',
        sortOrder: 'Ordre',
        copy: 'Copier',
        copied: 'Copié',
        share: 'Partager',
        shareLink: 'Partager un lien',
        shareDiscover: 'Partager votre recherche',
        source: {
            source: 'Source',
            title: 'Source de données',
            select: 'Sélectionner une source',
            modify: 'Modifier la source de données des observations',
            gbifWarning:
                "Le nombre d'observations et leurs dates sont basés sur une agrégation des dernières observations effectuées dans la zone sélectionnée et limitée à {nbObs} maximum.",
            howToContribute: 'Comment contribuer ?',
        },
        gbif: {
            apiEndpoint: "Adresse de l'API du GBIF",
            howToContribute:
                "Si vous souhaitez contribuer aux données ouvertes d'observations de biodiversité agrégées dans le GBIF, vous pouvez utiliser des plateformes collaboratives comme <a target='_blank' href='https://www.inaturalist.org/'>iNaturalist</a>, <a target='_blank' href='https://plantnet.org/'>Pl{'@'}ntNet</a> ou <a target='_blank' href='https://observation.org/'>Observation.org</a>.",
            progress: {
                fetching: 'Récupération des observations...',
                processing: 'Traitement des données...',
                enriching: 'Récupération des dernières infos sur les taxons...',
                finalizing: 'Finalisation...',
            },
        },
        geonature: {
            api_endpoint: "Adresse de l'API de GeoNature",
            id_export: "Identifiant de l'export",
            source_name: 'Nom de la source',
        },
        desc: 'Décroissant',
        asc: 'Croissant',
        media: {
            source: 'Source de médias',
            image: "Source d'image",
            sound: 'Source de son',
            select: 'Sélectionner une source de média',
            linkToOrigin: 'Source',
            licenseUnder: 'Sous licence ',
        },
        taxon: {
            scientificName: 'Nom scientifique',
            vernacularName: 'Nom vernaculaire',
            nbObservations: "Nombre d'observations",
            lastSeenDate: 'Date de la dernière observation',
            lastSeen: 'Vu dernièrement le',
            observed: 'Observé',
            times: 'fois',
            taxonFilter: 'Filtre par espèce',
            classFilter: 'Filtrer par classe',
            learnMore: 'En savoir plus',
            class: "Classe d'espèce",
            taxonFound: 'espèces trouvées',
        },
        mode: {
            galleryMode: 'Galerie',
            detailedList: 'Détaillé',
            hybrid: 'Hybride',
            isTaxonListHybrid: "Mode de la liste d'espèce modifiable",
        },
        widgetType: {
            list: 'Liste',
            map: 'Carte',
            default: 'Carte Liste',
        },
        numberOfTaxonPerLine: "Nombre d'espèces par ligne",
        widgetPreview: 'Prévisualisation',
        taxonsClass: {
            Animalia: {
                Mammalia: 'Mammifères',
                Aves: 'Oiseaux',
                Reptilia: 'Reptiles',
                Amphibia: 'Amphibiens',
                Insecta: 'Insectes',
                Arachnida: 'Arachnides',
                Gastropoda: 'Gastéropodes',
                Bivalvia: 'Bivalves',
            },
            Plantae: {
                Magnoliopsida: 'Magnoliopsida',
                Liliopsida: 'Monocotylédone',
                Pinopsida: 'Conifères',
            },
        },
        Animalia: 'Animal',
        Plantae: 'Plante',

        or: 'ou',
        in: 'dans',
        near: 'près de',
        searchAreaNear: 'Zone de recherche près de',
        datasetList: 'jeux de données associés',
        observation: 'observation',
        observations: 'observations',
        searchPlace: {
            loadingText: 'Recherche en cours',
            placeholder: 'Rechercher un lieu',
            errorText: 'Erreur lors de la recherche',
            noResultsText: 'Aucun résultat trouvé',
        },
        searchTaxon: 'Recherche une espèce',
        globalConservationStatus: 'Statut de conservation mondial',
        IUCNStatus: {
            //based on https://uicn.fr/wp-content/uploads/2016/06/UICN_2012_Categories_et_criteres_Liste_rouge.pdf
            // Some translation are not available on the official document
            NA: 'Non Applicable',
            NE: 'Non évalué',
            DD: 'Données insuffisante',
            LC: 'Préoccupation Mineure',
            NT: 'Quasi menacé',
            VU: 'Vulnérable',
            EN: 'En danger',
            CR: 'En danger critique',
            RE: 'Éteint régionalement',
            EW: "Éteint à l'état sauvage",
            EX: 'Éteint',
        },
    },
};

export default messagesFR;
