import app from './api/index.ts';

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`✅ Local Server running on http://localhost:${PORT}`);
    console.log(`   - API: http://localhost:${PORT}/api`);
});
