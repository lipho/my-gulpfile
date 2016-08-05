var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var bs = require('browser-sync').create();
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var _ = require('lodash');
var buffer = require('vinyl-buffer');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');

var jsAssets = [];
var htmlAssets = [];
var cssAssets = [];
var bsWatchFiles = [];

function jsbundle() {
  var bun = function (jsAssets) {
    _.each(jsAssets, function (src) {
      var b = browserify(src).bundle().on('error', function (err) {
        console.log(err.toString());
        this.emit("end");
      });
      b.pipe(source(src))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(rename(function (src) {
        src.basename += '.min';
        src.extname = '.js';
      }))
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('.'));
    });
  };

  bun(jsAssets);
}

gulp.task('js', jsbundle);
gulp.task('css', function () {
  return gulp.src(['!public/css/*.min.css', 'public/css/*.*'])
  .pipe(sourcemaps.init())
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
  }))
  .pipe(cleanCSS({ compatibility: 'ie8' }))
  .pipe(rename(function (src) {
    src.basename += '.min';
    src.extname = '.css';
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/css'));
});

gulp.task('demon', function () {
  nodemon(require('./nodemon.json'))
  .on('start', function () {
    var started;
    if (!started) {

      cb();

      started = true;
    }
  })
  .on('error', gutil.log)
  .on('restart', function () {
    console.log('Backend Restarting');
  });
});

gulp.task('bundle', ['js', 'css']);
gulp.task('reload', function () {
  bs.reload();
});

gulp.task('js-watch', ['js']);
gulp.task('css-watch', ['css']);

// use default task to launch Browsersync and watch JS files
gulp.task('serve', ['demon'], function () {
  var port = process.env.PORT || '3000';
  bs.init(
    {
      files: [bsWatchFiles],
      proxy: 'localhost:' + port,
      port: 3001,
      open: false,
    }
  );
});

gulp.task('watch', function () {
  setTimeout(function () {
    gulp.watch(htmlAssets, ['reload']);
    gulp.watch(['!public/css/*.min.css', cssAssets], ['css-watch']);
    gulp.watch(['!public/js/*.min.js', jsAssets], ['js-watch']);
  }, 5000);
});

gulp.task('default', ['bundle', 'serve', 'watch']);

//TODO: Optimize
