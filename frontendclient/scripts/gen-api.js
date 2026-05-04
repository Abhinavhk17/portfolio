const { spawnSync } = require('node:child_process');
const http = require('node:http');

function checkOpenApi(url) {
	return new Promise((resolve) => {
		const req = http.get(url, (res) => {
			resolve(res.statusCode === 200);
		});
		req.on('error', () => resolve(false));
		req.setTimeout(3000, () => {
			req.destroy();
			resolve(false);
		});
	});
}

async function main() {
	const url = 'http://localhost:8082/v3/api-docs';
	const available = await checkOpenApi(url);
	if (!available) {
		console.log('[gen-api] Backend not reachable, skipping client generation.');
		process.exit(0);
	}
	console.log('[gen-api] Generating Angular client from', url);
	const result = spawnSync('npx', [
		'--yes',
		'@openapitools/openapi-generator-cli',
		'generate',
		'-g', 'typescript-angular',
		'-i', url,
		'-o', 'src/app/generated',
		'--additional-properties=ngVersion=20,providedInRoot=true,withSeparateModelsAndApi=true,modelSuffix=Dto'
	], { stdio: 'inherit', shell: true });
	process.exit(result.status ?? 0);
}

main();



