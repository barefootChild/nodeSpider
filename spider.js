/**
 * Created by zhaoyongsheng on 17/2/8.
 */

'use strict';
let https = require('https'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio');

function spiderMovie(index) {
    https.get('https://movie.douban.com/top250?start=' + index, (res) => {
        let pageSize = 25;
        let html = '';
        let movies = [];
        res.setEncoding('utf-8');

        res.on('data', (chunk) => { html += chunk; });

        res.on('end', () => {
            let $ = cheerio.load(html);
            $('.item').each(() => {
                let picUrl = $('.pic img', this).attr('src');
                let movie = {
                    title: $('.title', this).text(),
                    start: $('.info .star .rating_num', this).text(),
                    link: $('a', this).attr('href'),
                    picUrl: picUrl
                };

                if (movie) {
                    movies.push(movie);
                }

                downloadImg('./img/', movie.picUrl);
            });

            saveData('./data' + (index / pageSize) + '.json', movies);
        });
    }).on('error', (err) => {
        console.log(err);
    });
}

function downloadImg(imgDir, url) {
    https.get(url, (res) => {
        let data = '';
        res.setEncoding('binary');
        res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        fs.writeFile(imgDir + path.basename(url), data, 'binary', (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('Image downloaded: ', path.basename(url));
        });
    }).on('error', (err) => {
            console.log(err);
        });
    });
}

function saveData(path, movies) {
    console.log(movies);

    fs.writeFile(path, JSON.stringify(movies, null, ' '), (err) => {
        if (err) {
            return console.log(err);
        }
        console.log('Data saved');
    });
}

function *doSpider(x) {
    let start = 0;
    console.log(start + '_________');
    while (start < x) {
        yield start;
        spiderMovie(start);
        start += 25;
    }
}

for (let x of doSpider(250)) {
    console.log(x);
}