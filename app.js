const express = require('express');
const axios = require('axios');
const redis = require('redis');
const app = express();
const port = 4000;

let client;

const getRecommendation = (temperature) => {
    if (temperature > 30) {
        return "Hidratação!";
    }
    if (temperature >= 16 && temperature <= 29) {
        return "O clima está agradável";
    }
    if (temperature < 15) {
        return "Usa casaco";
    }
};

app.get('/recommendation', async (req, res) => {
    try {
        if (!client) {
            client = redis.createClient({
                host: 'localhost',
                port: 6379
            });

            client.on('error', (err) => {
                console.log('Erro no Redis: ', err);
            });

            await client.connect();
        }

        const cityName = req.query.city;

        if (!cityName) {
            return res.status(400).send("Por favor, especifique o nome da cidade.");
        }

        const cacheKey = cityName;

        let data = await client.get(cacheKey);
        data = data ? JSON.parse(data) : null;

        if (!data) {
            try {
                const response = await axios.get(`http://localhost:3001/weather/${encodeURIComponent(cityName)}`);

                await client.setEx(cacheKey, 60, JSON.stringify(response.data));

                data = response.data;
            } catch (error) {
                return res.status(404).send("Cidade não encontrada na API de meteorologia.");
            }
        }

        const temperature = data.temp;
        const recommendationString = getRecommendation(temperature);

        return res.json({
            temperatura: data,
            recommendation: recommendationString
        });

    } catch (error) {
        return res.status(500).send("Erro interno no servidor.");
    }
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});
