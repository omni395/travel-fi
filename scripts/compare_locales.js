import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getKeys(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            return [...acc, ...getKeys(obj[key], newPrefix)];
        }
        return [...acc, newPrefix];
    }, []);
}

const enJson = JSON.parse(readFileSync(resolve(__dirname, '../i18n/locales/en.json')));
const ruJson = JSON.parse(readFileSync(resolve(__dirname, '../i18n/locales/ru.json')));
const esJson = JSON.parse(readFileSync(resolve(__dirname, '../i18n/locales/es.json')));
const zhJson = JSON.parse(readFileSync(resolve(__dirname, '../i18n/locales/zh.json')));

const enKeys = new Set(getKeys(enJson));
const ruKeys = new Set(getKeys(ruJson));
const esKeys = new Set(getKeys(esJson));
const zhKeys = new Set(getKeys(zhJson));

console.log('Missing in ru.json:');
[...enKeys].filter(key => !ruKeys.has(key)).forEach(key => console.log(key));

console.log('\nMissing in es.json:');
[...enKeys].filter(key => !esKeys.has(key)).forEach(key => console.log(key));

console.log('\nMissing in zh.json:');
[...enKeys].filter(key => !zhKeys.has(key)).forEach(key => console.log(key));

console.log('\nExtra in ru.json:');
[...ruKeys].filter(key => !enKeys.has(key)).forEach(key => console.log(key));

console.log('\nExtra in es.json:');
[...esKeys].filter(key => !enKeys.has(key)).forEach(key => console.log(key));

console.log('\nExtra in zh.json:');
[...zhKeys].filter(key => !enKeys.has(key)).forEach(key => console.log(key));