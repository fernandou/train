#!/usr/bin/env node
const program = require('commander')
const packageJson = require('../package.json')
const query = require('../lib/query')

program.version(packageJson.version)

program
  .command('query <from> <to> <time>')
  .argument('[train]', '火车类型：高铁、动车、普通（直达、特快等）', 'GDZTK')
  .description('查询当天的火车时刻、票价')
  .action(query)
  .option('-L, --lishi', '按照耗时排序')

program
  .parse(process.argv)
