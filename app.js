/******NO NEED TO MODIFY ****/
var express = require('express'); // Adding the express library 
var mustacheExpress = require('mustache-express'); // Adding mustache templating system and connecting it to 
var request = require('request')  // Adding the request library (to make HTTP reqeusts from the server)
var tools = require('./tools.js'); // Custom module providing additional functionality to the server
var jsonfile = require('jsonfile')
var file = './text_data.json'
var obj = jsonfile.readFileSync(file)
var file_c = './comment_data.json'
var obj_c = jsonfile.readFileSync(file_c)
var app = express(); // initializing applicaiton
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// For each request to this server, run the function "logger" in tools.js 
app.use(tools.logger);

// Set up /static path to host css/js/image files directly
app.use('/static', express.static(__dirname + '/static'));
/****END OF NO NEED TO MODIFY SECTION ******/



/******** My setup for body-parser *********/

// Parser to gain access to request body
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));


/******** End setup for body-parser *********/



// Define your routes here
app.get('/doc/:doc_id', function (req, res, next) {
	var doc = req.params.doc_id;
	
	var doc_data = {};
	for(var i=0; i< obj["data"].length; i++){
		if(obj["data"][i]["doc_id"] == doc){
			doc_data = obj["data"][i];
			break;
		}
	}
	var comment_data  = {}
	for(var i=0; i< obj_c["data"].length; i++){
		if(obj_c["data"][i]["doc_id"] == doc){
			comment_data = obj_c["data"][i];
			break;
		}
	}
	//doc_data['cluster_len']  = comment_data['central_comments'].length
	//doc_data['top_words'] = comment_data['top_words']
	console.log(comment_data['top_words']);
  res.render('doc.html', doc_data);
});

app.get('/index', function (req, res, next) {
	var title_obj = {"title_list":[]}
	for(var i=0; i< obj["data"].length; i++){
		title_obj["title_list"].push({"name": obj["data"][i]["doc_title"], "id":obj["data"][i]["doc_id"]})
	}
  res.render('index.html',title_obj);
});

app.get('/about', function (req, res, next) {
  res.render('about.html');
});

app.get('/evaluate', function (req, res, next) {
  res.render('evaluate.html');
});

app.get('/startEval', function (req, res, next) {
	var doc = "USCBP-2007-0064-1986";
	
	var doc_data = {};
	for(var i=0; i< obj["data"].length; i++){
		if(obj["data"][i]["doc_id"] == doc){
			doc_data = obj["data"][i];
			break;
		}
	}
	//console.log(doc_data);
  res.render('evalform.html', doc_data);
});
app.post('/evalComplete', function (req, res, next) {
	var sum_score = req.body.group1;
	var sent_score = req.body.group2;
	console.log(sum_score +" "+ sent_score)
  res.render('evalcomp.html');
});

app.get('/contact', function (req, res, next) {
  res.render('contact.html');
});


app.post('/contact', function (req, res, next) {
  name = req.body.name;
  email = req.body.email;
  subject = req.body.subject;
  message = req.body.message;

	var count = 0;
	if (name && email && subject && message) {
		notifications = "Hi " + name + ", your message has been sent!";
	} else {
		notifications = "Whoops! The following field(s) are empty: ";

		if (!name) {
			notifications += "Name";
			count++;
		}

		if (!email) {
			if (count > 0) {
				notifications += ", Email";
			} else {
				notifications += "Email";
			}
			count++;
		}

		if (!subject) {
			if (count > 0) {
				notifications += ", Subject";
			} else {
				notifications += "Subject";
			}
			count++;
		}

		if (!message) {
			if (count > 0) {
				notifications += ", Message";
			} else {
				notifications += "Message";
			}
			count++;			
		}
	}

	if (count == 0) {
	  outputMessage = "Name: " + name + "\n\nEmail: " + email + "\n\nSubject: " + subject + "\n\nMessage: " + message;

	  console.log("Sending email to myself");
	  // The server sends an HTTP request to the Mailgun servers via their
	  // API to send an email
	  request({
	      url: 'https://api.mailgun.net/v3/kayashaolu.me/messages',
	      method: 'POST',
	      headers: {
	        'Content-Type':  "application/x-www-form-urlencoded"
	      },
	      form: {	        
			from: name + ' <' + email + '>',
			to: 'Kin <kinshuksinha91@yahoo.co.in>',
	        subject: subject,
	        text: outputMessage,
	      },
	      auth: {
	        user: 'api',
	        password: 'key-a47b29224335121b5591e4beb9bce80c'
	      }

	    }, function(error, response, body){
	      if(error) {
	          console.log(error);
	      } else {
	          console.log(response.statusCode, body);
	      }
	  });	

	  res.render('contact.html', {'notificationsSuccess': notifications, 'notificationsFailure': ''});	
	} else {
	  res.render('contact.html', {'notificationsSuccess': '', 'notificationsFailure': notifications});	
	}
});					




// Start up server on port 3000 on host localhost
var server = app.listen(3000, function () {
  var port = server.address().port;

  console.log('Assignment 2 server on localhost listening on port ' + port + '!');
  console.log('Open up your browser (within your VM) and enter the URL "http://localhost:' + port + '" to view your website!');
});