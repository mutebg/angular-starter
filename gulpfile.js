// svg to font - http://stefanimhoff.de/2014/gulp-tutorial-6-images-vector-fonts/

var gulp = require("gulp");
var streamqueue = require("streamqueue");
var gutil = require("gulp-util");
var clean = require('gulp-clean');
var concat = require("gulp-concat");
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');

// Pre-Processors
var sass = require('gulp-sass');


// Minification
var uglify = require("gulp-uglify");
var minifyHTML = require("gulp-minify-html");
var minifyCSS = require("gulp-minify-css");
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

// Angular Helpers
var ngAnnotate = require("gulp-ng-annotate");
var templateCache = require('gulp-angular-templatecache');

// Dev Server
var browserSync = require('browser-sync').create();
var notify = require("gulp-notify");

// Config
var config = {
  serverPort: 8080,
	templateModule: 'app.templates'
}

var paths = {
	app: {
		scripts: [
      '!src/assets/**.*',
			'src/**/*.js',
      'src/app.js',
		],
		styles: ['src/**/*.scss'],
		templates: ['src/**/*.tpl.html'],
		images: ['src/assets/images/**/*.{png,jpg,jpeg,gif}'],
		copy: {
      'src/index.html': 'dest/',
    }
	},

	vendor: {
		scripts: [
      "bower_components/angular/angular.js",
      ],
    styles: [
    ]
	},

  output: {
    base: 'dest/',
    script_file: 'app.js',
    scripts_folter: 'dest/js/',
    style_file: 'app.css',
    styles_folder: 'dest/css/',
    images: 'dest/assets/images/',
  }

}

// SCRIPT-RELATED TASKS
// =================================================
// Compile, concatenate, and (optionally) minify scripts
// Also pulls in 3rd party libraries and convertes
// angular templates to javascript
// =================================================
// Gather 3rd party javascripts
function compileVendorScripts() {
	return gulp.src(paths.vendor.scripts)
}

// Anotate Angular scripts
function compileAppScripts() {
	return gulp.src(paths.app.scripts)
    	.pipe(ngAnnotate())
      .on("error", notify.onError("Error: <%= error.message %>"));
};


// Cache angular templates
function compileTemplates() {
 	return gulp.src(paths.app.templates)
   		.pipe(templateCache({
	        root: "",
	        standalone: false,
	        module: config.templateModule
	      }))
}


// Concatenate all JS into a single file
// Streamqueue lets us merge these 3 JS sources while maintaining order
function concatenateAllScripts() {
	return streamqueue({
		objectMode: true
	}, compileVendorScripts(), compileAppScripts(), compileTemplates()).pipe(concat( paths.output.script_file))
}

function concatenateAllStyles() {
 	return streamqueue({
 		objectMode: true
 	}, compileAppStyles() ).pipe( concat(paths.output.style_file));
}

// Compile and concatenate all scripts and write to disk
function buildScripts(minify) {
  var scripts = concatenateAllScripts();

  if ( minify ) {
  	scripts = scripts.pipe( uglify() )
	}

  return scripts.pipe( gulp.dest(paths.output.scripts_folter) )
    .pipe( browserSync.stream() );
}

gulp.task("scripts", function() {
  return buildScripts();
});

gulp.task("deploy_scripts", function() {
  return buildScripts(true);
});
// =================================================



// STYLSHEETS
// =================================================
// Compile, concatenate, and (optionally) minify stylesheets
// =================================================
// Gather CSS files and convert scss to css
function compileAppStyles() {
  return gulp.src(paths.app.styles).pipe(gulpif(/[.]scss/, sass({
    sourcemap: false,
    unixNewlines: true,
    style: 'nested',
    debugInfo: false,
    quiet: false,
    lineNumbers: true,
    bundleExec: true,
    //loadPath: ["vendor/bower/twbs-bootstrap-sass/assets/stylesheets/", "vendor/bower/font-awesome/scss/"] //@TODO
  })
  //.on('error', gutil.log )));
  .on("error", notify.onError("Error: <%= error.message %>"))));
};

// Compile and concatenate css and then write to disk
function buildStyles(minify) {
  var styles = concatenateAllStyles();
  if (minify) {
    styles = styles.pipe( minifyCSS() );
  }
  return styles
    .pipe( autoprefixer({
      browsers: ['last 5 versions'],
      cascade: false
    }))
    .pipe( gulp.dest( paths.output.styles_folder ) )
    .pipe( browserSync.stream() );
};

gulp.task("styles", function() {
  return buildStyles();
});

gulp.task("deploy_styles", function() {
  return buildStyles(true);
});
// =================================================



// IMAGES
// =================================================
// Gather and compress images
function compressImages() {
  return gulp.src(paths.app.images).pipe(imagemin({
    progressive: true,
    svgoPlugins: [
      {
        removeViewBox: false
      }
    ],
    use: [pngcrush()]
  }));
};

// Optimize and move images
function buildImages() {
  return compressImages().pipe( gulp.dest( paths.output.images) )
    .pipe( browserSync.stream() );
};

gulp.task("images", function() {
  return buildImages();
});
// =================================================


// COPY STATIC FILES
// =================================================
// Copy static files
// =================================================
function buildStatic() {
  for( from in paths.app.copy ) {
    var to = paths.app.copy[ from ];
    if ( from ) {
      gulp.src( from )
        .pipe( gulp.dest( to ) )
        .pipe( browserSync.stream() );
    }
  }

	return
}

gulp.task("static", function() {
  return buildStatic();
});


// CLEAN
// =================================================
// Delete contents of the build folder
// =================================================
gulp.task("clean", function() {
   return gulp.src('dest', {read: false}).pipe(clean());
});



// WATCH
// =================================================
// Watch for file changes and recompile as needed
// =================================================
gulp.task('watch', function() {
  gulp.watch([paths.app.scripts, paths.app.templates, paths.vendor.scripts], ['scripts']);
  gulp.watch([paths.app.styles], ['styles']);
  gulp.watch( Object.keys(paths.app.copy), ['static']);
  return gulp.watch([paths.app.images], ['images']);
});



// LOCAL SERVER
// =================================================
// Run a local server, including LiveReload and
// =================================================
gulp.task('server', function(){
	browserSync.init({
    server: {
      baseDir: paths.output.base,
    },
    port: config.serverPort
  });
});

gulp.task("compile", ["clean"], function() {
  return gulp.start("scripts", "styles", "images", "static");
});

gulp.task('deploy', ['clean'], function() {
  return gulp.start("deploy_scripts", "deploy_styles", "images", "static");
});

gulp.task("default", ["clean"], function() {
  return gulp.start("scripts", "styles", "images", "static", "server", "watch");
});
