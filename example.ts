import { v } from './src/index';

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
