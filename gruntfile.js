module.exports = grunt => {
  const pathUtil = require('path');
  const configPath = pathUtil.join(process.cwd(), 'grunt');
  const config = grunt.file.readYAML(pathUtil.join(configPath, 'config.yaml'));
  config.env = process.env;

  require('load-grunt-config')(grunt, {
    jitGrunt: true,
    configPath: configPath,
    config: config
  });

};
