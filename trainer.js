var fs = require('fs'),
	natural = require('natural'),
	classifier = new natural.BayesClassifier(),data;

var input = fs.createReadStream('positive.sentiment');
readLines(input, classifyIt, 'pos' , classifier);

var input = fs.createReadStream('negative.sentiment');
readLines(input, classifyIt, 'neg' , classifier);

function readLines(input, func , type , classifier) {
  var remaining = '';
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line,type,classifier);
      index = remaining.indexOf('\n');
    }
  });
  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining,type,classifier);
    }
    train(classifier);
    if (type == 'neg')
	{    
		classifier.save('token_classifier.json', function(err, classifier) {
		    console.log('The classifier has been saved!');
		    process.exit();
		});
	}
  });
}

function classifyIt(data,type,classifier) {
	classifier.addDocument(data,type);
}

function train(classifier) {
	classifier.train();
}