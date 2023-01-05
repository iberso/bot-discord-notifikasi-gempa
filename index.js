const axios = require('axios');
require('dotenv').config();
const Cron = require('node-cron');
const _ = require('lodash');

let currentData;

console.log("WAKE UP");
Cron.schedule("* * * * *", async() => {
    console.log("JALAN TIAP 1 MENIT")
    await getCurrentGempaData();
});

async function getCurrentGempaData() {
    axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')
        .then(function(response) {
            if (!currentData) {
                currentData = response.data;
                return;
            }
            if (_.isEqual(currentData, response.data)) {
                console.log("Puji Tuhan enggak ada gempa terbaru....");
                return;
            }
            console.log("Anjir ada gempa terbaru....");
            currentData = response.data;
            const gempaTerkini = response.data.Infogempa.gempa;
            const waktuWIT = Number(Number(gempaTerkini.Jam.split(':')[0]) + 2) + ":" + gempaTerkini.Jam.split(':')[1] + " WIT"
            let magnitudo = gempaTerkini.Magnitude;

            if (magnitudo === 6.9) {
                magnitudo = ":regional_indicator_n: :regional_indicator_i: :regional_indicator_c: :regional_indicator_e:";
            }

            let bodySend = {
                username: "BMKG - INTERNAL",
                avatar_url: "https://cdn.bmkg.go.id/Web/Logo-BMKG-new.png",
                embeds: [{
                    "title": ":warning: :regional_indicator_g: :regional_indicator_e: :regional_indicator_m: :regional_indicator_p: :regional_indicator_a: :warning:",
                    "description": "Wah Telah Terjadi Gempa. " + gempaTerkini.Wilayah + ", jan lupa 1 orang pi cek hosea di de pu rumah",
                    "color": 15258703,
                    "thumbnail": {
                        "url": "",
                    },
                    "image": {
                        "url": "https://data.bmkg.go.id/DataMKG/TEWS/" + gempaTerkini.Shakemap
                    },
                    "fields": [{
                        "name": "Tanggal",
                        "value": gempaTerkini.Tanggal,
                        "inline": true
                    }, {
                        "name": "Magnitude",
                        "value": magnitudo,
                        "inline": true
                    }, {
                        "name": "Kedalaman",
                        "value": gempaTerkini.Kedalaman,
                        "inline": true
                    }, {
                        "name": "Jam",
                        "value": waktuWIT,
                        "inline": true
                    }, {
                        "name": "Wilayah Terdampak",
                        "value": gempaTerkini.Dirasakan,
                        "inline": true
                    }],
                    "footer": {
                        "text": `Sumber Data BMKG 🥰`,
                        "icon_url": 'https://cdn.bmkg.go.id/Web/Logo-BMKG-new.png',
                    }

                }]
            }
            sendDiscordMessage(bodySend);
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
}

async function sendDiscordMessage(bodySend) {
    await axios.post(process.env['DISCORD_WEBHOOK_LINK'], bodySend)
        .then(function(response) {
            console.log("sukses ngirim informasi gempa data baru");
        })
        .catch(function(error) {
            console.log(error);
        });
}