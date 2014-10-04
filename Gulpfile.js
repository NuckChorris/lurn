// Not Gulp Plugins
var path     = require('path');
var gulp     = require('gulp');
var del      = require('del');
var lazypipe = require('lazypipe');
// Fix Pipes
var plumber = require('gulp-plumber');
// General
var gulpif      = require('gulp-if');
var sourcemaps  = require('gulp-sourcemaps');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var bowerFiles  = require('main-bower-files');
var mergeStream = require('merge-stream');
// Watching
var watch      = require('gulp-watch');
var livereload = require('gulp-livereload');
var notify     = require('gulp-notify');
// JS
var esnext    = require('gulp-esnext');
var esmodules = require('gulp-es6-module-transpiler');
var uglify    = require('gulp-uglify');
var jshint    = require('gulp-jshint');
var defs      = require('gulp-defs');
// CSS
var less         = require('gulp-less');
var minifycss    = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
// Templates
var react   = require('gulp-react');
// Images
var imagemin = require('imagemin');


var paths = {
	scripts: ['src/js/**/*.js'],
	styles: ['src/css/**/*.less'],
	templates: ['src/js/**/*.jsx'],
	images: ['src/img/**/*'],
	pages: ['src/**/*.{htm,html}']
};


/**
 * Utility Functions
 */
var indev = (process.env.ENV === 'development');
function vendorTree (tree) {
	var tree = require(tree);
	var trees = [];

	for (var name in tree) {
		if (tree.hasOwnProperty(name)) {
		(function (name, pkg) {
			var rel = function (p) { return path.join('bower_components', name, p); };
			if (pkg.main) {
				trees.push(gulp.src(rel(pkg.main))
					.pipe(rename({basename: name, dirname: ""})));
			}
			if (pkg.more) {
				trees.push(gulp.src(rel(pkg.more))
					.pipe(rename(function (f) {
						f.dirname = path.join(name, f.dirname);
					})));
			}
		})(name, tree[name]);
		}
	}
	return mergeStream.apply(null, trees);
}

function ifdev (fn) {
	return function () {
		return gulpif(indev, fn.apply(null, arguments));
	}
}
function ifnotdev (fn) {
	return function () {
		return gulpif(!indev, fn.apply(null, arguments));
	}
}


/*
 * Pipelines
 */
var es6 = lazypipe()
	.pipe(ifdev(sourcemaps.init))
	.pipe(esnext)
	.pipe(esmodules, {type: 'amd'})
	.pipe(defs, {disallowUnknownReferences: false})
	.pipe(ifnotdev(uglify))
	.pipe(ifdev(sourcemaps.write));
var hint = lazypipe()
	.pipe(jshint, {debug: indev, devel: indev})
	.pipe(jshint.reporter, 'jshint-stylish');


/**
 * Tasks
 */
gulp.task('clean', function(cb) {
	del(['build'], cb);
});

gulp.task('scripts', function () {
	return gulp.src(paths.scripts)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.scripts, {name: 'scripts'}))
		.pipe(ifdev(hint)())
		.pipe(es6())
		.pipe(gulp.dest('build/js'))
		.pipe(notify())
		.pipe(ifdev(livereload)());
});

gulp.task('templates', function () {
	return gulp.src(paths.templates)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.templates, {name: 'templates'}))
		.pipe(react())
		.pipe(es6())
		.pipe(gulp.dest('build/js'))
		.pipe(notify())
		.pipe(ifdev(livereload)());
});

gulp.task('vendor', function () {
	return vendorTree('./vendor.json')
		.pipe(plumber())
		.pipe(ifdev(sourcemaps.init)())
		.pipe(uglify())
		.pipe(rename(function (f) {
			f.dirname = f.dirname.replace('-amd', '')
		}))
		.pipe(ifdev(sourcemaps.write)())
		.pipe(gulp.dest('build/js/vendor'));
});

gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.styles, {name: 'styles'}))
		.pipe(ifdev(sourcemaps.init)())
		.pipe(less())
		.pipe(autoprefixer())
		.pipe(ifnotdev(minifycss)())
		.pipe(ifdev(sourcemaps.write)())
		.pipe(gulp.dest('build/css'))
		.pipe(notify())
		.pipe(ifdev(livereload)());
});

gulp.task('images', function () {
	return gulp.src(paths.images)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.images, {name: 'images'}))
		.pipe(gulp.dest('build/img'))
		.pipe(notify())
		.pipe(ifdev(livereload)());
//		.pipe(imagemin())
});

gulp.task('pages', function () {
	return gulp.src(paths.pages)
		.pipe(plumber())
		.pipe(ifdev(watch)(paths.pages, {name: 'pages'}))
		.pipe(gulp.dest('build'))
		.pipe(notify())
		.pipe(ifdev(livereload)());
});

gulp.task('default', ['scripts', 'vendor', 'pages', 'styles', 'images', 'templates']);
