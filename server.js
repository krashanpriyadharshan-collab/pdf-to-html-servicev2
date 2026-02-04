import express from 'express';
import multer from 'multer';
import { execFile } from 'child_process';
import { mkdtemp, readFile, writeFile, rm } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Ensure uploads directory exists
const UPLOADS_DIR = join(__dirname, 'uploads');
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR);

app.use(express.static(__dirname)); // Serve index.html and static assets
app.use('/uploads', express.static(UPLOADS_DIR));

app.post('/api/convert', upload.single('pdf'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

    const fileId = Date.now().toString();
    const workDir = await mkdtemp(join(tmpdir(), 'pdf2html-'));
    const pdfPath = join(workDir, 'input.pdf');
    const outFileName = `${fileId}.html`;
    const outPath = join(UPLOADS_DIR, outFileName);

    try {
        await writeFile(pdfPath, req.file.buffer);

        // Run pdf2htmlEX
        await new Promise((resolve, reject) => {
            execFile('pdf2htmlEX', [
                '--zoom', '1.3',
                '--embed-css', '1',
                '--embed-font', '1',
                '--embed-image', '1',
                '--embed-javascript', '1',
                '--embed-outline', '0',
                '--no-drm', '1',
                '--dest-dir', UPLOADS_DIR,
                pdfPath,
                outFileName
            ], (err, stdout, stderr) => {
                if (err) {
                    console.error('pdf2htmlEX error:', stderr);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        res.json({ url: `/uploads/${outFileName}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Conversion failed' });
    } finally {
        await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`- Place your index.html in this directory`);
    console.log(`- PDF uploads are stored in /uploads`);
});
