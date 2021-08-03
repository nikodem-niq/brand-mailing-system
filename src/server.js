const express = require('express');
const cron = require('node-cron');
const app = express();
const port = process.env.PORT || 5000;

let task1 = cron.schedule('*/5 * * * * *', () => {
    for(let i=0; i<5; i++) {
        setTimeout(() => {
            console.log(i)
        }, 1000);
    }
})

task1.start();

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});