const request = require('request');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');
const fs = require('fs');
let URI = `https://panoramafirm.pl/`;

//przemysł, produkcja, wytwarzanie, dostawca technologii, dostarczanie, przemysł 4.0, industrializacja
let brandList = ['przemysł'];
let companiesList = [];
let endIndex = 2;

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

const getEndIndex = async (actualBrand) => {
    await doRequest(`${URI}${actualBrand}`).then(body => {
        let $ = cheerio.load(body);
        let lastURL = $(
          "#company-list-paginator > nav > ul > li.mx-2.mx-lg-1.py-1.card.pagination-item.pagination-last.text-center > a"
        ).attr("href");
        endIndex = lastURL.slice(lastURL.indexOf(",") + 1, lastURL.indexOf(".html"));
    }).catch(err => {
        endIndex = 2;
        throw new Error(err);
    })
}

const initRequest = async() => {
    for(let i=0; i<brandList.length; i++) {
        // console.log(brandList[i]);
        // await getEndIndex(brandList[i]);
        for(let a=1; a<endIndex; a++) {
            await doRequest(`https://panoramafirm.pl/${brandList[i]}/firmy,${a}.html`).then(body => {
                const $ = cheerio.load(body);
                parseDataCompanies($, brandList[i]);
            })
    }
    }}

// let index = 1;
const parseDataCompanies = ($, brand) => {
    let scriptTags = [];
    $('script[type="application/ld+json"]').each((i,e) => {
        scriptTags.push($(e));
    })
    for(let i=0; i<scriptTags.length; i++) {
        let { email, telephone, name } = JSON.parse(scriptTags[i][0].children[0].data);
        if(!(email === undefined || telephone === undefined)) {
            let companyObject = {
                id: 1,
                brand,
                name,
                email,
                telephone
            }
            companiesList.push(companyObject);
            // index++;
        }
    }

    let temp=[];
    let index = 1;
    companiesList=companiesList.filter((x, i)=> {
      if (temp.indexOf(x.email) < 0) {
        temp.push(x.email);
        x.id = index;
        index++;
        return true;
    }
      return false;
    })
     
    // console.log(companiesList);
    fs.writeFileSync('../output/companies.json', JSON.stringify(companiesList, null, 4));
}

initRequest();