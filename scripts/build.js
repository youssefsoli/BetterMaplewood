const archiver = require('archiver');
const fs = require('fs');
const manifest = require('../manifest.json');

const packExtension = (zipName, firefox = false) => {
    let file = fs.createWriteStream(__dirname + '/../build/' + zipName);
    let archive = archiver('zip', {
        zlib: {level: 9}
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.on('end', () => {
        console.log('Successfully packaged ' + zipName + '\n' + archive.pointer() + ' total bytes written\n');
    });

    archive.pipe(file);

    archive.directory(__dirname + '/../src', 'src', {});
    archive.directory(__dirname + '/../img', 'img', {});
    archive.file(__dirname + '/../injector.js', {name: 'injector.js'});
    archive.file(__dirname + '/../background.js', {name: 'background.js'});
    archive.file(__dirname + '/../LICENSE', {name: 'LICENSE'});
    if (firefox) {
        let firefoxManifest = manifest;
        firefoxManifest['browser_specific_settings'] = {
            'gecko': {
                'id': '{b50c1372-c516-4876-bbc8-c6143d1df859}'
            }
        };
        archive.append(JSON.stringify(firefoxManifest), {name: 'manifest.json'});
    } else
        archive.append(JSON.stringify(manifest), {name: 'manifest.json'});

    archive.finalize();
};

console.log('Starting package process\n');
packExtension('chrome.zip');
packExtension('firefox.zip', true);