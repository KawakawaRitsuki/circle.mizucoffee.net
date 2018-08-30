
const gulp      = require('gulp'),
  $             = require('gulp-load-plugins')(),
  rimraf        = require('rimraf'),
  fs            = require('fs')

gulp.task('clean', () => rimraf.sync('dest/*'))

gulp.task('pug', () => {
  gulp.src('src/pug/index.pug')
    .pipe($.pug({pretty: true}))
    .on('error',e => {})
    .pipe(gulp.dest('./dest'))

  fs.readdir('./src/books', (err, files) =>
    files.map(e => `./src/books/${e}`)
      .filter(f => fs.statSync(f).isFile() && /.*\.json$/.test(f))
      .forEach((f) => {
        gulp.src('src/pug/books.pug')
          .pipe($.data(ff =>
            ({ data: JSON.parse(fs.readFileSync(f)) })
          ))
          .pipe($.pug({pretty: true}))
          .on('error',e => {})
          .pipe($.rename(`${f.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1]}.html`))
          .pipe(gulp.dest('./dest/books'))
        console.log(f)
      })
  )
})

gulp.task('js', () => {
  gulp.src('./src/js/*')
    .pipe(gulp.dest('./dest'))
})

gulp.task('scss', () =>
  gulp.src('./src/scss/style.scss')
  .pipe($.plumber())
  .pipe($.sass())
  .pipe($.autoprefixer())
  .pipe(gulp.dest('./dest'))
)

gulp.task('res',() => {
  gulp.src('./res/**/*')
    .pipe(gulp.dest('./dest'))
})

gulp.task('default', ['clean','pug','js','scss','res'], () => {})

gulp.task('watch', ['default'], () => {
  gulp.watch('./src/scss/*',['scss'])
  gulp.watch(['./src/pug/*','./src/book/*'] ,['pug'])
  gulp.watch('./src/js/*'  ,['js'])
})
