var page = require('webpage').create();
page.open('http://.../', function() {
  page.render('xtest.png');
  phantom.exit();
});