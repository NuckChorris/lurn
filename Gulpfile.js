var path = require('path');
var gulp = require('gulp');
var esnext = require('gulp-esnext');
var es6moduleTranspiler = require('gulp-es6-module-transpiler');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var bowerFiles = require('main-bower-files');
var mergeStream = require('merge-stream');
var debug = require('gulp-debug');
var del = require('del');
var paths = {
	scripts: ['src/js/**/*'],
	styles: ['src/css/app.less'],
	images: ['src/img/**/*'],
	pages: ['**/*.htm']
};

gulp.task('clean', function(cb) {
	del(['build'], cb);
});

gulp.task('scripts', ['clean'], function () {
	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
		.pipe(esnext())
		.pipe(es6moduleTranspiler({
			type: 'amd'
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js'));
});

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

gulp.task('vendor', ['clean'], function () {
	return vendorTree('./vendor.json')
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(rename(function (f) {
			f.dirname = f.dirname.replace('-amd', '')
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js/vendor'));
});

gulp.task('pages', ['clean'], function () {
	return gulp.src(paths.pages)
		.pipe(gulp.dest('build'));
});

gulp.task('default', ['scripts', 'vendor', 'pages']);
