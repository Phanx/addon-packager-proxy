if(!process.env.WOWI_USERNAME)
	throw 'Missing environment variable "WOWI_USERNAME"';

if(!process.env.WOWI_PASSWORD)
	throw 'Missing environment variable "WOWI_PASSWORD"';

if(!process.env.GITHUB_SECRET)
	throw 'Missing environment variable "GITHUB_SECRET"';

var Log = require('./utils').Log,
	Strings = require('./utils').Strings,
	Handler = require('./handler');

var projects = {},
	rawData = JSON.parse(require('fs').readFileSync('addons.json'));

for(var index in rawData)
	projects[rawData[index].repo] = rawData[index];

var handler = require('github-webhook-handler')({
	secret: process.env.GITHUB_SECRET,
	path: '/'
});

handler.on('create', function(event){
	if(event.payload.ref_type != 'tag')
		Log.info(Strings.WEBHOOK_INCORRECT_TYPE.replace('%s', event.payload.ref_type));
	else {
		var name = event.payload.repository.name;
		var details = projects[name];
		if(details){
			Log.info(Strings.WEBHOOK_RECEIVED_PROCEED.replace('%s', name).replace('%s', event.payload.ref));

			details.tag = event.payload.ref;
			new Packager(details);
		} else
			Log.info(Strings.WEBHOOK_RECEIVED_UNKNOWN.replace('%s', name));
	}
});

handler.on('error', function(err){
	Log.error(Strings.WEBHOOK_ERROR_MESSAGE.replace('%s', err.message));
});

require('http').createServer(function(req, res){
	handler(req, res, function(err){
		res.statusCode = 404;
		res.end('Nothing to see here, move along!');
	});
}).listen(process.env.PORT);
