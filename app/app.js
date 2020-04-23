const http = require('http');
const fs = require('fs');
const path = require('path');
const cmdArgs = require('command-line-args')

const MAX = 32

const cmdOptions = [
	{ name: 'port', alias: 'p', type: Number},
	{ name: 'folder', alias: 'd', type: String },
	{ name: 'dev', type: Boolean}
]

const options = cmdArgs(cmdOptions)
const port = options.port || 4311
const folder = options.folder  || '/data/'

function validate(d) {
	const parts = d.split('/')
	const first = parts[1]
	return (first.length >= 32) 
}

function abs(p) {
	return (folder + '/' + p.replace('./','')).replace('//','/')
}

http.createServer(function (req, res) {
    let filePath = '.' + req.url;
    if (filePath == './')
        filePath = './index.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

	if(!fs.existsSync(abs(filePath))) {	
		res.writeHead(404)
		res.end()
		return
	}
	if(!validate(filePath)) {
		res.writeHead(404)
		res.end()
		return
	}

	filePath = abs(filePath)
	console.log(filePath)
	const stats = fs.lstatSync(filePath)
	if(stats.isDirectory()) {
        contentType = 'application/json';
		fs.readdir(filePath, function(err, items) {
            res.writeHead(200, { 'Content-Type': contentType });
			res.end(JSON.stringify(items), 'utf-8');
		});
		return
	} else if(stats.isFile()){
		const file = path.basename(filePath)
		const dir = path.dirname(filePath)
		fs.readFile(filePath, function(error, content) {
			if (error) {
				if(error.code == 'ENOENT'){
					fs.readFile('./404.html', function(error, content) {
						res.writeHead(200, { 'Content-Type': contentType });
						res.end(content, 'utf-8');
					});
				}
				else {
					console.log(error);
					res.writeHead(500);
					res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
					res.end(); 
				}
			}
			else {
				
				res.writeHead(200, { 'Content-Type': contentType });
				res.end(content, 'utf-8');
			}
		});

	}

}).listen(port);
console.log('Server running at on ' + port);
console.log('Serving files from: ' + folder);
