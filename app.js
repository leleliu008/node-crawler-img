var fs      = require('fs');
var moment  = require('moment');
var Crawler = require('crawler');

var dataDir     = "data/";
var thisTimeDir = dataDir + moment().format("YYYYMMDDHHmmss");
var imagesDir   = thisTimeDir + "/images";
var imagesFile  = thisTimeDir + "/images.txt";

var uris = new Array();

function prepareDirs() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    fs.mkdirSync(thisTimeDir);
    fs.mkdirSync(imagesDir);
}

function prepareURIs() {
    uris.push("http://www.netbian.com/qiche");
    for(var i = 2; i < 2; i++) {
        uris.push("http://www.netbian.com/qiche/index_" + i + ".htm");
    }
}

function appendFile(src, alt) {
    fs.appendFileSync(imagesFile, src + " " + alt + "\n");
}

function callback(err, response, done) {
    if(err) {
        console.log(err);
    } else {
        var $ = response.$;
        $('li').each(function(index, li) {
            var a = $(li).children('a');
            var img = a.children('img');
                
            var src = img.attr('src');
            var alt = img.attr('alt');

            if (src && alt) {
                appendFile(src, alt);
            }
        });
    }
            
    done();
}

function downloadPic() {
    var request = require('request');
    fs.readFile(imagesFile, function(err, dataBuffer) {
        var allText = dataBuffer.toString();
        var lineTextArray = allText.split('\n');
        lineTextArray.forEach(function(lineText, index, lineTextArray) {
            var fieldArray = lineText.split(' ');
            console.log(fieldArray);
            var uri = fieldArray[0];
            if(uri) {
                request(uri)
                .on('error', function(err) {
                    console.log(err);
                })
                .pipe(fs.createWriteStream(imagesDir + "/" + index + ".jpg"));
            }
        });
    });
}

function grabInfo() {
    var crawler = new Crawler({
        maxConnections: 10,
        jQuery: true,
        callback: callback
    });
    crawler.queue(uris);
    crawler.on('drain', function() {
        console.log('grab info finished!');
        downloadPic();
    });
}

function main() {
    prepareDirs();
    prepareURIs();
    grabInfo();
}

main();
