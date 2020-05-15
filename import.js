var express = require("express");
var pg = require("pg");
var bodyParser = require("body-parser");
var filepath = "books.csv";

var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var inputStream = fs.createReadStream('books.csv', 'utf8');

var CON_STRING = process.env.DB_CON_STRING;
if (CON_STRING == undefined) {
    console.log("Error: Environment variable DB_CON_STRING not set!");
    process.exit(1);
}

pg.defaults.ssl = true;
var dbClient = new pg.Client(CON_STRING);
dbClient.connect();

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

const PORT = 3000;

var app = express();

fs.createReadStream(filepath);
 
inputStream
    .pipe(CsvReadableStream({ parseNumbers: false, parseBoolean: false, skipHead: true}))
    .on('data', function (row) {
        var isbn = row[0];
        var title = row[1];
        var author = row[2];
        var year = row[3];
    
        dbClient.query("INSERT INTO books_list (isbn, title, author, year) VALUES ($1,$2,$3,$4)", [isbn, title, author, year], function (dbError, dbResponse) {
            if (dbError != undefined) {
                console.log(dbError);
            }
                console.log("In data base!");
        });
        console.log('A row arrived: ', row);
    })
    .on('end', function (data) {
        console.log('No more rows!');
    });
