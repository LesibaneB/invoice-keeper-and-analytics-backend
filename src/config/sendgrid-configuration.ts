import * as yaml from 'js-yaml';
import { join } from 'path';
import * as fs from 'fs';

const YAML_CONFIG_VALUES_FILENAME = 'sendgrid-values.yml'

export function getSendGridConfig() {
  return yaml.load(
    fs.readFileSync(
      join(`${__dirname}/values`, YAML_CONFIG_VALUES_FILENAME),
      'utf8',
    ),
  )
}