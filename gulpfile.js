var gulp = require('gulp'),
  del = require('del'),
  babel = require('gulp-babel');

gulp.task('default', function () {
  // place code for your default task here
});

gulp.task('clean', function () {
  return del(['./dist'], { force: true });
});

gulp.task('build', gulp.series('clean', function () {
  return gulp.src('./src/framework/**/*.js')
    .pipe(babel({
      plugins: ['@babel/plugin-proposal-class-properties'],
      presets: ['@babel/env', '@babel/react']
    }))
    .pipe(gulp.dest('./dist'));
}));

//
// gulp.task('clean-client-less', function() {
//     return del(['../src/client/lib/bootstrap/css/custom'], {force: true});
// });
//
// gulp.task('build-client-less', ['clean-client-less'], function() {
//     var config = {
//         src: '../src/client/lib/bootstrap/less/bootstrap.less',
//         dest: '../src/client/lib/bootstrap/css/custom'
//     };
//     return gulp.src(config.src)
//         .pipe(less())
//         .pipe(autoprefixer({cascade: false, browsers: ['last 2 versions']}))
//         .pipe(gulp.dest(config.dest, {overwrite: true}));
// });

