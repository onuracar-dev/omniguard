import { signJWT, v, verifyJWT } from './src/index';

console.log('--- OmniGuard Example ---');

const userSchema = v.string().min(5).max(20).email();

try {
  console.log('Parsing valid email:');
  const result = userSchema.parse('test@example.com');
  console.log('Result:', result);
} catch (e: any) {
  console.error('Error:', e.message);
}

console.log('\n--- Safe Parse ---');
const safeResult = userSchema.safeParse('a@b.c');
if (!safeResult.success) {
  console.log('Validation Failed! Issues:');
  console.log(safeResult.error.issues);
} else {
  console.log('Success:', safeResult.data);
}

console.log('\n--- Focused HS256 JWT ---');
const jwtSecret = 'replace-with-a-random-secret-of-at-least-32-bytes';
const token = await signJWT(
  { role: 'reader' },
  jwtSecret,
  { audience: 'example', expiresInSeconds: 300, issuer: 'omniguard-example', subject: 'user-1' },
);
const claims = await verifyJWT(token, jwtSecret, {
  audience: 'example',
  issuer: 'omniguard-example',
  requireExpiration: true,
});
console.log('Verified claims:', claims);
