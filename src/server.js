require('dotenv').config({path:'../.env'});
const express = require('express');
const nodeMailer = require('nodemailer');
const app = express();
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5000;
const logger = require('./logger');

let companies = [];

fs.readFile('../output/test.json', (err,file) => {
    let companiesList = JSON.parse(file);
    for(company in companiesList) {
        companies.push(companiesList[company].email);
    }
})

app.set('views', path.join(__dirname, 'views')); 
app.get('/send', (req,res) => {
    const date = new Date()
    const today = date.toLocaleDateString()
    const actualTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

    logger.logger.log({
        level: 'info',
        message: `=========== LOGGING MAILING FROM: ${today} ${actualTime} ===========`
    })

    let transport = {
        port: process.env.SMTP_PORT,
        host: process.env.SMTP,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    }

    const transporter = nodeMailer.createTransport(transport)
    fs.readFile('views/main.html', function read(err, data) {
        if (err) {
            throw err;
        };
        let htmlFile = data.toString();
        fs.readFile('views/alt.txt', (err,txt) => {
            let txtFile = txt.toString();
                const send = () => {
                    let i = 0;

                    const loopThrough = () => {
                        setTimeout(() => {
                            const mailOptions = {
                                from: process.env.EMAIL,
                                to: companies[i],
                                subject: 'Zyskaj 800 tysiecy z mapa drogowa',
                                text: txtFile,
                                html: htmlFile
                            }

                            transporter.sendMail(mailOptions, (err, info) => {
                                if(err == null){
                                    logger.logger.log({
                                        level: 'info',
                                        message: info
                                    })
                                } else {
                                    logger.logger.log({
                                        level: 'error',
                                        message: err
                                    })
                                }
                                console.log(`Sent to: ${mailOptions.to}`)
                                console.log('..')
                            }) 
                                i++;
                                if(i < companies.length) {
                                    loopThrough();
                                }
                            }, 150)
                    }
                    loopThrough();
                }
                send();
        })
    });
})

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});