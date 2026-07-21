import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
  console.log(`${'═'.repeat(50)}\n`);
});
