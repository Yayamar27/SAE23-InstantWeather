document.addEventListener('DOMContentLoaded', () => {
    const postalCodeInput = document.getElementById('postalCode');
    const communeSelect = document.getElementById('communeSelect');
    const weatherForm = document.getElementById('weatherForm');
    const daysRange = document.getElementById('daysRange');
    const daysValue = document.getElementById('daysValue');
    const meteoResults = document.getElementById('meteoResults');

    postalCodeInput.addEventListener('input', async (e) => {
        const postalCode = e.target.value;
        if (postalCode.length === 5) {
            try {
                const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}`);
                const communes = await res.json();

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

    daysRange.addEventListener('input', () => {
        daysValue.textContent = daysRange.value;
    });

    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const insee = communeSelect.value;
        const days = parseInt(daysRange.value, 10);
        if (!insee) return;

        try {
            const res = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=974bc36ca010cfac6a694cd4e022fd4774b8c4a7786a1fd7e3d81e9bd60d37a3&insee=${insee}`);
            const data = await res.json();
            const previsions = data.forecast.slice(0, days);

            // Récupérer infos supplémentaires cochées
            const showLat = document.getElementById('showLat').checked;
            const showLon = document.getElementById('showLon').checked;
            const showRain = document.getElementById('showRain').checked;
            const showWind = document.getElementById('showWind').checked;
            const showWindDir = document.getElementById('showWindDir').checked;

            // Récupérer lat/lon depuis autre endpoint
            const cityRes = await fetch(`https://geo.api.gouv.fr/communes/${insee}?fields=nom,centre`);
            const cityData = await cityRes.json();
            const lat = cityData.centre.coordinates[1];
            const lon = cityData.centre.coordinates[0];

            meteoResults.innerHTML = `<h2>Météo pour ${communeSelect.options[communeSelect.selectedIndex].text}</h2>`;

            previsions.forEach(day => {
                const card = document.createElement('div');
                card.className = 'result-item';

                let html = `
                    <p><strong>Jour ${day.day}</strong></p>
                    <p>Min : ${day.tmin}°C | Max : ${day.tmax}°C</p>
                    <p>Pluie : ${day.probarain}% | Soleil : ${day.sun_hours}h</p>
                `;

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
});
