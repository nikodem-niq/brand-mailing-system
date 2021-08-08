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
    let testTransport1 = {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'test1',
            pass: 'test2'
        }
    };

    let testTransport2 = {
        service: 'gmail',
        auth: {
            user: 'test1',
            pass: 'test2'
        }
    }


    const transporter = nodeMailer.createTransport(testTransport2)
    fs.readFile('views/main.html', function read(err, data) {
        if (err) {
            throw err;
        }
        let htmlFile = data.toString();
        const mailOptions = {
            from: 'sender',
            bcc: 'receiver',
            subject: 'topic',
            text: 'plain text',
            html: htmlFile
        }
    
        transporter.sendMail(mailOptions, (err, info) => {
            console.log(info, err);
            res.send(info);
        })
    });



})


app.listen(port, () => {
    console.log(`Listening on ${port}`);
});