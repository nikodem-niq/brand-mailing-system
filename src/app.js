const request = require('request');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const fs = require('fs');
let URI = `https://panoramafirm.pl/przemysł`;

let companiesList = [];
let endIndex;

const doRequest = (URI) => {
    return new Promise((resolve, reject) => {
        request(encodeURI(URI), (err,res,body) => {
            if(!err) {
                resolve(body);
            } else {
                reject(err);
            }
        })
    })
}

const getEndIndex = async () => {
    await doRequest(URI).then(body => {
        let $ = cheerio.load(body);
        let lastURL = $(
          "#company-list-paginator > nav > ul > li.mx-2.mx-lg-1.py-1.card.pagination-item.pagination-last.text-center > a"
        ).attr("href");
        endIndex = lastURL.slice(lastURL.indexOf(",") + 1, lastURL.indexOf(".html"));
    }).catch(err => {
        throw new Error(err);
    })
}

const initRequest = async() => {
    await getEndIndex();
    for(let a=1; a<endIndex; a++) {
        await doRequest(`https://panoramafirm.pl/przemysł/firmy,${a}.html`).then(body => {
            const $ = cheerio.load(body);
            parseDataCompanies($);
        })
}}

let index = 1;
const parseDataCompanies = ($) => {
    let scriptTags = [];
    $('script[type="application/ld+json"]').each((i,e) => {
        scriptTags.push($(e));
    })
    for(let i=0; i<scriptTags.length; i++) {
        let { email, telephone, name } = JSON.parse(scriptTags[i][0].children[0].data);
        if(!(email === undefined || telephone === undefined)) {
            let companyObject = {
                id: index,
                name,
                email,
                telephone
            }
            companiesList.push(companyObject);
            index++;
        }
    }
    // console.log(JSON.parse(scriptTags[0][0].children[0].data));
    console.log(companiesList);
    // companiesList.push(data);
    fs.writeFileSync('../output/companies.json', JSON.stringify(companiesList, null, 4));
}

initRequest();