'use strict';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');

// Get environment variables to inject into our app.
const env = getClientEnvironment();

const libDirectory = fs.realpathSync(process.cwd());
const resolvePath = relativePath => path.resolve(libDirectory, relativePath);

const libBuild = resolvePath('dist');
const libIndexJs = resolvePath('src/framework/index.js');
const libPackageJson = resolvePath('package.json');
const libSrc = resolvePath('src');

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
  mode: 'development',
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps.
  devtool: 'source-map',
  entry: libIndexJs,
  output: {
    // The build folder.
    path: libBuild,
    publicPath: '/dist/',
    filename: 'index.js',
    library: '',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebook/create-react-app/issues/253
    modules: ['node_modules'].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.js'],
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(libSrc, [libPackageJson]),
    ],
    alias: {
      'react': resolvePath('./node_modules/react'),
      'react-dom': resolvePath('./node_modules/react-dom'),
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      { parser: { requireEnsure: false } },
      // Process application JS with Babel.
      // The preset includes JSX, Flow, and some ESnext features.
      {
        test: /\.(js|jsx)$/,
        include: libSrc,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              presets: [require.resolve('babel-preset-react-app')],
              cacheDirectory: true,
              compact: true,
              highlightCode: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(env.stringified),
  ],
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    }
  },
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  performance: false,
};
