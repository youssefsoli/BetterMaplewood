const archiver = require('archiver');
const fs = require('fs');

const packExtension = (zipName, manifestName) => {
    let file = fs.createWriteStream(__dirname + '/../build/' + zipName);
    let archive = archiver('zip', {
        zlib: {level: 9}
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(file);

    archive.directory(__dirname + '/../src', 'src');
    archive.directory(__dirname + '/../img', 'img');
    archive.file(__dirname + '/../injector.js', {name: 'injector.js'});
    archive.file(__dirname + '/../LICENSE', {name: 'LICENSE'});
    archive.file(__dirname + '/../' + manifestName, {name: 'manifest.json'});

    archive.finalize();
};

packExtension('chrome.zip', 'manifest.json');
packExtension('firefox.zip', 'manifest_firefox.json');