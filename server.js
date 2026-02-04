import express from 'express';
import multer from 'multer';
import cors from 'cors'; // Import CORS
import { execFile } from 'child_process';
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const app = express();

// ✅ FIX: Enable CORS for ALL domains
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => res.send('PDF Backend is Running!'));

app.post('/convert', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

    const workDir = await mkdtemp(join(tmpdir(), 'p2h-'));
    const pdfPath = join(workDir, 'input.pdf');
    const htmlPath = join(workDir, 'output.html');

    try {
        await writeFile(pdfPath, req.file.buffer);

        await new Promise((resolve, reject) => {
            execFile('pdf2htmlEX', [
                '--zoom', '1.3',
                '--embed-css', '1',
                '--embed-font', '1',
                '--embed-image', '1',
                '--embed-javascript', '1',
                '--embed-outline', '0',
                '--no-drm', '1',
                '--dest-dir', workDir,
                pdfPath,
                'output.html'
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const html = await readFile(htmlPath, 'utf-8');
        res.json({ html });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Conversion failed' });
    } finally {
        await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
