var gmail = require('./');
var SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
];

var command = process.argv[2];
var argument = process.argv[3];
var argument2 = process.argv[4];
var argument3 = process.argv[5];
var argument4 = process.argv[6];

var result;
if (command === 'save-auth') {
    result = gmail.auth.finalizeAuth('client_secret.json', argument, 'credentials.json');
} else {
    result = gmail.auth('client_secret.json', SCOPES, 'credentials.json');
}

var auth;
result = result.tap(function(a) {
    auth = a;
});

if (command === undefined || command === 'save-auth') {
    result = result.then(gmail.auth.mapExpirationDetailsSync);
} else if (command === 'labels') {
    result = result.then(gmail.labels);
    if (argument) {
        result = result.then(gmail.labels.resolveByName(argument));
    }
} else if (command === 'threads') {
    result = result.then(function(auth) {
        return gmail.threads(auth, { q: argument });
    });
} else if (command === 'threads-on-label') {
    result = result
        .then(gmail.labels)
        .then(gmail.labels.resolveByName(argument))
        .then(function(label) {
            return gmail.threads.onLabel(auth, label.id);
        });
    if (argument2 === 'ids')
        result = result.then(gmail.threads.mapIds);
} else if (command === "send") {
    result = result
        .then(auth => {
            return {
                auth: auth,
                from: argument,
                to: argument2,
                subject: argument3,
                text: argument4,
            };
        })
        .then(gmail.compose.send)
}

result.done(console.log, console.error);
