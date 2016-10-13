'use strict';

const bunyan = require('bunyan'),
    co = require('co'),
    fs = require('fs'),
    generate = require('node-chartist'),
    hapi = require('hapi'),
    log = bunyan.createLogger({
        name: 'chatist-test'
    }),
    path = require('path'),
    port = 3000,
    pug = require('pug'),

    compiledFunction = pug.compileFile('template.pug', {
        pretty: true
    }),

    server = new hapi.Server();

server.connection({
    port: port
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        log.info({
            request: request
        }, 'HTTP request recieved');

        co(function* () {
            const data = {
                    labels: [
                        'Mon',
                        'Tue',
                        'Wed',
                        'Thu',
                        'Fri',
                        'Sat',
                        'Sun'
                    ],
                    series: [
                        [1, 2, 3, 4, 5, 6, 7]
                    ]
                },
                options = {
                    height: 200,
                    width: 400
                };

            let bar = yield generate('line', options, data); // => chart HTML

            log.info('Chart data generated');
            reply(compiledFunction({
                chartHtml: bar
            })).type('text/html');
        });
    }
});

server.register(require('inert'), function (error) {
    if (error) {
        log.error(error, 'Unable to register inert plugin');
        return;
    }

    server.route({
        method: 'GET',
        path: '/main.css',
        handler: function (request, reply) {
            log.info('main.css requested');
            reply.file('./main.css');
        }
    });
});

server.start(function (error) {
    if (error) {
        log.error(error, 'Unable to start Hapi server');
        return;
    }

    console.log(`Server running at: ${server.info.url}`);
});
