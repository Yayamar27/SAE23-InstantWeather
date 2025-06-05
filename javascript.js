document.addEventListener('DOMContentLoaded', () => {
    const postalCodeInput = document.getElementById('postalCode');
    const communeSelect = document.getElementById('communeSelect');
    const weatherForm = document.getElementById('weatherForm');
    const meteoResults = document.getElementById('meteoResults');
    const resultTitle = document.getElementById('resultTitle');
    const tempMin = document.getElementById('tempMin');
    const tempMax = document.getElementById('tempMax');
    const rainProbability = document.getElementById('rainProbability');
    const sunHours = document.getElementById('sunHours');

    postalCodeInput.addEventListener('input', async (e) => {
        const postalCode = e.target.value;
        if (postalCode.length === 5) {
            try {
                const communesResponse = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${postalCode}`);
                const communes = await communesResponse.json();

                communeSelect.innerHTML = '<option value="">Sélectionnez une commune</option>';
                communes.forEach(commune => {
                    const option = document.createElement('option');
                    option.value = commune.code;
                    option.textContent = commune.nom;
                    communeSelect.appendChild(option);
                });

                communeSelect.style.display = 'block';
            } catch (error) {
                console.error('Erreur lors de la récupération des communes', error);
                alert('Impossible de charger les communes. Vérifiez votre connexion.');
            }
        }
    });

    weatherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const communeCode = communeSelect.value;

        try {
            const meteoResponse = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=974bc36ca010cfac6a694cd4e022fd4774b8c4a7786a1fd7e3d81e9bd60d37a3&insee=${communeCode}`);
            const meteoData = await meteoResponse.json();
            const dailyForecast = meteoData.forecast[0];

            resultTitle.textContent = `Météo pour ${communeSelect.options[communeSelect.selectedIndex].text}`;
            tempMin.textContent = `${dailyForecast.tmin}°C`;
            tempMax.textContent = `${dailyForecast.tmax}°C`;
            rainProbability.textContent = `${dailyForecast.probarain}%`;
            sunHours.textContent = `${dailyForecast.sun_hours} heures`;

            meteoResults.hidden = false;
        } catch (error) {
            console.error('Erreur lors de la récupération des données météo', error);
            alert('Impossible de charger les données météorologiques. Réessayez plus tard.');
        }
    });
});