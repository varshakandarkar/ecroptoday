const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require ('html-webpack-plugin');

module.exports = {
  entry: {
    homepage: './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'), // Use absolute path
    filename: 'app.js',
    assetModuleFilename: 'images/[name][ext]', // Output images in a separate folder
  },

  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')], // Update to modules
    extensions: ['.js', '.jsx'] // Remove empty string
  },

  module: {
    rules: [  
        {
            test:/\.js$/,
            exclude:/node_modules/,
            use:{
                loader:'babel-loader',
                options:{
                    presets:['@babel/preset-env','@babel/preset-react']
                }
            }

        },
      {
        test: /\.(css|scss)$/,
        use:[
            'style-loader','css-loader'
            ]
      },
      { test: /\.(png|jpg|jpeg|gif|svg|webp|webm|mp4|pdf)$/,
        type:"asset/resource" ,
          },
          {
            test: /\.json$/,
            type: 'javascript/auto',  
            use: 'json-loader',       
        },
     ]
  },

  plugins: [
    new HtmlWebpackPlugin (
        {
            template:'./public/index.html'
        }
    ),
    new MiniCssExtractPlugin(),

    // new MiniCssExtractPlugin({
    //     filename: 'app.css' // Output CSS file
    //   })
  ],

  devServer:{
    static:{
        directory:path.join(__dirname,'dist')
    },
    compress: true,
    port:3005,
    historyApiFallback: true,
 }
};