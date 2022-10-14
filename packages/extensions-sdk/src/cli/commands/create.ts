import path from 'path';
import chalk from 'chalk';
import fse from 'fs-extra';
import execa from 'execa';
import ora from 'ora';
import {
	EXTENSION_PKG_KEY,
	EXTENSION_LANGUAGES,
	HYBRID_EXTENSION_TYPES,
	EXTENSION_NAME_REGEX,
	EXTENSION_PACKAGE_TYPES,
	PACKAGE_EXTENSION_TYPES,
	EXTENSION_TYPES,
} from '@directus/shared/constants';
import { isIn } from '@directus/shared/utils';
import { ExtensionOptions, ExtensionPackageType } from '@directus/shared/types';
import { log } from '../utils/logger';
import { isLanguage, languageToShort } from '../utils/languages';
import getSdkVersion from '../utils/get-sdk-version';
import getExtensionDevDeps from './helpers/get-extension-dev-deps';
import copyTemplate from './helpers/copy-template';
import inquirer from 'inquirer';
import removePackageScope from '../utils/remove-package-scope';

type CreateOptions = { language?: string };

export default async function create(
	type: string | undefined,
	name: string | undefined,
	options: CreateOptions
): Promise<void> {
	if (!type && !name) {
		const { type, name, language } = await inquirer.prompt<{
			type: ExtensionPackageType;
			name: string;
			language?: string;
		}>([
			{
				type: 'list',
				name: 'type',
				message: 'Choose the extension type',
				choices: EXTENSION_PACKAGE_TYPES,
			},
			{
				type: 'input',
				name: 'name',
				message: 'Choose a name for the extension',
				validate: (name: string) => (removePackageScope(name).length === 0 ? 'Extension name can not be empty.' : true),
			},
			{
				type: 'list',
				name: 'language',
				message: 'Choose the language to use',
				choices: EXTENSION_LANGUAGES,
				when: ({ type }: { type: string }) => isIn(type, EXTENSION_TYPES),
			},
		]);

		await createExtension({ type, name, language });
	} else {
		if (!type) {
			log(`Extension type has to be specified.`, 'error');
			process.exit(1);
		}
		if (!name) {
			log(`Extension name has to be specified.`, 'error');
			process.exit(1);
		}

		if (!isIn(type, EXTENSION_PACKAGE_TYPES)) {
			log(
				`Extension type ${chalk.bold(type)} is not supported. Available extension types: ${EXTENSION_PACKAGE_TYPES.map(
					(t) => chalk.bold.magenta(t)
				).join(', ')}.`,
				'error'
			);
			process.exit(1);
		}

		if (removePackageScope(name).length === 0) {
			log(`Extension name can not be empty.`, 'error');
			process.exit(1);
		}

		await createExtension({ type, name, language: options.language });
	}
}

async function createExtension({
	type,
	name,
	language = 'javascript',
}: {
	type: ExtensionPackageType;
	name: string;
	language?: string;
}) {
	const targetDir = removePackageScope(name);
	const targetPath = path.resolve(targetDir);

	if (await fse.pathExists(targetPath)) {
		const info = await fse.stat(targetPath);

		if (!info.isDirectory()) {
			log(`Destination ${chalk.bold(targetDir)} already exists and is not a directory.`, 'error');
			process.exit(1);
		}

		const files = await fse.readdir(targetPath);

		if (files.length > 0) {
			log(`Destination ${chalk.bold(targetDir)} already exists and is not empty.`, 'error');
			process.exit(1);
		}
	}

	if (isIn(type, PACKAGE_EXTENSION_TYPES)) {
		const spinner = ora(chalk.bold('Scaffolding Directus extension...')).start();

		await fse.ensureDir(targetPath);
		await copyTemplate(type, targetPath);

		const host = `^${getSdkVersion()}`;
		const options: ExtensionOptions =
			type === 'bundle'
				? { type, path: { app: 'dist/app.js', api: 'dist/api.js' }, entries: [], host }
				: { type, host };
		const packageManifest = getPackageManifest(name, options, await getExtensionDevDeps(type));

		await fse.writeJSON(path.join(targetPath, 'package.json'), packageManifest, { spaces: '\t' });

		await execa('npm', ['install'], { cwd: targetPath });

		spinner.succeed(chalk.bold('Done'));

		log(getDoneMessage(type, targetDir, targetPath));
	} else {
		if (!isLanguage(language)) {
			log(
				`Language ${chalk.bold(language)} is not supported. Available languages: ${EXTENSION_LANGUAGES.map((t) =>
					chalk.bold.magenta(t)
				).join(', ')}.`,
				'error'
			);
			process.exit(1);
		}

		const spinner = ora(chalk.bold('Scaffolding Directus extension...')).start();

		await fse.ensureDir(targetPath);
		await copyTemplate(type, targetPath, 'src', language);

		const host = `^${getSdkVersion()}`;
		const options: ExtensionOptions = isIn(type, HYBRID_EXTENSION_TYPES)
			? {
					type,
					path: { app: 'dist/app.js', api: 'dist/api.js' },
					source: { app: `src/app.${languageToShort(language)}`, api: `src/api.${languageToShort(language)}` },
					host,
			  }
			: {
					type,
					path: 'dist/index.js',
					source: `src/index.${languageToShort(language)}`,
					host,
			  };
		const packageManifest = getPackageManifest(name, options, await getExtensionDevDeps(type, language));

		await fse.writeJSON(path.join(targetPath, 'package.json'), packageManifest, { spaces: '\t' });

		await execa('npm', ['install'], { cwd: targetPath });

		spinner.succeed(chalk.bold('Done'));

		log(getDoneMessage(type, targetDir, targetPath));
	}
}

function getPackageManifest(name: string, options: ExtensionOptions, deps: Record<string, string>) {
	return {
		name: EXTENSION_NAME_REGEX.test(name) ? name : `directus-extension-${name}`,
		version: '1.0.0',
		keywords: ['directus', 'directus-extension', `directus-custom-${options.type}`],
		[EXTENSION_PKG_KEY]: options,
		scripts: {
			build: 'directus-extension build',
			dev: 'directus-extension build -w --no-minify',
		},
		devDependencies: deps,
	};
}

function getDoneMessage(type: ExtensionPackageType, targetDir: string, targetPath: string) {
	return `
Your ${type} extension has been created at ${chalk.green(targetPath)}

To start developing, run:
	${chalk.blue('cd')} ${targetDir}
	${chalk.blue('npm run')} dev

and then to build for production, run:
	${chalk.blue('npm run')} build
`;
}
