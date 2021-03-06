'use strict';

var path = require('path'),
    manifestHandler = require('../lib/handler/manifesthandler.js'),
    resourceHandler = require('../lib/handler/resourcehandler.js'),
    javaHandler = require('../lib/handler/javahandler.js'),
    defaultPolicy = require('../lib/core/defaultpolicy.js')

var context = {
    newPackageName : 'com.qihoo.appstore',
    policy : defaultPolicy,
    log : {
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
            console.log('d: ' + s)
        }
    },
    encoding : 'utf-8',
    returnSymbol : '\n',
    verbose : true,
    modifyProvider : true,
    modifyAction : true,
    modifyService : true
}

manifestHandler.obtainPackageName(path.join(__dirname, "usecase/testmanifest.xml"), context)

manifestHandler.rewrite(path.join(__dirname, "usecase/testmanifest.xml"), context)

resourceHandler.rewrite(path.join(__dirname, "usecase/testresource.xml"), context)

javaHandler.rewrite(path.join(__dirname, "usecase/testjava.java"), context)