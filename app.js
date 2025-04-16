const express = require('express');
const axios = require('axios');
const app = express();
const port = 4000;

// Rota que consome os dados da primeira API
app.get('/recommendation', async (req, res) => {
    const cityName = req.query.city;

    if (!cityName) {
        return res.status(400).send("Please, specify the city's name.")
    }

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
    }

    try { 
        const response = await axios.get(`http://localhost:3000/weather?city=${encodeURIComponent(cityName)}`)

        const temperature = response.data.temp;

        const recommendationString = getRecommendation(temperature)

        return res.json({
            temperatura: response.data,
            recommendation: recommendationString
        });
    } catch (error) {
        return res.status(404).send("Cidade não encontrada na API de meteorologia.");
    }

});

app.listen(port, () => {
  console.log(`API A rodando em http://localhost:${port}`);
});