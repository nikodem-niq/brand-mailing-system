require('dotenv').config({path:'../.env'});
const express = require('express');
const nodeMailer = require('nodemailer');
const app = express();
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5000;

let companies = [];
fs.readFile('../output/companies.json', (err,file) => {
    let companiesList = JSON.parse(file);
    for(company in companiesList) {
        companies.push(companiesList[company].email);
    }
    let receivers = companies.join(',');
})


app.set('views', path.join(__dirname, 'views')); 
app.get('/send', (req,res) => {
    let testTransport2 = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    }

    const transporter = nodeMailer.createTransport(testTransport2)
    fs.readFile('views/main.html', function read(err, data) {
        if (err) {
            throw err;
        };
        let htmlFile = data.toString();
        fs.readFile('views/alt.txt', (err,txt) => {
            let txtFile = txt.toString();
            for(company in companies) {
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: companies[company],
                    subject: 'topic',
                    text: txtFile,
                    html: htmlFile
                }
            
                transporter.sendMail(mailOptions, (err, info) => {
                    console.log(info, err);
                    res.send(info);
                })
            }
        })
    });
})

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});