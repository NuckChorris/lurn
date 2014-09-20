// Not Gulp Plugins
var path     = require('path');
var gulp     = require('gulp');
var del      = require('del');
var lazypipe = require('lazypipe');
// General
var gulpif      = require('gulp-if');
var sourcemaps  = require('gulp-sourcemaps');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var bowerFiles  = require('main-bower-files');
var mergeStream = require('merge-stream');
// JS
var esnext    = require('gulp-esnext');
var esmodules = require('gulp-es6-module-transpiler');
var uglify    = require('gulp-uglify');
var jshint    = require('gulp-jshint');
var defs      = require('gulp-defs');
// CSS
var less = require('gulp-less');


var paths = {
	scripts: ['src/js/**/*'],
	styles: ['src/css/app.less'],
	images: ['src/img/**/*'],
	pages: ['**/*.htm']
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
	var args = Array.prototype.slice.call(arguments, 1);
	return function () {
		return gulpif(indev, fn.apply(null, args));
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
	.pipe(ifdev(uglify))
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
		.pipe(ifdev(hint)())
		.pipe(es6())
		.pipe(gulp.dest('build/js'));
});

gulp.task('vendor', function () {
	return vendorTree('./vendor.json')
		.pipe(ifdev(sourcemaps.init)())
		.pipe(ifdev(uglify)())
		.pipe(rename(function (f) {
			f.dirname = f.dirname.replace('-amd', '')
		}))
		.pipe(ifdev(sourcemaps.write)())
		.pipe(gulp.dest('build/js/vendor'));
});

gulp.task('pages', function () {
	return gulp.src(paths.pages)
		.pipe(gulp.dest('build'));
});

gulp.task('default', ['scripts', 'vendor', 'pages']);
