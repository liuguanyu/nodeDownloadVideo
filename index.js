var parser = require("parseVideo");

var fs = require("fs");

var path = require("path");

var exec = require('child_process').exec;

var downloadInfo = fs.readFileSync("download.txt").toString();

var downloadList = downloadInfo.split("\n");

downloadList.forEach(function (el){
  el = el.trim();

  if (el != ""){
    parser(el, '', function(err, data){
        var dirName = +(new Date()) + "";

        var workPath = path.resolve(__dirname, '.', dirName);

        if (!fs.existsSync(workPath)){
            fs.mkdirSync(workPath);
        }

        if (el.indexOf('youku.com') !== -1){
            var vendor = require("./downloader/youku.js");
        }
        else if(el.indexOf('iqiyi.com') !== -1){
            var vendor = require("./downloader/iqiyi.js");
        }

        vendor(data, workPath, __dirname);
    });
  }
});
