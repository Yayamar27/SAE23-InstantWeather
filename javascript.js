document.addEventListener('DOMContentLoaded', () => {
    // Références des éléments du DOM
    const postalCodeInput = document.getElementById('postalCode');
    const communeSelect = document.getElementById('communeSelect');
    const weatherForm = document.getElementById('weatherForm');
    const daysRange = document.getElementById('daysRange');
    const daysValue = document.getElementById('daysValue');
    const meteoResults = document.getElementById('meteoResults');

    // Lors de la saisie du code postal
    postalCodeInput.addEventListener('input', async (e) => {
        const postalCode = e.target.value;
        if (postalCode.length === 5) {
            try {
                // Récupération des communes via API
                const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}`);
                const communes = await res.json();

                // Remplissage de la liste déroulante des communes
                communeSelect.innerHTML = '<option value="">Sélectionnez une commune</option>';
                communes.forEach(commune => {
                    const option = document.createElement('option');
                    option.value = commune.code;
                    option.textContent = commune.nom;
                    communeSelect.appendChild(option);
                });
                communeSelect.style.display = 'block';
            } catch (err) {
                alert("Erreur lors du chargement des communes.");
            }
        }
    });

    // Affiche la valeur sélectionnée (jours de prévision)
    daysRange.addEventListener('input', () => {
        daysValue.textContent = daysRange.value;
    });

    // Soumission du formulaire météo
    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const insee = communeSelect.value;
        const days = parseInt(daysRange.value, 10);
        if (!insee) return;

        try {
            // Récupération des prévisions météo
            const res = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=974bc36ca010cfac6a694cd4e022fd4774b8c4a7786a1fd7e3d81e9bd60d37a3&insee=${insee}`);
            const data = await res.json();
            const previsions = data.forecast.slice(0, days);

            // Vérifie les options cochées par l'utilisateur
            const showLat = document.getElementById('showLat').checked;
            const showLon = document.getElementById('showLon').checked;
            const showRain = document.getElementById('showRain').checked;
            const showWind = document.getElementById('showWind').checked;
            const showWindDir = document.getElementById('showWindDir').checked;

            // Récupère la latitude/longitude de la commune
            const cityRes = await fetch(`https://geo.api.gouv.fr/communes/${insee}?fields=nom,centre`);
            const cityData = await cityRes.json();
            const lat = cityData.centre.coordinates[1];
            const lon = cityData.centre.coordinates[0];

            // Affichage du nom de la ville
            meteoResults.innerHTML = `<h2>Météo pour ${communeSelect.options[communeSelect.selectedIndex].text}</h2>`;

            // Génère les cartes de prévision pour chaque jour
            previsions.forEach(day => {
                const card = document.createElement('div');
                card.className = 'result-item';
                const { icon, desc } = getWeatherData(day.weather);

                let html = `
                    <p><strong>${formattageJour(day.day)}</strong></p>
                    <p><i class="${icon}" style="margin-right: 8px;"></i>${desc}</p>
                    <p>Min : ${day.tmin}°C | Max : ${day.tmax}°C</p>
                    <p>Pluie : ${day.probarain}% | Soleil : ${day.sun_hours}h</p>
                `;

                // Ajoute les infos supplémentaires si cochées
                if (showLat) html += `<p>Latitude : ${lat.toFixed(4)}</p>`;
                if (showLon) html += `<p>Longitude : ${lon.toFixed(4)}</p>`;
                if (showRain) html += `<p>Cumul de pluie : ${day.rr10} mm</p>`;
                if (showWind) html += `<p>Vent moyen : ${day.wind10m} km/h</p>`;
                if (showWindDir) html += `<p>Direction du vent : ${day.dirwind10m}°</p>`;

                card.innerHTML = html;
                meteoResults.appendChild(card);
            });

            meteoResults.hidden = false;
        } catch (err) {
            alert("Erreur lors du chargement des données météo.");
        }
    });

    // Génère un libellé dynamique du jour (ex : Aujourd'hui - Samedi 7 juin)
    function formattageJour(offset) {
        const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        const date = new Date();
        date.setDate(date.getDate() + offset);

        const jour = jours[date.getDay()];
        const numero = date.getDate();
        const moisNom = mois[date.getMonth()];

        if (offset === 0) return `Aujourd'hui - ${jour} ${numero} ${moisNom}`;
        if (offset === 1) return `Demain - ${jour} ${numero} ${moisNom}`;
        return `${jour} ${numero} ${moisNom}`;
    }
    // Associe chaque code météo à un icône et une description
    // Voir annexe https://api.meteo-concept.com/documentation
function getWeatherData(code) {
    const data = {
        0: { icon: 'fas fa-sun', desc: 'Soleil' },
        1: { icon: 'fas fa-cloud-sun', desc: 'Peu nuageux' },
        2: { icon: 'fas fa-cloud-sun', desc: 'Ciel voilé' },
        3: { icon: 'fas fa-cloud', desc: 'Nuageux' },
        4: { icon: 'fas fa-cloud', desc: 'Très nuageux' },
        5: { icon: 'fas fa-cloud', desc: 'Couvert' },
        6: { icon: 'fas fa-smog', desc: 'Brouillard' },
        7: { icon: 'fas fa-icicles', desc: 'Brouillard givrant' },
        10: { icon: 'fas fa-cloud-rain', desc: 'Pluie faible' },
        11: { icon: 'fas fa-cloud-showers-heavy', desc: 'Pluie modérée' },
        12: { icon: 'fas fa-cloud-showers-heavy', desc: 'Pluie forte' },
        13: { icon: 'fas fa-snowflake', desc: 'Pluie faible verglaçante' },
        14: { icon: 'fas fa-snowflake', desc: 'Pluie modérée verglaçante' },
        15: { icon: 'fas fa-snowflake', desc: 'Pluie forte verglaçante' },
        16: { icon: 'fas fa-cloud-rain', desc: 'Bruine' },
        20: { icon: 'fas fa-snowflake', desc: 'Neige faible' },
        21: { icon: 'fas fa-snowflake', desc: 'Neige modérée' },
        22: { icon: 'fas fa-snowflake', desc: 'Neige forte' },
        30: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées faibles' },
        31: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées modérées' },
        32: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées fortes' },
        40: { icon: 'fas fa-cloud-sun-rain', desc: 'Averses faibles locales' },
        41: { icon: 'fas fa-cloud-sun-rain', desc: 'Averses locales' },
        42: { icon: 'fas fa-cloud-showers-heavy', desc: 'Averses locales fortes' },
        43: { icon: 'fas fa-cloud-showers-heavy', desc: 'Averses faibles' },
        44: { icon: 'fas fa-cloud-showers-heavy', desc: 'Averses modérées' },
        45: { icon: 'fas fa-cloud-showers-heavy', desc: 'Averses fortes' },
        46: { icon: 'fas fa-cloud-rain', desc: 'Averses faibles fréquentes' },
        47: { icon: 'fas fa-cloud-rain', desc: 'Averses fréquentes' },
        48: { icon: 'fas fa-cloud-showers-heavy', desc: 'Averses fortes fréquentes' },
        60: { icon: 'fas fa-snowflake', desc: 'Averses neige faibles localisées' },
        61: { icon: 'fas fa-snowflake', desc: 'Averses neige localisées' },
        62: { icon: 'fas fa-snowflake', desc: 'Averses neige fortes localisées' },
        63: { icon: 'fas fa-snowflake', desc: 'Averses neige faibles' },
        64: { icon: 'fas fa-snowflake', desc: 'Averses neige modérées' },
        65: { icon: 'fas fa-snowflake', desc: 'Averses neige fortes' },
        66: { icon: 'fas fa-snowflake', desc: 'Averses neige faibles fréquentes' },
        67: { icon: 'fas fa-snowflake', desc: 'Averses neige fréquentes' },
        68: { icon: 'fas fa-snowflake', desc: 'Averses neige fortes fréquentes' },
        70: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées faibles localisées' },
        71: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées localisées' },
        72: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées fortes localisées' },
        73: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées faibles' },
        74: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées' },
        75: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées fortes' },
        76: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées faibles fréquentes' },
        77: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées fréquentes' },
        78: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées fortes fréquentes' },
        100: { icon: 'fas fa-bolt', desc: 'Orages faibles et locaux' },
        101: { icon: 'fas fa-bolt', desc: 'Orages locaux' },
        102: { icon: 'fas fa-bolt', desc: 'Orages forts et locaux' },
        103: { icon: 'fas fa-bolt', desc: 'Orages faibles' },
        104: { icon: 'fas fa-bolt', desc: 'Orages modérés' },
        105: { icon: 'fas fa-bolt', desc: 'Orages forts' },
        106: { icon: 'fas fa-bolt', desc: 'Orages faibles fréquents' },
        107: { icon: 'fas fa-bolt', desc: 'Orages fréquents' },
        108: { icon: 'fas fa-bolt', desc: 'Orages forts fréquents' },
        120: { icon: 'fas fa-bolt', desc: 'Orages faibles de neige/grésil' },
        121: { icon: 'fas fa-bolt', desc: 'Orages de neige/grésil' },
        122: { icon: 'fas fa-bolt', desc: 'Orages modérés de neige/grésil' },
        123: { icon: 'fas fa-bolt', desc: 'Orages faibles neige/grésil' },
        124: { icon: 'fas fa-bolt', desc: 'Orages neige/grésil' },
        125: { icon: 'fas fa-bolt', desc: 'Orages neige/grésil forts' },
        126: { icon: 'fas fa-bolt', desc: 'Orages neige/grésil faibles fréquents' },
        127: { icon: 'fas fa-bolt', desc: 'Orages neige/grésil fréquents' },
        128: { icon: 'fas fa-bolt', desc: 'Orages neige/grésil forts fréquents' },
        130: { icon: 'fas fa-bolt', desc: 'Orages faibles pluie/neige/grésil' },
        131: { icon: 'fas fa-bolt', desc: 'Orages pluie/neige/grésil' },
        132: { icon: 'fas fa-bolt', desc: 'Orages forts pluie/neige/grésil' },
        133: { icon: 'fas fa-bolt', desc: 'Orages faibles pluie/neige/grésil' },
        134: { icon: 'fas fa-bolt', desc: 'Orages pluie/neige/grésil' },
        135: { icon: 'fas fa-bolt', desc: 'Orages forts pluie/neige/grésil' },
        136: { icon: 'fas fa-bolt', desc: 'Orages faibles fréquents pluie/neige/grésil' },
        137: { icon: 'fas fa-bolt', desc: 'Orages fréquents pluie/neige/grésil' },
        138: { icon: 'fas fa-bolt', desc: 'Orages forts fréquents pluie/neige/grésil' },
        140: { icon: 'fas fa-bolt', desc: 'Pluies orageuses' },
        141: { icon: 'fas fa-bolt', desc: 'Pluie/neige mêlées orageuses' },
        142: { icon: 'fas fa-bolt', desc: 'Neige orageuse' },
        210: { icon: 'fas fa-cloud-rain', desc: 'Pluie faible intermittente' },
        211: { icon: 'fas fa-cloud-rain', desc: 'Pluie modérée intermittente' },
        212: { icon: 'fas fa-cloud-showers-heavy', desc: 'Pluie forte intermittente' },
        220: { icon: 'fas fa-snowflake', desc: 'Neige faible intermittente' },
        221: { icon: 'fas fa-snowflake', desc: 'Neige modérée intermittente' },
        222: { icon: 'fas fa-snowflake', desc: 'Neige forte intermittente' },
        230: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées intermittentes' },
        231: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées intermittentes' },
        232: { icon: 'fas fa-cloud-meatball', desc: 'Pluie/neige mêlées intermittentes' },
        235: { icon: 'fas fa-cloud-meatball', desc: 'Averses de grêle' }
    };

    return data[code] || { icon: 'fas fa-question', desc: 'Inconnu' };
}

});
