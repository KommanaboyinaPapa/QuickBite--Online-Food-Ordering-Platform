module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo'],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@screens': './src/screens',
            '@components': './src/components',
            '@redux': './src/redux',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@styles': './src/styles',
            '@types': './src/types',
            '@assets': './assets',
            '@navigation': './src/navigation',
          },
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
