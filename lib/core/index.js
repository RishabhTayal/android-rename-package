(function() {
    'use strict';

    var path = require('path'),
        fs = require('fs'),
        defaultPolicy = require('./defaultpolicy.js'),
        manifestHandler = require('../handler/manifesthandler.js'),
        resourceHandler = require('../handler/resourcehandler.js'),
        javaHandler = require('../handler/javahandler.js'),
        pathScanner = require('../scanner/pathscanner.js')

    var Context = function () {

        var self = this

        this.log = {
            i : function(s) {
                console.log('i: ' + s)
            },
            w : function(s) {
                console.log('w: ' + s)
            },
            e : function(s) {
                console.log('e: ' + s)
            },
            d : function(s) {
                if (self.verbose) {
                   console.log('d: ' + s)
                }
            }
        }

        this.encoding = 'utf-8'

        this.returnSymbol = '\n'

        this.verbose = false

        this.policy = defaultPolicy

        this.projects = [ ]

    }

    Context.prototype.loadPolicy = function (filename) {
        var policy = require(filename)
        for (key in policy) {
            this.policy[key] = policy[key]
        }
    }

    module.exports.Context = Context

    module.exports.run = function (context) {

        context.policy.detectProjects(context)

        if (context.projects.length == 0) {
            context.log.e('found not any project')
            process.exit(-1)
        }

        if (context.mainProject === undefined) {
            context.log.e('cannot detect main project, u can use --main-project to set this value manually')
            process.exit(-1)
        }

        manifestHandler.obtainPackageName(path.join(context.rootDir, path.join(context.mainProject, '/src/main/AndroidManifest.xml')), context)

        console.log(context.mainProject)

        for (var i in context.projects) {
            var xmlFile = path.join(context.rootDir, path.join(context.projects[i], 'AndroidManifest.xml'))
            if (!fs.existsSync(xmlFile)) {
                xmlFile = path.join(context.rootDir, path.join(path.join(context.projects[i], 'src/main'), 'AndroidManifest.xml'))
            }
            if (!fs.existsSync(xmlFile)) {
                context.log.w('skip project => ' + context.projects[i])
                continue
            } else {
                context.log.i('found ' + xmlFile)
                manifestHandler.rewrite(xmlFile, context)
            }
        }

        for(var i in context.projects) {
            var resPath = path.join(context.rootDir, path.join(context.projects[i], 'res'))
            if (!fs.existsSync(resPath)) {
                context.log.w('not fount res dir => ' + resPath)
            } else {
                context.log.i('found res dir => ' + resPath)
                pathScanner.each(resPath, function (currentPath, relativePath, filename) {
                    if (filename.match(/\.xml$/i)) {
                        resourceHandler.rewrite(currentPath, context)
                    }
                })
            }

            var srcPath = path.join(context.rootDir, path.join(context.projects[i], 'src'))
            if (!fs.existsSync(srcPath)) {
                context.log.w('not fount src dir => ' + srcPath)
            } else {
                context.log.i('found src dir => ' + srcPath)
                pathScanner.each(srcPath, function (currentPath, relativePath, filename) {
                    if (filename.match(/\.java$/i)) {
                        javaHandler.rewrite(currentPath, context)
                    }
                })
            }
        }

    }
})()
