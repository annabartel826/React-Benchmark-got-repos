import test from 'ava';
import got from '../';
import {createServer} from './_server';

let s;
let trys = 0;
let knocks = 0;

test.before('setup', async t => {
	s = await createServer();

	s.on('/long', () => {});

	s.on('/knock-twice', (req, res) => {
		if (knocks++ === 1) {
			res.end('who`s there?');
		}
	});

	s.on('/try-me', () => {
		trys++;
	});

	await s.listen(s.port);
});

test('works on timeout error', async t => {
	t.is((await got(`${s.url}/knock-twice`, {timeout: 1000})).body, 'who`s there?');
});

test('can be disabled with option', async t => {
	try {
		await got(`${s.url}/try-me`, {timeout: 1000, retries: 0});
	} catch (err) {
		t.ok(err);
	}

	t.is(trys, 1);
});

test.after('cleanup', async t => {
	await s.close();
});
