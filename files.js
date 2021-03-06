var fs = require('fs'),
	markdown = require('markdown').markdown;

var Utils = require('./utils');

var repo = 'git://git.curseforge.net/wow/%s/mainline.git';

module.exports.fetchChangelog = function(details, callback){
	Utils.Clone(repo.replace('%s', details.curse), details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.changelogPath;
			fs.stat(filePath, function(err, stats){
				if(stats && stats.isFile()){
					fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(rerr, data){
						if(rerr)
							callback(rerr);
						else
							callback(null, data);
					});
				} else
					callback(new Error(Utils.Strings.CHANGELOG_MISSING.replace('%s', details.changelogPath)));
			});
		}
	});
}

module.exports.formatChangelog = function(data){
	return Utils.HTMLToBBCode(markdown.toHTML(data));
}

module.exports.getInterfaceVersion = function(details, callback){
	Utils.Clone(repo.replace('%s', details.curse), details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.path + '.toc';
			fs.stat(filePath, function(err, stats){
				if(stats && stats.isFile()){
					fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(rerr, data){
						if(rerr)
							callback(rerr);
						else {
							var interfaceVersion = data.match(/Interface: ?(.+)/);
							if(!interfaceVersion)
								callback(new Error(Utils.Strings.INTERFACE_VERSION_MISSING));
							else
								callback(null, interfaceVersion[1]);
						}
					});
				} else
					callback(new Error(Utils.Strings.TOC_MISSING));
			});
		}
	});
}
