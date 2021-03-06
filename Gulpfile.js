/**
 * + Gulpfile
 * =====================================================================
 */
'use strict';

var _            = require('lodash'),
    autoPlug     = require('auto-plug'),
    autoprefixer = require('autoprefixer-core'),
    csswring     = require('csswring'),
    del          = require('del'),
    gulp         = require('gulp'),
    highlightjs  = require('highlight.js'),
    jade         = require('jade'),
    Metalsmith   = require('metalsmith'),
    minimist     = require('minimist'),
    moment       = require('moment'),
    mqpacker     = require('css-mqpacker'),
    path         = require('path'),
    runSequence  = require('run-sequence'),
    uglify       = require('uglify-js'),
    util         = require('util');

// external data
var config = require(process.cwd() + '/GulpConfig.js'),
    pkg    = require(process.cwd() + '/package.json');

// auto-require gulp plugins
var g  = autoPlug({ prefix: 'gulp', config: pkg }),
    ms = autoPlug({ prefix: 'metalsmith', config: pkg });


/**
 * + Error handling
 * =====================================================================
 */

function handleError(err) {
    g.util.log(err.toString());
    this.emit('end');
}

/* = Error handling */


/**
 * + Parse CLI params
 * =====================================================================
 */

var params = (function(p){
        var cliParams = minimist(process.argv.slice(2));
        p.environment = cliParams.environment || cliParams.env || process.env.NODE_ENV || config.gulpParams.environment || 'production';
        return p;
    })({});

/* = Parse CLI params */


/**
 * + Stylus / CSS processing
 * =====================================================================
 */

gulp.task('build:css', function() {
    return gulp

        // grab all stylus files in stylus root folder
        .src(config.paths.assetsDev + '/stylus/*.styl')

        // pipe through stylus processor
        .pipe(g.stylus(config.stylus).on('error', handleError))

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init({
            loadMaps: true
        }))

        // pipe through postcss processor
        .pipe(g.postcss((function(postcssPlugins){
                // minify only when in production mode
                if (params.environment === 'production') {
                    postcssPlugins.push(csswring(config.csswring));
                }
                return postcssPlugins;
            })([
                autoprefixer(config.autoprefixer),
                mqpacker
            ])
        ).on('error', handleError))

        // pipe through csslint if in development mode
        .pipe(g.if(
            params.environment === 'development',
            g.csslint(config.csslint)
        ))
        .pipe(g.csslint.reporter())

        // write sourcemaps
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed styles
        .pipe(gulp.dest(path.join(config.paths.assets, 'css')))

        // live-reload
        .pipe(g.connect.reload());;

});

/* = Stylus / CSS processing */


/**
 * + Javascript processing
 * =====================================================================
 */

gulp.task('build:js', function() {
    return gulp

        // grab all coffeescript files in coffescript root folder
        .src([
            path.join(config.paths.node, 'd3/d3.js'),
            path.join(config.paths.bower, 'textures/textures.js'),
            path.join(config.paths.assetsDev, 'js/main.js')
        ])

        .pipe(g.concat('main.js'))

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init())

        // uglify if in production mode
        .pipe(g.if(
            params.environment === 'production',
            g.uglify()
        ))

        // write sourcemaps containing inline sources
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed javascripts
        .pipe(gulp.dest(path.join(config.paths.assets, 'js')))

        // live-reload
        .pipe(g.connect.reload());;

});

/* = Javascript processing */


/**
 * + Custom jade filters
 * =====================================================================
 */

// uglify inline scripts if in production mode
jade.filters.uglify = function(data, options) {
    return params.environment === 'production' ? uglify.minify(data, {fromString: true}).code : data;
}

/* = Custom jade filters */


/**
 * + Metalsmith rendering
 * =====================================================================
 */

gulp.task('build:site', function(done) {

    // parse metadata depending on environment
    _.forEach(config.metadata.environments, function(values, env) {
        if (params.environment===env) {
            config.metadata = _.merge(config.metadata, values);
        }
    });

    // localize moment
    moment.locale(config.metadata.locale[0]);

    // jade options
    var jadeLocals = {
            moment: moment,
            environment: params.environment
        },
        jadeOptions = {
            pretty: params.environment=='development' ? true : false,
            directory: path.relative(config.paths.root, config.paths.templates),
        };

    // set default template to a metalsmith stream
    function defaultTemplate(template) {
        return ms.each(function(file, filename) {
            if (!file.template && file.template!==null) {
                file.template = template;
            }
        });
    }

    // go metalsmith!
    var metalsmith = new Metalsmith(config.paths.root);
    metalsmith
        // set basic options
        .source(config.paths.site)
        .destination(config.paths.web)
        .metadata(config.metadata)
        .clean(false)

        // enable drafts
        .use(ms.drafts())

        // collections
        .use(ms.collections({
            projects: {
                pattern: 'referenzen/projekte/*.md',
                sortBy: 'year',
                reverse: true
            }
        }))

        // render markdown
        .use(ms.branch([
                '**/*.md'
            ])
            .use(ms.markdown(_.merge(config.marked, {
                highlight: function (code) {
                    return highlightjs.highlightAuto(code).value;
                }
            })))
        )

        // render jade files
        .use(ms.branch([
                '**/*.jade'
            ])
            .use(ms.jade(_.merge({
                locals: _.merge(metalsmith.metadata(), config.metadata, jadeLocals)
            }, jadeOptions)))
        )

        // generate excerpts
        .use(ms.betterExcerpts())

        // parse content
        .use(ms.branch([
                '**/*.html',
                '!referenzen/projekte/**/*'
            ])
            .use(defaultTemplate('page.jade'))
            .use(ms.permalinks({
                relative: false
            }))
        )

        // parse content
        .use(ms.branch([
                'referenzen/projekte/**/*'
            ])
            .use(defaultTemplate('projekt.jade'))
            .use(ms.permalinks({
                relative: false
            }))
        )

        // set absolute urls
        .use(ms.branch([
                '**/*.html'
            ])
            .use(ms.each(function(file, filename) {
                file.url = config.metadata.baseUrl + file.path;
            }))
        )

        // render templates
        .use(ms.templates(_.merge({
            engine: 'jade'
        }, jadeOptions, jadeLocals)))

        // put everything together...
        .build(function(err) {
            if (err) {
                throw err;
            }
            done();
        });

});

