
const gulp      = require('gulp'),
  $             = require('gulp-load-plugins')(),
  rimraf        = require('rimraf'),
  path          = require('path'),
  fs            = require('fs')

gulp.task('clean', () => rimraf.sync('dest/*'))

gulp.task('pug', () => {
  gulp.src('src/pug/index.pug')
    .pipe($.pug({pretty: true}))
    .on('error',e => {})
    .pipe(gulp.dest('./dest'))

  fs.readdir('./src/books', (err, files) => {
    files.map(e => `./src/books/${e}`)
      .filter(f => fs.statSync(f).isFile() && ( /.*\.jpg$/.test(f) || /.*\.png$/.test(f) ))
      .forEach(f => {
        gulp.src(f)
          .pipe($.rename(`thumbnail${path.extname(f)}`))
          .pipe(gulp.dest(`./dest/books/${f.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1]}/`))
      })

    let bookdata = files.map(e => `./src/books/${e}`)
      .filter(f => fs.statSync(f).isFile() && /.*\.json$/.test(f))
      .map((f) => {
        let data = JSON.parse(fs.readFileSync(f))
        data["image"] = `thumbnail${path.extname(data.image)}`
        gulp.src('src/pug/books.pug')
          .pipe($.data(ff =>
            ({ data: data })
          ))
          .pipe($.pug({pretty: true}))
          .on('error',e => {})
          .pipe($.rename(`index.html`))
          .pipe(gulp.dest(`./dest/books/${path.basename(f,'.json')}/`))

        gulp.src('src/pug/errata.pug')
          .pipe($.data(ff =>
            ({ data: data })
          ))
          .pipe($.pug({pretty: true}))
          .pipe($.rename(`index.html`))
          .pipe(gulp.dest(`./dest/books/${path.basename(f,'.json')}/errata/`))

        data["id"] = path.basename(f,'.json')
        return data
      })

    console.log(bookdata)

    gulp.src('./src/pug/books-index.pug')
      .pipe($.data(f =>
        ({ bookdata: bookdata })
      ))
      .pipe($.pug({pretty: true}))
      .on('error',e => {})
      .pipe($.rename('index.html'))
      .pipe(gulp.dest('./dest/books'))

  })
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
