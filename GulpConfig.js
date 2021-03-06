/**
 * + Gulp Config
 * =====================================================================
 */

module.exports = (function(config) {

    // required packages
    var crypto = require('crypto'),
        fs     = require('fs'),
        path   = require('path');

    // data
    var cwd   = process.cwd(),
        pkg   = require(cwd + '/package.json');
        bower = require(cwd + '/bower.json');

    /**
     * + Paths
     * =====================================================================
     */

    config.paths = (function(p) {
        p.root      = cwd;
        p.node      = path.join(p.root, 'node_modules');
        p.bower     = path.join(p.root, 'bower_components');
        p.src       = path.join(p.root, 'src');
        p.web       = path.join(p.root, 'web');
        p.site      = path.join(p.src,  'site');
        p.templates = path.join(p.src,  'templates');
        p.assetsSrc = path.join(p.site, 'assets');
        p.assetsDev = path.join(p.src,  'assets-dev');
        p.assets    = path.join(p.web,  'assets');
        return p;
    })({});

    /* = Paths */


    /**
     * + Metadata (available in templates)
     * =====================================================================
     */

    // personal data
    config.cnrb = {
        name: 'Crishan Böhner',
        description: 'Crishan malte nur, wenn er musste!',
        email: 'c@electroc.de',
        url: 'http://electroc.de/',
        phone: '+4917631718040',
        phone_formatted: '+49 176 31718040',
        address: 'Studio-U\nUrbanstraße 64',
        zip: '10967',
        city: 'Berlin',
        country: {
            short: 'DE',
            long: 'Deutschland'
        }
    };

    config.cnrb.profiles = {
        cv_pdf: {
            label: 'Lebenslauf',
            title: 'Lebenslauf von ' + config.cnrb.name,
            url: '/files/lebenslauf.pdf'
        },
        projects_pdf: {
            label: 'Referenzen',
            title: 'Referenzen von ' + config.cnrb.name,
            url: '/files/referenzen.pdf'
        },
        linkedin: {
            label: 'linkedin',
            title: config.cnrb.name + ' @ linkedin',
            url: '//de.linkedin.com/in/crishan/'
        },
        xing: {
            label: 'Xing',
            title: config.cnrb.name + ' @ Xing',
            url: '//www.xing.com/profile/Crishan_Boehner'
        }
    };

    config.nav = {
        portfolio: {
            label: 'Referenzen',
            path: '/referenzen/'
        },
        about: {
            label: 'Über',
            path: '/ueber/'
        },
        contact: {
            label: 'Kontakt',
            path: '/kontakt/'
        }
    };

    // static metadata
    config.metadata = {
        siteTitle:          config.cnrb.name,
        siteUrl:            config.cnrb.url.replace(/^http(s)?\:/i, ''),
        cnrb:               config.cnrb,
        nav:                config.nav,
        siteDescription:    config.cnrb.description,
        locale:             ['de', 'de_DE'],
        dateFormat:         'Do MMM YYYY',
        dateFormatShort:    'DD.MM.YY',
        dateFormatLong:     'dddd, Do MMMM YYYY'
    };

    // metadata changes depending on environment
    config.metadata.environments = {
        development: {
            siteUrl:        '//localhost:8888/',
        }
    };

    /* = Metadata (available in templates) */


    /**
     * + Functions (available in templates)
     * =====================================================================
     */
    config.metadata.fn = {};

    // get dependency version from package.json or bower.json
    config.metadata.fn.getDependencyVersion = function(dep, data, dev) {
        data = data=='bower' ? bower : pkg;
        dev = dev===undefined ? true : dev;
        data = data[(dev?'devD':'d') + 'ependencies']
        return data.hasOwnProperty(dep) ? data[dep].replace(/[^.0-9]/g, '') : '';
    };

    // get the contents of a file
    config.metadata.fn.fileContents = function(file) {
        return fs.readFileSync(path.join(config.paths.root, file));
    };

    // get the hash of a string
    config.metadata.fn.hash = function(string, algorithm) {
        if (!algorithm || crypto.getHashes().indexOf(algorithm)===-1) {
            algorithm = 'md5';
        }
        return crypto
            .createHash(algorithm)
            .update(string, 'utf8')
            .digest('hex');
    };

    // get a gravatar url
    config.metadata.fn.gravatar = function(size, email) {
        var hash = config.metadata.fn.hash(email || config.cnrb.email, 'md5');
        return '//gravatar.com/avatar/' + hash + '.png' + (size ? '?s=' + size : '');
    };

    /* = Functions (available in templates) */


    /**
      * + Gulp module options
      * =====================================================================
      */

    // gulp default params
    config.gulpParams = {
        environment: 'production'
    };

    // global watch task options
    config.watch = {
        mode: 'auto'
    };

    // stylus options
    config.stylus = {
        // add imports and vendor folders to @import path
        paths: [
            path.join(config.paths.assetsDev, 'stylus/imports'),
            path.join(config.paths.assetsDev, 'vendor'),
            path.join(config.paths.assetsDev, 'img')
        ],
        // function for generating base64 data-uris
        url: {
            name: 'inline-url',
            limit: false
        },
        // create sourcemaps containing inline sources
        sourcemap: {
            inline: true,
            sourceRoot: '.',
            basePath: path.join(path.relative(config.paths.web, config.paths.assets), 'css')
        }
    };

    // autoprefixer options
    config.autoprefixer = {
        browsers: [
            'last 2 versions',
            '> 2%',
            'Opera 12.1',
            'Firefox ESR'
        ]
    };

    // csslint options
    // https://github.com/CSSLint/csslint/wiki/Rules-by-ID
    config.csslint = {
        'adjoining-classes': false,
        'box-model': false,
        'box-sizing': false,
        'bulletproof-font-face': false,
        'compatible-vendor-prefixes': false,
        'fallback-colors': false,
        'font-faces': false,
        'font-sizes': false,
        'ids': false,
        'important': false,
        'known-properties': false,
        'outline-none': false,
        'qualified-headings': false,
        'unique-headings': false,
        'universal-selector': false
    };

    // config sync options
    // https://github.com/danlevan/gulp-config-sync
    config.configSync = {
        fields: [
            'name',
            'version',
            'description',
            'keywords',
            'version',
            'private'
        ],
        space: 2
    };

    // watch task defintions
    config.watchTasks = {
        stylus: {
            glob: '**/*.styl',
            cwd: path.join(config.paths.assetsDev, 'stylus'),
            start: 'build:css'
        },
        js: {
            glob: '**/*.js',
            cwd: path.join(config.paths.assetsDev, 'js'),
            start: 'build:js'
        },
        site: {
            glob: [
                'site/**/*',
                'templates/**/*',
                '!site/assets/vendor/**/*'
            ],
            cwd: config.paths.src,
            start: [
                'build:site',
                'livereload'
            ]
        }
    };

    // copy task definitions
    config.copyTasks = {
        collection: {
            src: '**/*',
            cwd: 'collection.stylus/src/stylus',
            baseCwd: config.paths.node,
            intoDev: true
        },
        jquery: {
            src: 'jquery.min.*',
            cwd: 'jquery/dist',
            baseCwd: config.paths.node
        }
    };

    // rsync config
    config.rsync = {
        root: config.paths.web,
        recursive: true,
        clean: true,
        hostname: 'libra.uberspace.de',
        username: 'electroc',
        destination: '/var/www/virtual/electroc/electroc.de',
        progress: true
    };

    /* = Gulp module options */


    return config;
})({});

/* = Gulp Config */