/* = Metalsmith rendering */


/**
 * + Copy tasks
 * =====================================================================
 */


// create copy tasks
var copySequence = [];
Object.keys(config.copyTasks).forEach(function(name) {
    var task = config.copyTasks[name],
        taskName = 'copy:' + name;
    if (!task.hasOwnProperty('baseCwd')) {
        task.baseCwd = config.paths.bower;
    }
    gulp.task(taskName, function() {
        return gulp
            .src(task.src, {
                cwd: path.join(task.baseCwd, task.cwd),
                base: path.join(task.baseCwd, task.cwd)
            })
            .pipe(g.if(task.hasOwnProperty('extReplace'), g.extReplace(task.extReplace)))
            .pipe(gulp.dest(path.join(config.paths[task.intoDev ? 'assetsDev' : 'assetsSrc'], 'vendor', name)));
    });
    copySequence.push(taskName);
});

// copy all dependencies
gulp.task('copy:deps', ['clean:deps'], function(done) {
    runSequence(copySequence, done);
});

/* = Copy tasks */


/**
 * + Config sync task
 * =====================================================================
 */

gulp.task('config-sync', function() {
    return gulp
        .src(path.join(config.paths.root, 'bower.json'))
        .pipe(g.configSync(config.configSync))
        .pipe(gulp.dest('.'));
});

/* = Config sync task */


/**
 * + Clean Tasks
 * =====================================================================
 */

// clean generated content
gulp.task('clean:web', function(done) {
    del(config.paths.web, done);
});

// clean all dependencies
gulp.task('clean:deps', function(done) {
    del([
        path.join(config.paths.assets, 'vendor'),
        path.join(config.paths.assetsDev, 'vendor')
    ], done);
});

/* = Clean Tasks */


/**
 * + Watch Task
 * =====================================================================
 */

gulp.task('watch', function() {

    // show watch info in console
    function logWatchInfo(event) {
        var eventPath = path.relative(config.paths.root, event.path);
        g.util.log('File \'' + g.util.colors.cyan(eventPath) + '\' was ' + g.util.colors.yellow(event.type) + ', running tasks...');
    }

    // create watch tasks
    Object.keys(config.watchTasks).forEach(function(key) {
        var task = config.watchTasks[key];
        gulp.watch(task.glob, _.merge({ cwd: task.cwd }, config.watch), function(event) {
            logWatchInfo(event);
            if (_.isArray(task.start)) {
                runSequence.apply(this|gulp, task.start);
            }
            else {
                gulp.start(task.start);
            }
        });
    });

});

/* = Watch Task */


/**
 * + Server Task
 * =====================================================================
 */

gulp.task('livereload', function() {
    gulp.src(config.paths.web)
        .pipe(g.connect.reload());
});

gulp.task('serve', function() {
    g.connect.server({
        port: 8080,
        root: config.paths.web,
        livereload: true
    });
});

/* = Server Task */


/**
 * + SVG Cleanup Task
 * =====================================================================
 */
gulp.task('svgmin', function() {
    return gulp
        .src(config.paths.assetsDev + '/img/raw/*.svg')
        .pipe(g.svgmin({
            js2svg: {
                pretty: true
            },
            plugins: [{
                cleanupIDs: false
            }, {
                mergePaths: false
            }, {
                removeTitle: true
            }]
        }))
        .pipe(gulp.dest(config.paths.assetsDev + '/img'));
});
/* = SVG Cleanup Task */


/**
 * + Deploy and Sync Tasks
 * =====================================================================
 */

gulp.task('deploy', function(done) {
    params.environment = 'production';
    runSequence(
        'build',
        'rsync',
        done
    );
});

gulp.task('rsync', function() {
    return gulp
        .src(config.paths.web)
        .pipe(g.rsync(config.rsync));
});

/* = Deploy and Sync Tasks */


/**
 * + Common tasks
 * =====================================================================
 */

// default task
gulp.task('default', ['build']);

// full build
gulp.task('build', ['copy:deps', 'config-sync', 'clean:web'], function(done) {
    runSequence(
        ['build:css', 'build:js'],
        'build:site',
        done
    );
});

// build, serve and watch
gulp.task('dev', ['build'], function() {
    gulp.start('serve', 'watch');
});

/* = Common tasks */


/* = Gulpfile */
