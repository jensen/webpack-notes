# building your own boilerplate with webpack

Notes and slides (webpack.pdf) available at [http://github.com/jensen/webpack-notes/]([http://github.com/jensen/webpack-notes/)

The [webpack documentation](https://webpack.js.org/configuration/) is good.

## Starting is Hard

Over the past eight weeks you have worked on a number of different projects using different technologies. With such a limited amount of time allocated to each project we have had to avoid more detailed teaching on how to setup the environment. Each project had a progressively more complex configuration. Starting with a basic express app and working towards a more complicated rails application you have been exposed to project configs that you may not understand.

With your final project it is likely you used an existing project template to work within. Today I would like to show you an approach that you could take for creating your own custom project configuration.

## Webpack

At the core of our project configuration is webpack. Webpack is a asset and code bundler. Our code is full of references to assets and other code. When you type `import` or `require` in your code you are referencing a dependency. The `@import` and `url()` in CSS are also ways to reference dependencies.

When given an entry point to your application, webpack will follow dependency references and collect all of the code into one or more bundles. The bundles are then available to be loaded by the browser. If any of the dependencies are assets, like images or fonts, then webpack can copy them to a distribution or build directory.

Webpack will allow you to apply transformations to the code and assets through loaders and plugins. This way we can convert .jsx files to .js or .scss files to .css. Once your static assets have been generated you can serve them any way you choose.

### Four Core Concepts

The reason webpack is so intimidating is because it has a lot of complicated features. The majority of the benefit can be gained from webpack once you understand the four core concepts.

1. inputs (webpack calls this entry)
2. outputs
3. loaders
4. plugins

**inputs**

> The file or files that serve as the starting point for the recursive dependency search.

In this example we create a new entry point for something called `app`, with an entry point that is a file called `index.js`. The `path.resolve()` function allows us to get the full path to the entry point based on our the location of our webpack config file.

```javascript
entry: {
  app: path.resolve(__dirname, '/index.js')
}
```

**outputs**

> The destination for your bundle or bundles.

Webpack knows about a bundle that we want to call `app` we can setup a location for that file in the `output` configuration. We need to provide a path where files are emitted and a filename. The configuration below will create a file called `app-generated.js` in the `build/js/` directory relative to your `webpack.config.js`.

```javascript
output: {
  filename: 'js/[name]-generated.js',
  path: path.resolve(__dirname, ‘build/‘)
}
```

**loaders**

> A series of file type patterns to test for and the approriate transform to apply to the dependencies that are found.

With `test` we can provide a regular express to match when looking at files. With the rule below we are applying a `file-loader` to each `.ttf` file. The file loader emits the font file to the **output** directory.

```javacript
module: {
  rules: [
    {
      test: /\.ttf$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/'
        }
      }
    }
  ]
}
```

**plugins**

> Plugins allow you to do everything a loader cannot do.

Sometimes we may have asset dependencies that we do not want to include in the dependency tree. If we want to reference an image using an `<img>` tag in html we could copy our images to the build directory. You can use relative paths or paths generated with the path module.

```javascript
plugins: [
  new CopyWebpackPlugin([
    {
      from: 'client/images',
      to: path.join(__dirname, 'build/images')
    }
  ])
]
```

## Setting up a Project

We can avoid **boilerplate** projects. There are a lot of them out there. I find that even with all of the choice that we have we end up having to choose something that is too old, or something that is too complicated. The more specific boilerplate projects end up growing stale and never get updated, the boilerplates that provide more customization are too complicated.

When designing your own project configuration you need to consider how you will be organizing your source files, and how you will need to organize your static assets that get served to the browser. There are infinite possibilities.

The different libraries you choose will have an impact on the design of your project configuration. It will also help you decide the types of loaders and plugins you will need when you configure webpack.

An example of what your source directory structure could look like for a basic React/Sass project:

```
client
  js/*.js/jsx
  scss/*.scss
  images/*.svg/png/jpg
  fonts/*.otf/ttf
  index.html
```

The output directory would be structured in a similar way the major difference is that it would only contain files that are supported by the target environment.

```
build
  js/*.js
  css/*.css
  images/*.svg/png/jpg
  fonts/*.otf/ttf
  index.html
```

You could also emit all of these files into a single directory.

It is a good idea to determine what requirements you have for your project configuration. Here are some examples.

1. I would like to use Sass to write my styles.
2. I would like my .css to be in a separate file, rather than embedded in my js bundle as a module.
3. I would like to write my JavaScript using es2015 features.
4. I would like to use .jsx syntax for my React components.
5. I would like to use a custom font.
6. I need a react mount point for my application in my html file.

## webpack.config.js

We need to install `webpack`.

```
npm i -S webpack
```

Webpack provides a JavaScript API and a CLI. Libraries like WebpackDevServer use the JavaScript API. Since we are installing webpack locally we need to use the path `./node_modules/.bin/webpack` to launch the CLI.

A `webpack.config.js` file must export an object containing the configuration for the project.

> Warning: The following examples don't follow convention for webpack configuration files. I have structured the example like this in order to compose my webpack config in a certain order. Please see webpack.config.js for a more conventional configuration.

```javascript
const config = {}

module.exports = config;
```

### Inputs

Let's start by configuring our inputs. In this example we have a single entry and we resolve the path relative to our `webpack.config.js`.

There are three ways to define entrie(s). We can pass a string representing a single entry, an array which would include a list of entry points or an object represting named entries.


```javascript
const path = require('path')

const paths = {
  app: path.resolve(__dirname, 'client/js/index.js')
}

/* as a single entry */
config.entry = paths.app
/* or as a list of entries */
config.entry = [ paths.app ]
/* or as named entries */
config.entry = { app: paths.app }
```

### Outputs

We need to configure where our bundles will go. The only required options for output are `filename` and `path`. We can use the `[name]` template to create a bundle named `app-generated.js`.

```javascript
paths.build = path.resolve(__dirname, 'build/')

config.output = {
  filename: 'js/[name]-generated.js',
  path: paths.build
}
```

At this point we can run the CLI from the root of our project. This will automatically pick up the `webpack.config.js` file in the same location. Expect to see `You may need an appropriate loader to handle this file type.`.

### Loaders

To convert our es2015 and jsx code to es5 JavaScript we can use `babel-loader`.

```
npm i -S babel-core babel-loader babel-preset-env babel-preset-es2015 babel-preset-react
```

This particular loader makes use of presets. The presets we will use are `env`, `es2015` and `react`. Presets configure the loader for the types of transpiling and polyfils necessary.

```javascript
const rules = []

config.module = {
  rules
}

rules.push({
  test: /\.jsx?/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['env', 'es2015', 'react']
    }
  }
})
```

This resolves the missing loader for JavaScript. You will notice the next missing loader will be for handling the Sass styles. We will need a loader for styles. There are three to install.

```
npm i -S style-loader css-loader sass-loader node-sass
```

```javascript
rules.push({
  test: /\.scss$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader'
  ]
})
```

The Sass styles have a dependency on the `Merriweather` font. We can make these available using a `file-loader`. This will copy files resolved through `url()` dependencies.

```javascript
rules.push({
  test: /\.ttf$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'fonts/'
    }
  }
})
```

When you run webpack again, it should emit the bundle and the fonts. Currently the CSS is being bundled in as a module in the .js asset file.

### Plugins

We need to provide an `index.html` file that can link the bundle and provide React with a mount point in the DOM. We can use a Plugin to generate this file.

```
npm i -S html-webpack-plugin
```

We have a template html file that we put a react mount point. Webpack will `inject` the outputs automatically into the file.

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

const plugins = [];

config.plugins = plugins

paths.template = path.resolve(__dirname, 'client/index.html')

plugins.push(new HtmlWebpackPlugin({
  filename: 'index.html',
  template: paths.template
}))
```

We can run the CLI and take a look at the static assets that webpack has emitted. One issue that becomes obvious is that the configuration doesn't copy the images to the static directory, our svg file is left behind. In our react component we are requesting the image using an `<img>` tag.

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin')

plugins.push(new CopyWebpackPlugin([
  { from: 'client/images', to: path.join(__dirname, 'build/images') }
]))
```

### Loaders & Plugins

We can combine loaders and plugins to help satisfy our final requirement. Currently the CSS is bundled in with the js. An initial requirement for this project was that the CSS was emitted as it's own file.

The rule for scss needs to be updated. We will use the ExtractTextWebpackPlugin.

```
npm i -S extract-text-webpack-plugin
```

We still use the `sass-loader` to convert Sass to CSS. The `css-loader` will resolve `import` and `url()` dependencies.

```javascript
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')

{
  test: /\.scss$/,
  use: ExtractTextWebpackPlugin.extract({
    fallback: 'style-loader',
    use: 'css-loader?!sass-loader'
  })
})
```

The loader can collect all of the CSS, but we need to use a plugin to write the resulting file to disk.

```javascript
plugins.push(new ExtractTextWebpackPlugin('css/app-generated.css'))
```

Since we have now changed the location of the CSS file, our relative paths to the fonts will stop working. We can easily resolve this by adding a `publicPath` property to our output configuration.

```javascript
config.output.publicPath = '/'
```

### Development

While we are developing our application there are tools associated with webpack that are quite helpful.

**sourcemaps**

We can enable the use of source maps.

```
config.devtool = 'eval-source-map'
```

There are many different options with their own pros and cons. Some are suited for development, and other are suited for production. See specific [documentation](https://webpack.js.org/configuration/devtool/) for more options.

**webpack-dev-server**

We can run a development server, that automatically updates the static assets and reloads when we change source content. There is a separate package needed to run the development server.

```
npm i -S webpack-dev-server
```

Some of our configuration for the server is in the `webpack.config.js` file.

```
config.devServer = {
  contentBase: paths.build,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  }
}
```

One way we can run the webpack-dev-server is through the CLI with `./node_modules/.bin/webpack-dev-server --progress`.

### Production

When you are ready to deploy your application to a server, it's a good idea to run it through the webpack pipeline in `production` mode. This does things like remove debug code and reduces file size. With webpack it is easy `NODE_ENV=production webpack -p`.

The source map is still being generated with the assumption that it is a development build. We can change that in `webpack.config.js`.

```javascript
const env = process.env.NODE_ENV || 'development'

config.devtool = env === 'production' ? 'cheap-source-map' : 'eval-source-map'
```

## Bonus

There is a plugin that allows you to see breakdown of the modules in a bundle. This can be configured in the `webpack.config.js` file.

```javascript
const BundleAnalyzerWebpackPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

plugins.push(new BundleAnalyzerWebpackPlugin)
```
