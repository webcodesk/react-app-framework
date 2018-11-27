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
  return gulp.src(
    [
      './src/framework/**/*.js',
      '!./src/framework/**/__tests__',
      '!./src/framework/**/__tests__/**/*',
    ]
  )
    .pipe(babel({
      plugins: ['@babel/plugin-proposal-class-properties'],
      presets: ['@babel/env', '@babel/react']
    }))
    .pipe(gulp.dest('./dist'));
}));

